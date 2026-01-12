import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { generateImagePrompt, generateImage } from '../../../../../lib/replicate';

export const POST: APIRoute = async ({ params }) => {
	const { id } = params;

	if (!id) {
		return new Response(JSON.stringify({ error: 'Missing article ID' }), {
			status: 400,
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
		// Get article info
		const { data: article, error: fetchError } = await supabaseAdmin
			.from('article_titles')
			.select('*')
			.eq('id', id)
			.single();

		if (fetchError || !article) {
			return new Response(JSON.stringify({ error: 'Article not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Generate image prompt using Replicate LLM
		const imagePrompt = await generateImagePrompt(
			article.title,
			article.description,
			article.category
		);

		// Generate image using Replicate
		const generatedImageUrl = await generateImage(imagePrompt);

		// Download the image
		const imageResponse = await fetch(generatedImageUrl);
		const imageBuffer = await imageResponse.arrayBuffer();

		// Upload to Supabase Storage
		const fileName = `generated-${id}-${Date.now()}.webp`;
		const { error: uploadError } = await supabaseAdmin.storage
			.from('article-images')
			.upload(fileName, imageBuffer, {
				contentType: 'image/webp',
				upsert: true,
			});

		if (uploadError) {
			console.error('Upload error:', uploadError);
			return new Response(JSON.stringify({
				error: 'Failed to upload generated image',
				generatedUrl: generatedImageUrl
			}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Get public URL
		const { data: { publicUrl } } = supabaseAdmin.storage
			.from('article-images')
			.getPublicUrl(fileName);

		// Update article with new image
		const { error: updateError } = await supabaseAdmin
			.from('article_titles')
			.update({ image_url: publicUrl })
			.eq('id', id);

		if (updateError) {
			console.error('Update error:', updateError);
			return new Response(JSON.stringify({
				error: 'Failed to update article with image',
				imageUrl: publicUrl
			}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({
			success: true,
			imageUrl: publicUrl,
			prompt: imagePrompt
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		console.error('Generate image error:', error);
		return new Response(JSON.stringify({
			error: 'Internal server error',
			message: (error as Error).message
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
