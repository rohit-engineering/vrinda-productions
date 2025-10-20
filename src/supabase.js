import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://xzlauujnjkrtertxauyo.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bGF1dWpuamtydGVydHhhdXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDYxMjksImV4cCI6MjA3NjQyMjEyOX0.FAMmbufk_3EWf6klcgHpwDekODgU1JtBX_b08S2EwnQ"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
