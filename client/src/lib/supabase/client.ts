import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}

// Singleton client for client-side use
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}
