// Browser client for Supabase. Without both env vars the app stays in local mode (localStorage).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when both env vars are set: the app then syncs through Supabase. */
export const supabaseEnabled = !!url && !!anonKey;

/** The shared client, or null in local mode. */
export const supabase: SupabaseClient | null = supabaseEnabled ? createClient(url, anonKey) : null;
