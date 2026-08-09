/* agent-notes: { ctx: "Supabase server client getter with build fallback", deps: ["@supabase/supabase-js"], state: active, last: "sato@2026-08-09" } */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (serverClient) return serverClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  serverClient = createClient(url, anon, { auth: { persistSession: false } });
  return serverClient;
}


