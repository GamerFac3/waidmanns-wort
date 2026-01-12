import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { generateArticleContent, streamArticleContent, cleanMarkdown } from '../../lib/claude';

// GET: Stream article generation with guaranteed save
export const GET: APIRoute = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return new Response('Missing id parameter', { status: 400 });
	}

	// Get the title info
	const { data: titleData, error: titleError } = await supabase
		.from('article_titles')
		.select('*')
		.eq('id', id)
		.single();

	if (titleError || !titleData) {
		return new Response('Title not found', { status: 404 });
	}

	// Check if article already exists
	const { data: existingArticle } = await supabase
		.from('articles')
		.select('content')
		.eq('title_id', id)
		.single();

	if (existingArticle) {
		return new Response(existingArticle.content, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	}

	// Generate FULLY first (ensures completion even if client disconnects)
	const chunks: string[] = [];
	let fullContent = '';

	try {
		const generator = streamArticleContent(
			titleData.title,
			titleData.description,
			titleData.category
		);

		for await (const chunk of generator) {
			fullContent += chunk;
			chunks.push(chunk);
		}

		// Clean and SAVE IMMEDIATELY before streaming to client
		const cleanedContent = cleanMarkdown(fullContent);

		if (supabaseAdmin) {
			await supabaseAdmin.from('articles').insert({
				title_id: id,
				content: cleanedContent,
			});

			await supabaseAdmin
				.from('article_titles')
				.update({ is_generated: true })
				.eq('id', id);
		}

		// Now stream the saved content to client (simulated streaming for UX)
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				for (const chunk of chunks) {
					controller.enqueue(encoder.encode(chunk));
					// Small delay for streaming effect
					await new Promise(resolve => setTimeout(resolve, 10));
				}
				controller.close();
			},
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-cache',
			},
		});
	} catch (error) {
		console.error('Generation error:', error);
		return new Response('Generation failed', { status: 500 });
	}
};

// POST: Generate article (legacy, non-streaming)

export const POST: APIRoute = async ({ request }) => {
	try {
		if (!supabaseAdmin) {
			return new Response(JSON.stringify({ error: 'Server configuration error: missing service role key' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { titleId } = await request.json();

		if (!titleId) {
			return new Response(JSON.stringify({ error: 'titleId is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Check if article already exists (read with anon key is fine)
		const { data: existingArticle } = await supabase
			.from('articles')
			.select('*')
			.eq('title_id', titleId)
			.single();

		if (existingArticle) {
			return new Response(JSON.stringify({
				success: true,
				article: existingArticle,
				cached: true
			}), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Get the title info
		const { data: titleData, error: titleError } = await supabase
			.from('article_titles')
			.select('*')
			.eq('id', titleId)
			.single();

		if (titleError || !titleData) {
			return new Response(JSON.stringify({ error: 'Title not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Generate the article content
		const content = await generateArticleContent(
			titleData.title,
			titleData.description,
			titleData.category
		);

		// Save the article (use admin client for write operations)
		const { data: newArticle, error: insertError } = await supabaseAdmin
			.from('articles')
			.insert({
				title_id: titleId,
				content: content,
			})
			.select()
			.single();

		if (insertError) {
			console.error('Insert error:', insertError);
			return new Response(JSON.stringify({ error: 'Failed to save article' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Mark title as generated (use admin client for write operations)
		await supabaseAdmin
			.from('article_titles')
			.update({ is_generated: true })
			.eq('id', titleId);

		return new Response(JSON.stringify({
			success: true,
			article: newArticle,
			cached: false
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		console.error('Generate article error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
