// Supabase sync: pure mappers (database rows <-> State) and the calls that read and write them.
// The mappers have no I/O and are tested. The functions below them take the client as an argument.
import type { SupabaseClient } from '@supabase/supabase-js';
import { dateKey, type Item, type Kind, type State } from './day';

export type CircleRow = { id: string; name: string; pair_code: string; demo_offset: number | string };
export type ItemRow = {
  id: string;
  circle_id: string;
  time: string;
  title: string;
  kind: Kind;
  date: string | null;
  photo: string | null;
  important: boolean;
  who: string | null;
  relation: string | null;
};
export type CompletionRow = { circle_id: string; item_id: string; date_key: string; done_at: number | string };

export const PHOTO_BUCKET = 'photos';
const SIGNED_SECONDS = 3600;
/** Keep the history short, like the local store. One day extra so a demo clock jump still finds its day. */
const HISTORY_DAYS = 8;

// ---------- Pure mappers ----------

/** A photo is a storage path unless it is a data URL (local, not uploaded yet) or a full URL. */
export function isStoragePath(photo?: string | null): photo is string {
  return !!photo && !/^(data:|https?:|blob:)/.test(photo);
}

/** Where an item's photo lives in the bucket. */
export function photoPath(circleId: string, itemId: string): string {
  return `${circleId}/${itemId}.jpg`;
}

/** Oldest day key (inclusive) that is still loaded. */
export function historyStart(now: number): string {
  return dateKey(now - HISTORY_DAYS * 86_400_000);
}

/** `photoUrl` is the signed URL for the row's storage path, when it has one. */
export function rowToItem(row: ItemRow, photoUrl?: string): Item {
  const photo = photoUrl ?? (row.photo && !isStoragePath(row.photo) ? row.photo : undefined);
  return {
    id: row.id,
    time: row.time,
    title: row.title,
    kind: row.kind,
    ...(row.date ? { date: row.date } : {}),
    ...(photo ? { photo } : {}),
    ...(row.important ? { important: true } : {}),
    ...(row.who ? { who: row.who } : {}),
    ...(row.relation ? { relation: row.relation } : {}),
  };
}

/** `photo` is what goes in the column: a storage path, or nothing. */
export function itemToRow(item: Item, circleId: string, photo?: string): ItemRow {
  return {
    id: item.id,
    circle_id: circleId,
    time: item.time,
    title: item.title,
    kind: item.kind,
    date: item.date ?? null,
    photo: photo ?? null,
    important: !!item.important,
    who: item.who ?? null,
    relation: item.relation ?? null,
  };
}

/** done[dateKey][itemId] = done_at */
export function completionsToDone(rows: CompletionRow[]): State['done'] {
  const done: State['done'] = {};
  for (const r of rows) (done[r.date_key] ??= {})[r.item_id] = Number(r.done_at);
  return done;
}

/** Everything one circle holds, in the shape the UI already uses. `urls` maps storage path to signed URL. */
export function buildState(circle: CircleRow, items: ItemRow[], completions: CompletionRow[], urls: Record<string, string> = {}): State {
  const offset = Number(circle.demo_offset) || 0;
  return {
    name: circle.name,
    items: items.map((r) => rowToItem(r, isStoragePath(r.photo) ? urls[r.photo] : undefined)),
    done: completionsToDone(completions),
    ...(offset ? { offset } : {}),
  };
}

// ---------- Reading ----------

const urlCache = new Map<string, { url: string; until: number }>();

/** Signed URLs for storage paths, cached so the image does not reload on every sync. */
async function signedUrls(sb: SupabaseClient, paths: string[]): Promise<Record<string, string>> {
  const now = Date.now();
  const out: Record<string, string> = {};
  const missing: string[] = [];
  for (const p of new Set(paths)) {
    const hit = urlCache.get(p);
    if (hit && hit.until > now) out[p] = hit.url;
    else missing.push(p);
  }
  if (missing.length) {
    const { data } = await sb.storage.from(PHOTO_BUCKET).createSignedUrls(missing, SIGNED_SECONDS);
    for (const r of data ?? []) {
      if (!r.path || !r.signedUrl) continue;
      out[r.path] = r.signedUrl;
      urlCache.set(r.path, { url: r.signedUrl, until: now + (SIGNED_SECONDS - 600) * 1000 });
    }
  }
  return out;
}

/** Load the circle, its items and the last days of completions. Throws on a database error. */
export async function fetchState(sb: SupabaseClient, circleId: string): Promise<State> {
  const [circle, items, completions] = await Promise.all([
    sb.from('circle').select('id,name,pair_code,demo_offset').eq('id', circleId).single(),
    sb.from('item').select('*').eq('circle_id', circleId),
    sb.from('completion').select('*').eq('circle_id', circleId).gte('date_key', historyStart(Date.now())),
  ]);
  const error = circle.error ?? items.error ?? completions.error;
  if (error) throw new Error(error.message);
  const itemRows = items.data as ItemRow[];
  const urls = await signedUrls(sb, itemRows.map((r) => r.photo).filter(isStoragePath));
  return buildState(circle.data as CircleRow, itemRows, completions.data as CompletionRow[], urls);
}

// ---------- Writing ----------

export type Write =
  | { type: 'toggle'; id: string; key: string; at: number; wasDone: boolean }
  | { type: 'add'; item: Item }
  | { type: 'remove'; id: string; hadPhoto?: boolean }
  | { type: 'setName'; name: string }
  | { type: 'setOffset'; offset: number }
  | { type: 'demo'; items: Item[]; name: string }
  | { type: 'reset' };

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/** Upload a data URL photo and return its storage path. */
async function uploadPhoto(sb: SupabaseClient, circleId: string, itemId: string, dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = photoPath(circleId, itemId);
  const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  check(error);
  return path;
}

/** Best effort: remove every photo of the circle (after "Alles wissen" or a new demo day). Never throws. */
async function removeAllPhotos(sb: SupabaseClient, circleId: string) {
  try {
    const { data } = await sb.storage.from(PHOTO_BUCKET).list(circleId, { limit: 1000 });
    const paths = (data ?? []).filter((f) => f.id).map((f) => `${circleId}/${f.name}`);
    if (paths.length) await sb.storage.from(PHOTO_BUCKET).remove(paths);
  } catch {
    // ignore: a leftover file must never make the change fail
  }
}

async function insertItems(sb: SupabaseClient, circleId: string, items: Item[]) {
  const rows: ItemRow[] = [];
  for (const item of items) {
    // Upload first: the row only ever points at a file that exists.
    const photo = item.photo?.startsWith('data:') ? await uploadPhoto(sb, circleId, item.id, item.photo) : undefined;
    rows.push(itemToRow(item, circleId, photo));
  }
  if (rows.length) check((await sb.from('item').insert(rows)).error);
}

/** Mirror one change to the database. Throws when it fails. */
export async function write(sb: SupabaseClient, circleId: string, w: Write): Promise<void> {
  switch (w.type) {
    case 'toggle':
      if (w.wasDone) {
        check((await sb.from('completion').delete().eq('item_id', w.id).eq('date_key', w.key)).error);
      } else {
        const row: CompletionRow = { circle_id: circleId, item_id: w.id, date_key: w.key, done_at: w.at };
        check((await sb.from('completion').upsert(row, { onConflict: 'item_id,date_key' })).error);
      }
      return;
    case 'add':
      return insertItems(sb, circleId, [w.item]);
    case 'remove':
      check((await sb.from('item').delete().eq('id', w.id)).error);
      if (w.hadPhoto) {
        // Best effort: a leftover file must never make the removal fail.
        try {
          await sb.storage.from(PHOTO_BUCKET).remove([photoPath(circleId, w.id)]);
        } catch {
          // ignore
        }
      }
      return;
    case 'setName':
      check((await sb.from('circle').update({ name: w.name }).eq('id', circleId)).error);
      return;
    case 'setOffset':
      check((await sb.from('circle').update({ demo_offset: w.offset }).eq('id', circleId)).error);
      return;
    case 'demo':
      check((await sb.from('item').delete().eq('circle_id', circleId)).error);
      await removeAllPhotos(sb, circleId);
      await insertItems(sb, circleId, w.items);
      check((await sb.from('circle').update({ name: w.name }).eq('id', circleId)).error);
      return;
    case 'reset':
      check((await sb.from('completion').delete().eq('circle_id', circleId)).error);
      check((await sb.from('item').delete().eq('circle_id', circleId)).error);
      await removeAllPhotos(sb, circleId);
      return;
  }
}

/**
 * Live changes: calls `onChange` when items, completions or the circle change. Returns the unsubscribe function.
 * `isOurs(id)` tells whether an item id belongs to this circle, to skip delete events of other circles.
 */
export function subscribe(sb: SupabaseClient, circleId: string, onChange: () => void, isOurs: (itemId: string) => boolean): () => void {
  const filtered = (table: string, column: string) => ({ event: '*' as const, schema: 'public', table, filter: `${column}=eq.${circleId}` });
  // Supabase cannot filter DELETE events, so deletes come in unfiltered with only the primary key. Skip the ones of other circles.
  const deletes = (table: string) => ({ event: 'DELETE' as const, schema: 'public', table });
  const onDelete = (p: { old: Record<string, unknown> }) => {
    const id = p.old?.id ?? p.old?.item_id;
    if (typeof id !== 'string' || isOurs(id)) onChange();
  };
  // A unique topic: supabase-js hands back an existing channel with the same name, and the old one may still be closing.
  const channel = sb
    .channel(`circle:${circleId}:${crypto.randomUUID()}`)
    .on('postgres_changes', filtered('item', 'circle_id'), onChange)
    .on('postgres_changes', filtered('completion', 'circle_id'), onChange)
    .on('postgres_changes', filtered('circle', 'id'), onChange)
    .on('postgres_changes', deletes('item'), onDelete)
    .on('postgres_changes', deletes('completion'), onDelete)
    .subscribe();
  return () => {
    void sb.removeChannel(channel);
  };
}
