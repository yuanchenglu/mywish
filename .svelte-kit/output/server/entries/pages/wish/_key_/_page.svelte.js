import { h as head, b as attr } from "../../../../chunks/index2.js";
/* empty css                                                        */
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("15tk0i4", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>心愿详情 - 星辰大海</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", "查看心愿详情")}/>`);
    });
    $$renderer2.push(`<main>`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p>加载中...</p>`);
    }
    $$renderer2.push(`<!--]--></main>`);
  });
}
export {
  _page as default
};
