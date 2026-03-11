import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Tohle nám do terminálu vypíše, jestli ty klíče vidí (jen pro test)
if (!supabaseUrl || !supabaseKey) {
  console.log("CHYBA: Klíče v .env.local nebyly nalezeny!");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseKey || ''
)