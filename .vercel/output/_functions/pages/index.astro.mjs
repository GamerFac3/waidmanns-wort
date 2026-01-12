import { f as createComponent, k as renderComponent, l as renderHead, h as addAttribute, r as renderTemplate } from '../chunks/astro/server_B1EdQCCv.mjs';
import 'piccolore';
import { $ as $$BaseHead, a as $$Header, b as $$Footer } from '../chunks/Header_Cf4ALaw2.mjs';
import { S as SITE_TITLE, a as SITE_DESCRIPTION, A as AUTHOR, C as CATEGORIES } from '../chunks/consts_Bxvkf2X3.mjs';
import { s as supabase } from '../chunks/supabase_Cb5LKNSI.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const { data: pendingTitles } = await supabase.from("article_titles").select("*").eq("is_generated", false).order("created_at", { ascending: false }).limit(5);
  const { data: generatedArticles } = await supabase.from("article_titles").select(`
		*,
		articles (*)
	`).eq("is_generated", true).order("created_at", { ascending: false }).limit(20);
  function getCategoryName(categoryId) {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat?.name || categoryId;
  }
  return renderTemplate`<html lang="de"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} <main> <div class="intro"> <h1>${SITE_TITLE}</h1> <p>${SITE_DESCRIPTION}</p> <p><em>Von ${AUTHOR.name} - ${AUTHOR.experience}</em></p> </div> ${pendingTitles && pendingTitles.length > 0 && renderTemplate`<section> <div class="section-header"> <h2>Neue Beiträge</h2> </div> <p style="color: var(--text-light); font-size: 0.9em;">
Diese Artikel werden beim ersten Aufruf frisch für Sie verfasst.
</p> ${pendingTitles.map((title) => renderTemplate`<article class="article-card"> <h3> <a${addAttribute(`/artikel/${title.id}`, "href")}> ${title.title} </a> <span class="new-badge">NEU</span> </h3> <p class="description">${title.description}</p> <div class="meta"> <span class="category-badge">${getCategoryName(title.category)}</span> </div> </article>`)} </section>`} ${generatedArticles && generatedArticles.length > 0 && renderTemplate`<section> <div class="section-header"> <h2>Archiv</h2> </div> ${generatedArticles.map((item) => renderTemplate`<article class="article-card"> <h3> <a${addAttribute(`/artikel/${item.id}`, "href")}> ${item.title} </a> </h3> <p class="description">${item.description}</p> <div class="meta"> <span class="category-badge">${getCategoryName(item.category)}</span> ${item.articles && item.articles[0] && renderTemplate`<span> ${new Date(item.articles[0].generated_at).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </span>`} </div> </article>`)} </section>`} ${(!pendingTitles || pendingTitles.length === 0) && (!generatedArticles || generatedArticles.length === 0) && renderTemplate`<div class="intro"> <p>Noch keine Artikel vorhanden. Die ersten Beiträge werden bald erscheinen!</p> </div>`} </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/vomberg/Documents/private/automatic-hunter-blog/src/pages/index.astro", void 0);

const $$file = "/Users/vomberg/Documents/private/automatic-hunter-blog/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
