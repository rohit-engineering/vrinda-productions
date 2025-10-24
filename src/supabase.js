import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

// --- configure these from your project ---
const SUPABASE_URL = "https://xzlauujnjkrtertxauyo.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bGF1dWpuamtydGVydHhhdXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDYxMjksImV4cCI6MjA3NjQyMjEyOX0.FAMmbufk_3EWf6klcgHpwDekODgU1JtBX_b08S2EwnQ"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Reactive session ref used by components
export const session = ref(null)

// initialize session once
;(async function initSession(){
  try {
    const { data } = await supabase.auth.getSession()
    session.value = data?.session ?? data ?? null
  } catch (e) {
    console.warn('supabase initSession err', e)
    session.value = null
  }
})()

// keep session updated on auth changes
supabase.auth.onAuthStateChange((_event, payload) => {
  const s = payload?.session ?? payload ?? null
  session.value = s
})
