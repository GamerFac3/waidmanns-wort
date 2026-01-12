import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { generateNewTitles } from '../../lib/replicate';

export const POST: APIRoute = async () => {
	try {
		if (!supabaseAdmin) {
			return new Response(JSON.stringify({ error: 'Server configuration error: missing service role key' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Check how many ungenerated titles exist (read with anon key is fine)
		const { count } = await supabase
			.from('article_titles')
			.select('*', { count: 'exact', head: true })
			.eq('is_generated', false);

		// Always generate at least 1 title, up to 5 if pool is low
		const needed = Math.max(1, 5 - (count || 0));

		// Generate new titles
		const newTitles = await generateNewTitles(needed);

		// Insert into database (use admin client for write operations)
		const { error } = await supabaseAdmin
			.from('article_titles')
			.insert(newTitles);

		if (error) {
			console.error('Insert titles error:', error);
			return new Response(JSON.stringify({ error: 'Failed to save titles' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({
			success: true,
			generated: newTitles.length,
			titles: newTitles
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		console.error('Generate titles error:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
