import { e as escape_html, b as attr_class, c as attr, d as derived, f as stringify, h as head, a as ensure_array_like } from "../../../chunks/index2.js";
import { I as Icon } from "../../../chunks/Icon.js";
/* empty css                                                     */
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
function WishCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { wish } = $$props;
    let currentLikes = wish.realtime_likes || wish.likes;
    let currentRecommends = wish.realtime_recommends || wish.recommends;
    let relativeTime = derived(() => formatRelativeTime(wish.created_at));
    function formatRelativeTime(dateString) {
      const date = new Date(dateString);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1e3);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffSeconds < 60) return "刚刚";
      if (diffMinutes < 60) return `${diffMinutes}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffHours < 48) return "昨天";
      if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}天前`;
      return date.toLocaleDateString("zh-CN");
    }
    $$renderer2.push(`<article class="wish-card svelte-khn1tn"><p class="wish-text svelte-khn1tn">${escape_html(wish.text)}</p> <div class="wish-actions svelte-khn1tn"><button class="action-btn like-btn svelte-khn1tn">`);
    Icon($$renderer2, { name: "sparkles", size: 16, class: "btn-icon" });
    $$renderer2.push(`<!----> <span${attr_class(`count ${stringify("")}`, "svelte-khn1tn")}>${escape_html(currentLikes)}</span></button> <button class="action-btn recommend-btn svelte-khn1tn">`);
    Icon($$renderer2, { name: "flame", size: 16, class: "btn-icon" });
    $$renderer2.push(`<!----> <span${attr_class(`count ${stringify("")}`, "svelte-khn1tn")}>${escape_html(currentRecommends)}</span></button> <button class="action-btn share-btn svelte-khn1tn">`);
    Icon($$renderer2, { name: "share", size: 16, class: "btn-icon" });
    $$renderer2.push(`<!----> <span class="svelte-khn1tn">分享</span></button></div> <div class="wish-footer svelte-khn1tn"><button class="wish-key svelte-khn1tn" title="点击复制密钥">`);
    Icon($$renderer2, { name: "key", size: 12, class: "key-icon" });
    $$renderer2.push(`<!----> ${escape_html(wish.key)}</button> <time class="wish-time svelte-khn1tn"${attr("datetime", wish.created_at)}>${escape_html(relativeTime())}</time></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></article>`);
  });
}
function _page($$renderer) {
  let query = "";
  let wishes = [];
  head("e12qt1", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>搜索心愿 - 星辰大海</title>`);
    });
  });
  $$renderer.push(`<main><div class="search-box svelte-e12qt1"><input type="text"${attr("value", query)} placeholder="输入心愿关键词..." class="svelte-e12qt1"/> <button class="svelte-e12qt1">搜索</button></div> <div class="results">`);
  {
    $$renderer.push("<!--[-1-->");
    $$renderer.push(`<!--[-->`);
    const each_array = ensure_array_like(wishes);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let wish = each_array[$$index];
      WishCard($$renderer, {
        wish
      });
    }
    $$renderer.push(`<!--]-->`);
  }
  $$renderer.push(`<!--]--></div></main>`);
}
export {
  _page as default
};
