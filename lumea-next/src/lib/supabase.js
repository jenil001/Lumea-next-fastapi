import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables missing. Check .env.local configuration.')
}

// Client-side Supabase instance (available in Components)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side Supabase instance (Use ONLY in API routes / Server Components)
// This uses the service_role key to bypass RLS for admin tasks if needed.
export const getAdminSupabase = () => {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing in server environment.')
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in server environment.')
  }
  return createClient(supabaseUrl, serviceKey)
}
