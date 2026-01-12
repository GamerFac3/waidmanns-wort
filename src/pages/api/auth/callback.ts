import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const supabase = createSupabaseServerClient(cookies);
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error && data.session) {
			// Store tokens in cookies
			cookies.set('sb-access-token', data.session.access_token, {
				path: '/',
				httpOnly: true,
				secure: import.meta.env.PROD,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7,
			});
			cookies.set('sb-refresh-token', data.session.refresh_token, {
				path: '/',
				httpOnly: true,
				secure: import.meta.env.PROD,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7,
			});
		}
	}

	return redirect('/admin');
};
