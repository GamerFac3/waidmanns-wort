import { s as supabase } from '../../chunks/supabase_Cb5LKNSI.mjs';
import { g as generateArticleContent } from '../../chunks/claude_DQ7aQCVK.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const { titleId } = await request.json();
    if (!titleId) {
      return new Response(JSON.stringify({ error: "titleId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: existingArticle } = await supabase.from("articles").select("*").eq("title_id", titleId).single();
    if (existingArticle) {
      return new Response(JSON.stringify({
        success: true,
        article: existingArticle,
        cached: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: titleData, error: titleError } = await supabase.from("article_titles").select("*").eq("id", titleId).single();
    if (titleError || !titleData) {
      return new Response(JSON.stringify({ error: "Title not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const content = await generateArticleContent(
      titleData.title,
      titleData.description,
      titleData.category
    );
    const { data: newArticle, error: insertError } = await supabase.from("articles").insert({
      title_id: titleId,
      content
    }).select().single();
    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save article" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    await supabase.from("article_titles").update({ is_generated: true }).eq("id", titleId);
    return new Response(JSON.stringify({
      success: true,
      article: newArticle,
      cached: false
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Generate article error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
