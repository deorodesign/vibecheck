import { createClient } from '@supabase/supabase-js'

// Vložíme adresy přímo, aby je Next.js nemohl ignorovat
const supabaseUrl = 'https://pjsyhytdguulabssuxmo.supabase.co'
const supabaseKey = 'sb_publishable_qrGR0kONERt1eWf7opyV3w_JdHwVF8M'

export const supabase = createClient(supabaseUrl, supabaseKey)