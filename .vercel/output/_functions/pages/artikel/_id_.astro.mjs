import { e as createAstro, f as createComponent, k as renderComponent, l as renderHead, r as renderTemplate, u as unescapeHTML } from '../../chunks/astro/server_B1EdQCCv.mjs';
import 'piccolore';
import { $ as $$BaseHead, a as $$Header, b as $$Footer } from '../../chunks/Header_Cf4ALaw2.mjs';
import { A as AUTHOR, S as SITE_TITLE, C as CATEGORIES } from '../../chunks/consts_Bxvkf2X3.mjs';
import { s as supabase } from '../../chunks/supabase_Cb5LKNSI.mjs';
import { g as generateArticleContent } from '../../chunks/claude_DQ7aQCVK.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://waidmanns-wort.vercel.app");
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  if (!id) {
    return Astro2.redirect("/");
  }
  const { data: titleData, error: titleError } = await supabase.from("article_titles").select("*").eq("id", id).single();
  if (titleError || !titleData) {
    return Astro2.redirect("/");
  }
  let { data: articleData } = await supabase.from("articles").select("*").eq("title_id", id).single();
  if (!articleData) {
    try {
      const content = await generateArticleContent(
        titleData.title,
        titleData.description,
        titleData.category
      );
      const { data: newArticle, error: insertError } = await supabase.from("articles").insert({
        title_id: id,
        content
      }).select().single();
      if (!insertError && newArticle) {
        articleData = newArticle;
        await supabase.from("article_titles").update({ is_generated: true }).eq("id", id);
      }
    } catch (err) {
      console.error("Generation error:", err);
    }
  }
  function getCategoryName(categoryId) {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat?.name || categoryId;
  }
  function renderMarkdown(text) {
    return text.replace(/^### (.*$)/gm, "<h3>$1</h3>").replace(/^## (.*$)/gm, "<h2>$1</h2>").replace(/^# (.*$)/gm, "<h1>$1</h1>").replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/^\- (.*$)/gm, "<li>$1</li>").replace(/(<li>.*<\/li>)\n(?!<li>)/g, "$1</ul>\n").replace(/(?<!<\/ul>\n)(<li>)/g, "<ul>$1").replace(/\n\n/g, "</p><p>").replace(/^(?!<[hul])(.+)$/gm, "<p>$1</p>").replace(/<p><\/p>/g, "").replace(/<p>(<[hul])/g, "$1").replace(/(<\/[hul][^>]*>)<\/p>/g, "$1");
  }
  return renderTemplate`<html lang="de"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": `${titleData.title} | ${SITE_TITLE}`, "description": titleData.description })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} <main> <article> <header style="margin-bottom: 2em;"> <a href="/" style="font-size: 0.9em;">&larr; Zurück zur Übersicht</a> <h1 style="margin-top: 0.5em;">${titleData.title}</h1> <div class="meta" style="margin-top: 1em;"> <span class="category-badge">${getCategoryName(titleData.category)}</span> ${articleData && renderTemplate`<span style="color: var(--text-light);"> ${new Date(articleData.generated_at).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </span>`} </div> </header> ${articleData ? renderTemplate`<div class="article-content">${unescapeHTML(renderMarkdown(articleData.content))}</div>` : renderTemplate`<div class="article-content"> <p>Der Artikel konnte leider nicht generiert werden. Bitte versuchen Sie es später erneut.</p> </div>`} <footer style="margin-top: 3em; padding-top: 2em; border-top: 1px solid var(--border-light);"> <p style="font-style: italic; color: var(--text-light);">
Waidmannsheil!<br> <strong>${AUTHOR.name}</strong><br> ${AUTHOR.location} </p> </footer> </article> </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/vomberg/Documents/private/automatic-hunter-blog/src/pages/artikel/[id].astro", void 0);

const $$file = "/Users/vomberg/Documents/private/automatic-hunter-blog/src/pages/artikel/[id].astro";
const $$url = "/artikel/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$id,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
