/* agent-notes: { ctx: "Supabase client initialization for browser and server runtime", deps: ["@supabase/supabase-js", src/types/database.ts], state: active, last: "tara@2026-07-23" } */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock_anon_key';

/**
 * Public Supabase Client (Anon Key)
 */
export const supabase = createClient<Database>(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);
