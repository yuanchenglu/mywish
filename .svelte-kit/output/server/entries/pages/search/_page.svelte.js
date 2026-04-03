import { e as escape_html, b as attr, d as derived, h as head, c as ensure_array_like } from "../../../chunks/index2.js";
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
    $$renderer2.push(`<!---->/**
 * @description 心愿卡片组件 - 展示单个心愿内容
 * @version 1.0
 * @created 2026-04-03
 * @dependencies tokens.css (设计系统), kv-schema.ts (Wish 类型)
 * 
 * 功能特性：
 * - 显示心愿文本（最大100字）
 * - 显示心愿小钥匙（6位，可点击复制）
 * - 显示点赞数和推荐数
 * - 显示创建时间（相对时间格式）
 * - 响应式设计（移动端全宽，桌面端居中）
 * - 星空蓝/深空紫主题
 */ <article class="wish-card svelte-khn1tn" aria-label="心愿卡片"><p class="wish-text svelte-khn1tn">${escape_html(wish.text)}</p> <button class="wish-key svelte-khn1tn" aria-label="点击复制小钥匙" title="点击复制小钥匙">🔑 ${escape_html(wish.key)}</button> <div class="wish-actions svelte-khn1tn"><button class="action-btn like-btn svelte-khn1tn" aria-label="点赞">⭐ ${escape_html(wish.likes)}</button> <button class="action-btn recommend-btn svelte-khn1tn" aria-label="推荐">👍 ${escape_html(wish.recommends)}</button> <button class="action-btn share-btn svelte-khn1tn" aria-label="分享">📤 分享</button></div> <time class="wish-time svelte-khn1tn"${attr("datetime", wish.created_at)}>${escape_html(relativeTime())}</time> `);
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
