import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import {
	generateNewTitles,
	generateArticleContent,
	generateImagePrompt,
	generateImage,
	calculateArticleStats,
} from '../../lib/replicate';

interface ArticleResult {
	title: string;
	success: boolean;
	error?: string;
	titleId?: string;
	imageUrl?: string;
}

export const POST: APIRoute = async () => {
	try {
		if (!supabaseAdmin) {
			return new Response(JSON.stringify({ error: 'Server configuration error: missing service role key' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Fetch all existing article titles to avoid duplicates
		const { data: existingArticles, error: fetchError } = await supabase
			.from('article_titles')
			.select('title');

		if (fetchError) {
			console.error('Error fetching existing titles:', fetchError);
			return new Response(JSON.stringify({ error: 'Failed to fetch existing articles' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const existingTitles = existingArticles?.map(a => a.title) || [];

		// Check how many ungenerated titles exist
		const { count } = await supabase
			.from('article_titles')
			.select('*', { count: 'exact', head: true })
			.eq('is_generated', false);

		// Always generate at least 1 title, up to 5 if pool is low
		const needed = Math.max(1, 5 - (count || 0));

		// Generate new titles (with existing titles to avoid duplicates)
		const newTitles = await generateNewTitles(needed, existingTitles);

		// Insert titles into database first
		const { data: insertedTitles, error: insertError } = await supabaseAdmin
			.from('article_titles')
			.insert(newTitles)
			.select();

		if (insertError || !insertedTitles) {
			console.error('Insert titles error:', insertError);
			return new Response(JSON.stringify({ error: 'Failed to save titles' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Process each title: generate content, image, and save
		const results: ArticleResult[] = [];

		for (const titleData of insertedTitles) {
			const result: ArticleResult = {
				title: titleData.title,
				success: false,
				titleId: titleData.id,
			};

			try {
				// 1. Generate article content
				console.log(`Generating content for: ${titleData.title}`);
				const content = await generateArticleContent(
					titleData.title,
					titleData.description,
					titleData.category
				);

				// 2. Calculate article stats
				const stats = calculateArticleStats(content);

				// 3. Generate image prompt
				console.log(`Generating image prompt for: ${titleData.title}`);
				const imagePrompt = await generateImagePrompt(
					titleData.title,
					titleData.description,
					titleData.category
				);

				// 4. Generate image
				console.log(`Generating image for: ${titleData.title}`);
				const generatedImageUrl = await generateImage(imagePrompt);

				// 5. Download the image
				const imageResponse = await fetch(generatedImageUrl);
				const imageBuffer = await imageResponse.arrayBuffer();

				// 6. Upload to Supabase Storage
				const fileName = `generated-${titleData.id}-${Date.now()}.webp`;
				const { error: uploadError } = await supabaseAdmin.storage
					.from('article-images')
					.upload(fileName, imageBuffer, {
						contentType: 'image/webp',
						upsert: true,
					});

				if (uploadError) {
					throw new Error(`Image upload failed: ${uploadError.message}`);
				}

				// 7. Get public URL
				const { data: { publicUrl } } = supabaseAdmin.storage
					.from('article-images')
					.getPublicUrl(fileName);

				// 8. Insert article content
				const { error: articleError } = await supabaseAdmin
					.from('articles')
					.insert({
						title_id: titleData.id,
						content: content,
					});

				if (articleError) {
					throw new Error(`Article insert failed: ${articleError.message}`);
				}

				// 9. Update article_titles with is_generated, stats, and image_url
				const { error: updateError } = await supabaseAdmin
					.from('article_titles')
					.update({
						is_generated: true,
						word_count: stats.word_count,
						reading_time_minutes: stats.reading_time_minutes,
						image_url: publicUrl,
					})
					.eq('id', titleData.id);

				if (updateError) {
					throw new Error(`Title update failed: ${updateError.message}`);
				}

				result.success = true;
				result.imageUrl = publicUrl;
				console.log(`Successfully generated article: ${titleData.title}`);

			} catch (error) {
				result.error = (error as Error).message;
				console.error(`Error processing article "${titleData.title}":`, error);
			}

			results.push(result);
		}

		const successCount = results.filter(r => r.success).length;
		const failureCount = results.filter(r => !r.success).length;

		return new Response(JSON.stringify({
			success: failureCount === 0,
			generated: successCount,
			failed: failureCount,
			total: results.length,
			results: results,
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		console.error('Generate titles error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error', message: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
