import { createClient } from "@supabase/supabase-js";

const enigmaUrl = process.env.NEXT_PUBLIC_ENIGMA_AUTH_URL!;
const enigmaKey = process.env.NEXT_PUBLIC_ENIGMA_AUTH_ANON_KEY!;

if (!enigmaUrl || !enigmaKey) {
  console.error("Enigma Auth keys are missing in .env.local");
}

// This client is strictly for Authentication
export const enigmaAuth = createClient(enigmaUrl, enigmaKey);
