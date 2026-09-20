import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Without these the app fails in confusing ways, so say what's wrong instead.
// Locally: copy .env.example to .env. On Vercel: set both under
// Project settings -> Environment Variables, then redeploy.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env (locally) or set them in your host\'s ' +
      'environment variables, then restart the build.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
