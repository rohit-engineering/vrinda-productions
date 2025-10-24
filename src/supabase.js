import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

// --- configure these from your project ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

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
