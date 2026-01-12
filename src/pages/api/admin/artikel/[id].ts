import type { APIRoute } from 'astro';
import { getUser, supabaseAdmin } from '../../../../lib/supabase';

export const PUT: APIRoute = async ({ params, request, cookies }) => {
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

	const { id } = params;

	try {
		const { title, description, category, content, image_url } = await request.json();

		// Update article title
		const { error: titleError } = await supabaseAdmin
			.from('article_titles')
			.update({
				title,
				description,
				category,
				image_url: image_url || null,
			})
			.eq('id', id);

		if (titleError) {
			return new Response(JSON.stringify({ error: titleError.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Update article content if provided
		if (content !== undefined) {
			const { data: existingArticle } = await supabaseAdmin
				.from('articles')
				.select('id')
				.eq('title_id', id)
				.single();

			if (existingArticle) {
				await supabaseAdmin
					.from('articles')
					.update({ content })
					.eq('title_id', id);
			}
		}

		return new Response(JSON.stringify({ success: true }), {
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

export const DELETE: APIRoute = async ({ params, cookies }) => {
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

	const { id } = params;

	try {
		// Delete article content first (foreign key constraint)
		await supabaseAdmin
			.from('articles')
			.delete()
			.eq('title_id', id);

		// Delete article title
		const { error } = await supabaseAdmin
			.from('article_titles')
			.delete()
			.eq('id', id);

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Delete failed' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
