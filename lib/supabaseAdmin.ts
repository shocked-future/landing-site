import { createClient } from '@supabase/supabase-js';

// Ensure these are set in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_ENIGMA_AUTH_URL;
const supabaseServiceKey = process.env.ENIGMA_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env var: NEXT_PUBLIC_ENIGMA_AUTH_URL');
}
if (!supabaseServiceKey) {
  throw new Error('Missing env var: ENIGMA_SERVICE_ROLE_KEY');
}

// This Admin client can bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);