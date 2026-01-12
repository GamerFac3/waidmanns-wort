import type { APIRoute } from 'astro';
import { getUser, supabaseAdmin } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = await getUser(cookies);
	if (!user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (!supabaseAdmin) {
		return new Response(JSON.stringify({ error: 'Server configuration error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const { title, description, category, image_url } = await request.json();

		if (!title || !description || !category) {
			return new Response(JSON.stringify({ error: 'Missing required fields' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { data, error } = await supabaseAdmin
			.from('article_titles')
			.insert({
				title,
				description,
				category,
				image_url: image_url || null,
			})
			.select()
			.single();

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true, id: data.id }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Invalid request' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
