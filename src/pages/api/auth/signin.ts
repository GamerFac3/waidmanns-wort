import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return new Response(JSON.stringify({ error: 'Email und Passwort erforderlich' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const supabase = createClient(supabaseUrl, supabaseAnonKey);

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Set auth cookies
		const { access_token, refresh_token } = data.session;

		cookies.set('sb-access-token', access_token, {
			path: '/',
			httpOnly: true,
			secure: import.meta.env.PROD,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 1 week
		});

		cookies.set('sb-refresh-token', refresh_token, {
			path: '/',
			httpOnly: true,
			secure: import.meta.env.PROD,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 1 week
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Login fehlgeschlagen' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
