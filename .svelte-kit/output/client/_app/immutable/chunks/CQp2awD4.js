import{a as T,f as D}from"./DQqYhA6p.js";import{a1 as F,ab as G,a9 as s,ac as I,a8 as a,aa as i,g as _,a4 as p,a5 as J,a2 as S,ae as O,S as l}from"./DJB0_jYO.js";import{d as P,s as r,a as d}from"./CNzH6Euw.js";import{i as Q}from"./DkQOBTIg.js";import{s as U}from"./CQSozP5E.js";var V=D('<div class="toast svelte-khn1tn" role="alert" aria-live="polite"> </div>'),X=D(`/**
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
 */ <article class="wish-card svelte-khn1tn" aria-label="心愿卡片"><p class="wish-text svelte-khn1tn"> </p> <button class="wish-key svelte-khn1tn" aria-label="点击复制小钥匙" title="点击复制小钥匙"> </button> <div class="wish-actions svelte-khn1tn"><button class="action-btn like-btn svelte-khn1tn" aria-label="点赞"> </button> <button class="action-btn recommend-btn svelte-khn1tn" aria-label="推荐"> </button> <button class="action-btn share-btn svelte-khn1tn" aria-label="分享">📤 分享</button></div> <time class="wish-time svelte-khn1tn"> </time> <!></article>`,1);function at(W,e){F(e,!0);let c=S(!1),m=S(""),C=O(()=>L(e.wish.created_at));function L(t){const n=new Date(t),E=new Date().getTime()-n.getTime(),M=Math.floor(E/1e3),w=Math.floor(M/60),o=Math.floor(w/60);return M<60?"刚刚":w<60?`${w}分钟前`:o<24?`${o}小时前`:o<48?"昨天":o<24*7?`${Math.floor(o/24)}天前`:n.toLocaleDateString("zh-CN")}async function R(){try{await navigator.clipboard.writeText(e.wish.key),l(c,!0),l(m,"小钥匙已复制"),setTimeout(()=>{l(c,!1)},3e3)}catch(t){console.error("复制失败:",t),l(c,!0),l(m,"复制失败，请手动复制")}}G();var x=X(),g=s(I(x)),b=a(g),z=a(b,!0);i(b);var v=s(b,2),H=a(v);i(v);var k=s(v,2),h=a(k),K=a(h);i(h);var f=s(h,2),N=a(f);i(f);var j=s(f,2);i(k);var u=s(k,2),q=a(u,!0);i(u);var A=s(u,2);{var B=t=>{var n=V(),y=a(n,!0);i(n),p(()=>r(y,_(m))),T(t,n)};Q(A,t=>{_(c)&&t(B)})}i(g),p(()=>{r(z,e.wish.text),r(H,`🔑 ${e.wish.key??""}`),r(K,`⭐ ${e.wish.likes??""}`),r(N,`👍 ${e.wish.recommends??""}`),U(u,"datetime",e.wish.created_at),r(q,_(C))}),d("click",v,R),d("click",h,function(...t){e.onLike?.apply(this,t)}),d("click",f,function(...t){e.onRecommend?.apply(this,t)}),d("click",j,function(...t){e.onShare?.apply(this,t)}),T(W,x),J()}P(["click"]);export{at as W};
