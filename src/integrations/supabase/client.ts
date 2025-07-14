
import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoded credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ambbtidyplqdzjtzbwac.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtYmJ0aWR5cGxxZHpqdHpid2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTk2NjcsImV4cCI6MjA2Njk3NTY2N30.eKK7nvCc7ACFbL8Xe-uxhRSB6F-5Gfb61AHeTPTYw4E'

// Enhanced client configuration for security
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'onemedi-healthcare@1.0.0'
    }
  }
})
