import { h as head, a as attr_class } from "../../chunks/index2.js";
/* empty css                                                  */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "square";
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>心愿广场 - 星辰大海 My Wish</title>`);
      });
      $$renderer3.push(`<meta name="description" content="发布心愿，传递祝福，愿星辰大海守护你"/>`);
    });
    $$renderer2.push(`<main><div class="tabs svelte-1uha8ag"><button${attr_class("svelte-1uha8ag", void 0, { "active": activeTab === "top" })}>全民点赞</button> <button${attr_class("svelte-1uha8ag", void 0, { "active": activeTab === "square" })}>心愿广场</button></div> <div class="wishes svelte-1uha8ag">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p>加载中...</p>`);
    }
    $$renderer2.push(`<!--]--></div> <a href="/create" class="create-btn svelte-1uha8ag">发布心愿</a></main>`);
  });
}
export {
  _page as default
};
