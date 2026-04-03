import { h as head, s as slot } from "../../chunks/index2.js";
function _layout($$renderer, $$props) {
  head("12qhfyh", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>星辰大海 My Wish - 心愿祝福平台</title>`);
    });
    $$renderer2.push(`<meta name="description" content="发布你的小心愿，传递正能量，获得祝福"/>`);
  });
  $$renderer.push(`<!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]-->`);
}
export {
  _layout as default
};
