import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { AstroCookies } from 'astro';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

// Public client for read operations (uses anon key, respects RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client for write operations (uses service role key, bypasses RLS)
// Only use this in server-side code (API routes, SSR pages)
export const supabaseAdmin = supabaseServiceKey
	? createClient<Database>(supabaseUrl, supabaseServiceKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		})
	: null;

// Helper to check if user is authenticated using cookie-based tokens
export async function getUser(cookies: AstroCookies) {
	const accessToken = cookies.get('sb-access-token')?.value;
	const refreshToken = cookies.get('sb-refresh-token')?.value;

	if (!accessToken) return null;

	const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

	// Set the session from cookies
	const { data: { user }, error } = await supabaseAuth.auth.getUser(accessToken);

	if (error || !user) {
		// Try to refresh the token
		if (refreshToken) {
			const { data: refreshData, error: refreshError } = await supabaseAuth.auth.refreshSession({
				refresh_token: refreshToken,
			});

			if (!refreshError && refreshData.session) {
				// Update cookies with new tokens
				cookies.set('sb-access-token', refreshData.session.access_token, {
					path: '/',
					httpOnly: true,
					secure: import.meta.env.PROD,
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 7,
				});
				cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
					path: '/',
					httpOnly: true,
					secure: import.meta.env.PROD,
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 7,
				});
				return refreshData.user;
			}
		}
		return null;
	}

	return user;
}

// Types for our data
export interface ArticleTitle {
	id: string;
	title: string;
	description: string;
	category: string;
	created_at: string;
	is_generated: boolean;
}

export interface Article {
	id: string;
	title_id: string;
	title: string;
	description: string;
	category: string;
	content: string;
	generated_at: string;
}
