import { a as ensure_array_like, b as attr_class, c as attr, e as escape_html, h as head } from "../../chunks/index2.js";
/* empty css                                                  */
function BottomNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { activeTab } = $$props;
    const tabs = [
      { id: "like", label: "点亮心愿" },
      { id: "publish", label: "许个心愿" },
      { id: "square", label: "星空广场" }
    ];
    $$renderer2.push(`<nav class="bottom-nav svelte-msgxbw" aria-label="主导航"><!--[-->`);
    const each_array = ensure_array_like(tabs);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class("nav-tab svelte-msgxbw", void 0, {
        "active": activeTab === tab.id,
        "publish-tab": tab.id === "publish"
      })}${attr("aria-current", activeTab === tab.id ? "page" : void 0)}>${escape_html(tab.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></nav>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "square";
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>心愿广场 - 星辰大海 My Wish</title>`);
      });
      $$renderer3.push(`<meta name="description" content="发布心愿，传递祝福，愿星辰大海守护你"/>`);
    });
    $$renderer2.push(`<main class="page-content svelte-1uha8ag">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<section class="tab-content svelte-1uha8ag" aria-label="心愿广场"><header class="section-header svelte-1uha8ag"><h1 class="section-title svelte-1uha8ag">漫步星空</h1> <p class="section-desc svelte-1uha8ag">查看所有心愿，传递祝福</p></header> <div class="wishes-list svelte-1uha8ag">`);
      {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="loading-state svelte-1uha8ag">加载中...</div>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    }
    $$renderer2.push(`<!--]--></main> `);
    BottomNav($$renderer2, {
      activeTab
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
