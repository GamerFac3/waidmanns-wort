import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const TARGET_POOL_SIZE = 5;

export const GET: APIRoute = async () => {
	try {
		// Get total article count
		const { count: total, error: totalError } = await supabase
			.from('article_titles')
			.select('*', { count: 'exact', head: true });

		if (totalError) {
			throw new Error(`Failed to fetch total count: ${totalError.message}`);
		}

		// Get generated article count
		const { count: generated, error: generatedError } = await supabase
			.from('article_titles')
			.select('*', { count: 'exact', head: true })
			.eq('is_generated', true);

		if (generatedError) {
			throw new Error(`Failed to fetch generated count: ${generatedError.message}`);
		}

		// Get pending article count (ready to be published but not yet generated)
		const { count: pending, error: pendingError } = await supabase
			.from('article_titles')
			.select('*', { count: 'exact', head: true })
			.eq('is_generated', false);

		if (pendingError) {
			throw new Error(`Failed to fetch pending count: ${pendingError.message}`);
		}

		// Calculate how many articles are needed to reach target pool
		const readyCount = pending || 0;
		const needed = Math.max(0, TARGET_POOL_SIZE - readyCount);

		return new Response(JSON.stringify({
			total: total || 0,
			generated: generated || 0,
			pending: pending || 0,
			target: TARGET_POOL_SIZE,
			needed: needed,
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		console.error('Pool status error:', error);
		return new Response(JSON.stringify({
			error: 'Failed to fetch pool status',
			message: (error as Error).message
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
