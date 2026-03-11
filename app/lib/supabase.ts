import { createClient } from '@supabase/supabase-js'

// Vložíme adresy přímo, aby je Next.js nemohl ignorovat
const supabaseUrl = 'https://pjsyhytdguulabssuxmo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqc3loeXRkZ3V1bGFic3N1eG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzc2MjcsImV4cCI6MjA4ODgxMzYyN30.YoSsNMoB8jrenlVRsNisHQN2SV1R76f8bRLnS3ET_IM'

export const supabase = createClient(supabaseUrl, supabaseKey)