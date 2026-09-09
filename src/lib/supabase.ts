import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

let isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let supabase: any

if (isSupabaseConfigured) {
	supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
	// Provide a safe no-op stub so app doesn't crash in the browser when env vars are missing.
	// Methods return a consistent { data, error } shape where appropriate.
	console.warn('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env')
	const makeErr = (msg = 'Supabase not configured') => ({ data: null, error: new Error(msg) })

	supabase = {
		_configured: false,
		auth: {
			signIn: async () => makeErr(),
			signUp: async () => makeErr(),
			signOut: async () => makeErr(),
			onAuthStateChange: (_: any) => ({ data: null, subscription: { unsubscribe: () => {} } }),
		},
		from: (_: string) => ({
			select: async () => makeErr(),
			insert: async () => makeErr(),
			update: async () => makeErr(),
			delete: async () => makeErr(),
			upsert: async () => makeErr(),
			order: () => ({ select: async () => makeErr() }),
		}),
		storage: {
			from: (_: string) => ({
				upload: async () => makeErr(),
				getPublicUrl: (_: string) => ({ publicURL: '' }),
				remove: async () => makeErr(),
				list: async () => makeErr(),
			}),
		},
		rpc: async () => makeErr(),
	}
}

export { supabase, isSupabaseConfigured }
