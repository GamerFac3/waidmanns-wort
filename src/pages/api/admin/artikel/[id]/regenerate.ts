import type { APIRoute } from 'astro';
import { getUser, supabase, supabaseAdmin } from '../../../../../lib/supabase';
import { generateArticleContent } from '../../../../../lib/claude';

export const POST: APIRoute = async ({ params, cookies }) => {
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
		// Get article title info
		const { data: titleData, error: titleError } = await supabase
			.from('article_titles')
			.select('*')
			.eq('id', id)
			.single();

		if (titleError || !titleData) {
			return new Response(JSON.stringify({ error: 'Article not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Generate new content
		const content = await generateArticleContent(
			titleData.title,
			titleData.description,
			titleData.category
		);

		// Check if article exists
		const { data: existingArticle } = await supabaseAdmin
			.from('articles')
			.select('id')
			.eq('title_id', id)
			.single();

		if (existingArticle) {
			// Update existing
			await supabaseAdmin
				.from('articles')
				.update({ content, generated_at: new Date().toISOString() })
				.eq('title_id', id);
		} else {
			// Insert new
			await supabaseAdmin
				.from('articles')
				.insert({ title_id: id, content });

			// Mark as generated
			await supabaseAdmin
				.from('article_titles')
				.update({ is_generated: true })
				.eq('id', id);
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Regenerate error:', error);
		return new Response(JSON.stringify({ error: 'Generation failed' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
