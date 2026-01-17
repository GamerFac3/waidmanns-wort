import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { CATEGORIES } from '../../consts';

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

		// Get category distribution
		const { data: categoryData, error: categoryError } = await supabase
			.from('article_titles')
			.select('category')
			.eq('is_generated', true);

		if (categoryError) {
			throw new Error(`Failed to fetch category data: ${categoryError.message}`);
		}

		// Count articles per category
		const categoryCount: Record<string, number> = {};
		CATEGORIES.forEach(cat => {
			categoryCount[cat.id] = 0;
		});
		categoryData?.forEach(article => {
			if (categoryCount[article.category] !== undefined) {
				categoryCount[article.category]++;
			}
		});

		// Find underrepresented categories (categories with fewer articles)
		const avgPerCategory = (generated || 0) / CATEGORIES.length;
		const underrepresented = CATEGORIES
			.filter(cat => categoryCount[cat.id] < avgPerCategory)
			.map(cat => cat.id);

		// Calculate how many articles are needed to reach target pool
		const generatedCount = generated || 0;
		const needed = Math.max(0, TARGET_POOL_SIZE - generatedCount);

		return new Response(JSON.stringify({
			total: total || 0,
			generated: generatedCount,
			pending: pending || 0,
			target: TARGET_POOL_SIZE,
			needed: needed,
			categoryCount: categoryCount,
			underrepresented: underrepresented,
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
