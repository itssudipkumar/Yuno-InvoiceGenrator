import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabaseConfigured = Boolean(url && key)

export const supabase = createClient(url || 'http://localhost:1', key || 'not-configured', {
  global: supabaseConfigured ? {} : {
    fetch: async () => { throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') },
  },
})
