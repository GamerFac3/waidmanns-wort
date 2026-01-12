import { e as createAstro, f as createComponent, k as renderComponent, l as renderHead, n as renderSlot, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B1EdQCCv.mjs';
import 'piccolore';
import { $ as $$BaseHead, a as $$Header, b as $$Footer } from '../chunks/Header_Cf4ALaw2.mjs';
import { S as SITE_TITLE, A as AUTHOR } from '../chunks/consts_Bxvkf2X3.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://waidmanns-wort.vercel.app");
const $$BlogPost = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { title, description, pubDate } = Astro2.props;
  return renderTemplate`<html lang="de" data-astro-cid-bvzihdzo> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": `${title} | ${SITE_TITLE}`, "description": description, "data-astro-cid-bvzihdzo": true })}${renderHead()}</head> <body data-astro-cid-bvzihdzo> ${renderComponent($$result, "Header", $$Header, { "data-astro-cid-bvzihdzo": true })} <main data-astro-cid-bvzihdzo> <article data-astro-cid-bvzihdzo> <a href="/" class="back-link" data-astro-cid-bvzihdzo>&larr; Zurück zur Übersicht</a> <div class="prose" data-astro-cid-bvzihdzo> <div class="title" data-astro-cid-bvzihdzo> <h1 data-astro-cid-bvzihdzo>${title}</h1> <div class="date" data-astro-cid-bvzihdzo> ${pubDate.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })} </div> </div> ${renderSlot($$result, $$slots["default"])} </div> </article> </main> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-bvzihdzo": true })} </body></html>`;
}, "/Users/vomberg/Documents/private/automatic-hunter-blog/src/layouts/BlogPost.astro", void 0);

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$BlogPost, { "title": "\xDCber mich", "description": AUTHOR.bio, "pubDate": /* @__PURE__ */ new Date("2024-01-01") }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h2>Waidmannsheil!</h2> <p>
Mein Name ist ${AUTHOR.name}, ich bin Jahrgang 1962 und lebe seit meiner Geburt
		im ${AUTHOR.location}. Das Jagen liegt mir im Blut - schon mein Großvater und
		mein Vater waren Jäger, und ich durfte sie als Kind oft ins Revier begleiten.
</p> <p>
Seit 1989 bin ich selbst aktiver Jäger. In diesen ${AUTHOR.experience} habe ich
		viel erlebt, viel gelernt und - das muss ich zugeben - auch einige Fehler gemacht.
		Aber genau das macht einen guten Jäger aus: aus Erfahrungen zu lernen und das
		Wissen weiterzugeben.
</p> <p>
Heute betreue ich ein gemischtes Revier von etwa 800 Hektar im Vorderen
		Bayerischen Wald. Rehwild, Schwarzwild und etwas Rotwild - dazu Hase, Fasan
		und Ente. Die Arbeit im Revier, die Hege und die Beobachtung der Natur erfüllen
		mich jeden Tag aufs Neue.
</p> <h3>Warum dieser Blog?</h3> <p>
Mit "${SITE_TITLE}" möchte ich meine Gedanken und Erfahrungen mit anderen
		Waidgenossen teilen. Ob es um die richtige Büchse geht, um Beobachtungen
		am Wildwechsel oder um die Frage, welcher Geländewagen sich für den
		Reviergang eignet - hier schreibe ich über alles, was mich als Jäger bewegt.
</p> <p>
Dabei ist mir eines wichtig: Ich schreibe aus meiner persönlichen Erfahrung.
		Andere Jäger mögen andere Ansichten haben, und das ist auch gut so. Die Jagd
		lebt vom Austausch und von der Diskussion.
</p> <h3>Waidmannsheil und gut Schuss!</h3> <p> <em>Euer Heinrich Bergmann</em><br>
Mitglied im Bayerischen Jagdverband<br> ${AUTHOR.location} </p> ` })}`;
}, "/Users/vomberg/Documents/private/automatic-hunter-blog/src/pages/about.astro", void 0);

const $$file = "/Users/vomberg/Documents/private/automatic-hunter-blog/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$About,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
