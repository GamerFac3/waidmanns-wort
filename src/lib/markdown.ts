/**
 * Simple but robust markdown to HTML converter
 * Handles: headers, bold, italic, lists, paragraphs
 */
export function renderMarkdown(text: string): string {
	if (!text) return '';

	// Normalize input
	let html = text
		.trim()
		.replace(/\r\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n');

	// Process headers first (## and ###)
	html = html.replace(
		/^### (.+)$/gm,
		'<h3 class="text-xl font-bold text-[#2d3e28] mt-8 mb-3">$1</h3>'
	);
	html = html.replace(
		/^## (.+)$/gm,
		'<h2 class="text-2xl font-bold text-[#2d3e28] mt-8 mb-4 pt-4 border-t border-gray-200 first:border-t-0 first:pt-0 first:mt-0">$1</h2>'
	);

	// Process bold and italic
	html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
	html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

	// Process lists - collect consecutive list items
	const lines = html.split('\n');
	const processed: string[] = [];
	let inList = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const isListItem = /^- (.+)$/.test(line);

		if (isListItem) {
			if (!inList) {
				processed.push('<ul class="list-disc pl-6 mb-4 space-y-1">');
				inList = true;
			}
			const content = line.replace(/^- (.+)$/, '$1');
			processed.push(`<li>${content}</li>`);
		} else {
			if (inList) {
				processed.push('</ul>');
				inList = false;
			}
			processed.push(line);
		}
	}

	if (inList) {
		processed.push('</ul>');
	}

	html = processed.join('\n');

	// Process paragraphs - split by double newlines
	const blocks = html.split('\n\n');
	const finalBlocks = blocks.map(block => {
		block = block.trim();
		if (!block) return '';

		// Skip if already an HTML element
		if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<ol')) {
			return block;
		}

		// Wrap in paragraph if it's plain text
		if (!block.startsWith('<')) {
			return `<p class="mb-4 leading-relaxed">${block.replace(/\n/g, '<br>')}</p>`;
		}

		return block;
	});

	return finalBlocks.filter(Boolean).join('\n');
}
