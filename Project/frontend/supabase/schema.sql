-- Anker: Supabase schema. Run the whole file in the Supabase SQL editor. Safe to run again.
--
-- Dashboard settings this file cannot do for you:
--   Authentication > Providers > Anonymous: enable "Allow anonymous sign-ins" (the tablet signs in that way).
--   Authentication > Providers > Email: for a quick demo you can switch off "Confirm email".

-- ---------- Tables ----------

create table if not exists public.circle (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '',            -- name of the person with dementia
  pair_code   text not null unique check (char_length(pair_code) = 6),
  demo_offset bigint not null default 0,           -- demo clock shift in ms, shared by all devices
  created_at  timestamptz not null default now()
);

create table if not exists public.member (
  circle_id uuid not null references public.circle (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  role      text not null check (role in ('caregiver', 'tablet')),
  primary key (circle_id, user_id)
);
create index if not exists member_user_idx on public.member (user_id);

create table if not exists public.item (
  id         uuid primary key default gen_random_uuid(),
  circle_id  uuid not null references public.circle (id) on delete cascade,
  time       text not null check (time ~ '^\d{2}:\d{2}$'),
  title      text not null,
  kind       text not null check (kind in ('medicijn', 'maaltijd', 'bezoek', 'afspraak', 'taak')),
  date       text,                                  -- 'YYYY-MM-DD'; null = every day
  photo      text,                                  -- storage path in bucket 'photos'
  important  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, circle_id)
);
create index if not exists item_circle_idx on public.item (circle_id);

-- "Wie is dit?" for visitors: name and relation, e.g. 'Tom' / 'je zoon'.
alter table public.item add column if not exists who      text;
alter table public.item add column if not exists relation text;

create table if not exists public.completion (
  circle_id uuid not null,
  item_id   uuid not null,
  date_key  text not null,                          -- 'YYYY-MM-DD'
  done_at   bigint not null,                        -- ms since epoch
  primary key (item_id, date_key),
  -- The composite key keeps a completion in the same circle as its item.
  foreign key (item_id, circle_id) references public.item (id, circle_id) on delete cascade
);
create index if not exists completion_circle_idx on public.completion (circle_id, date_key);

-- Wrong pair codes per user, so nobody can guess codes in bulk. Only pair_tablet() reads and writes it.
create table if not exists public.pair_attempt (
  user_id uuid not null references auth.users (id) on delete cascade,
  at      timestamptz not null default now()
);
create index if not exists pair_attempt_user_idx on public.pair_attempt (user_id, at);

-- ---------- Helper ----------

-- True when the signed-in user belongs to the circle. Security definer so policies on `member` do not recurse.
create or replace function public.is_member(p_circle uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.member where circle_id = p_circle and user_id = auth.uid()
  );
$$;

-- True when the first folder of a storage path is a circle of the signed-in user.
-- Compares as text: a folder that is not a uuid gives false instead of a cast error.
create or replace function public.is_member_folder(p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.member
    where circle_id::text = (storage.foldername(p_name))[1] and user_id = auth.uid()
  );
$$;

-- ---------- Row Level Security ----------

alter table public.circle     enable row level security;
alter table public.member     enable row level security;
alter table public.item       enable row level security;
alter table public.completion enable row level security;
alter table public.pair_attempt enable row level security; -- no policies: nobody reads it directly

drop policy if exists circle_select on public.circle;
drop policy if exists circle_update on public.circle;
create policy circle_select on public.circle for select to authenticated using (public.is_member(id));
create policy circle_update on public.circle for update to authenticated
  using (public.is_member(id)) with check (public.is_member(id));
-- No insert or delete policy: circles are made by create_circle() only.
-- Members may only change the name and the demo clock, never the id or the pair code.
revoke update on public.circle from anon, authenticated;
grant update (name, demo_offset) on public.circle to authenticated;

drop policy if exists member_select on public.member;
create policy member_select on public.member for select to authenticated using (public.is_member(circle_id));
-- No write policies: members are added by create_circle() and pair_tablet() only.

drop policy if exists item_all on public.item;
create policy item_all on public.item for all to authenticated
  using (public.is_member(circle_id)) with check (public.is_member(circle_id));

drop policy if exists completion_all on public.completion;
create policy completion_all on public.completion for all to authenticated
  using (public.is_member(circle_id)) with check (public.is_member(circle_id));

-- ---------- RPC ----------

-- Random 6 character code without look-alike characters (no 0, O, 1, I, L).
create or replace function public.new_pair_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- 31 characters
  bytes bytea;
  code text;
begin
  loop
    bytes := uuid_send(gen_random_uuid());                      -- 16 random bytes
    code := '';
    for i in 0..5 loop
      code := code || substr(alphabet, (get_byte(bytes, i) % 31) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.circle where pair_code = code);
  end loop;
  return code;
end;
$$;

-- The caregiver makes a circle and becomes its caregiver.
create or replace function public.create_circle(p_name text)
returns public.circle
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.circle;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  -- A tablet (anonymous sign-in) cannot own a circle: it would be lost at the next sign out.
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'not_allowed';
  end if;
  -- A double click must not make a second circle: give back the one the caregiver already has.
  select c0.* into c from public.circle c0
    join public.member m on m.circle_id = c0.id
    where m.user_id = auth.uid() and m.role = 'caregiver'
    order by c0.created_at
    limit 1;
  if found then
    return c;
  end if;
  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'name_required';
  end if;
  insert into public.circle (name, pair_code)
    values (left(btrim(p_name), 30), public.new_pair_code())
    returning * into c;
  insert into public.member (circle_id, user_id, role) values (c.id, auth.uid(), 'caregiver');
  return c;
end;
$$;

-- The tablet joins a circle with the code. Returns the circle id, or null for a wrong code.
-- After 10 wrong codes in 15 minutes it raises 'too_many'.
create or replace function public.pair_tablet(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if (select count(*) from public.pair_attempt
      where user_id = auth.uid() and at > now() - interval '15 minutes') >= 10 then
    raise exception 'too_many';
  end if;
  select id into cid from public.circle where pair_code = upper(btrim(coalesce(p_code, '')));
  if cid is null then
    -- Return null instead of raising: a raise would roll back this insert.
    insert into public.pair_attempt (user_id) values (auth.uid());
    return null;
  end if;
  insert into public.member (circle_id, user_id, role) values (cid, auth.uid(), 'tablet')
    on conflict (circle_id, user_id) do nothing;
  return cid;
end;
$$;

revoke all on function public.create_circle(text) from public, anon;
revoke all on function public.pair_tablet(text) from public, anon;
revoke all on function public.new_pair_code() from public, anon, authenticated;
revoke all on table public.pair_attempt from anon, authenticated;
grant execute on function public.create_circle(text) to authenticated;
grant execute on function public.pair_tablet(text) to authenticated;
-- Anonymous sign-ins get the role "authenticated", so the tablet can call pair_tablet().

-- ---------- Realtime ----------

do $$
declare
  t text;
begin
  foreach t in array array['item', 'completion', 'circle'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- Storage: private bucket for photos ----------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- Files live under "<circle_id>/<file>". Members of that circle can read and write them.
drop policy if exists photos_select on storage.objects;
drop policy if exists photos_insert on storage.objects;
drop policy if exists photos_update on storage.objects;
drop policy if exists photos_delete on storage.objects;

create policy photos_select on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.is_member_folder(name));
create policy photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_member_folder(name));
create policy photos_update on storage.objects for update to authenticated
  using (bucket_id = 'photos' and public.is_member_folder(name))
  with check (bucket_id = 'photos' and public.is_member_folder(name));
create policy photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_member_folder(name));
