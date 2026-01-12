import { s as supabase } from '../../chunks/supabase_Cb5LKNSI.mjs';
import { a as generateNewTitles } from '../../chunks/claude_DQ7aQCVK.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async () => {
  try {
    const { count } = await supabase.from("article_titles").select("*", { count: "exact", head: true }).eq("is_generated", false);
    const needed = Math.max(0, 5 - (count || 0));
    if (needed === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "Enough titles available",
        generated: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const newTitles = await generateNewTitles(needed);
    const { error } = await supabase.from("article_titles").insert(newTitles);
    if (error) {
      console.error("Insert titles error:", error);
      return new Response(JSON.stringify({ error: "Failed to save titles" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      generated: newTitles.length,
      titles: newTitles
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Generate titles error:", error);
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
