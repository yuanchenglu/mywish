import { h as head, c as attr, e as escape_html, b as attr_class, d as derived } from "../../../chunks/index2.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { customAlphabet } from "nanoid";
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function generateWishKey() {
  return customAlphabet(ALPHABET, 6)();
}
function validateCustomKey(key) {
  if (key.length === 0) {
    return { valid: true };
  }
  if (key.length !== 6) {
    return { valid: false, error: "小钥匙必须是6位字符" };
  }
  const pattern = /^[a-zA-Z0-9]{6}$/;
  if (!pattern.test(key)) {
    return { valid: false, error: "小钥匙只能包含字母和数字" };
  }
  return { valid: true };
}
function validateWishText(text) {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "请输入心愿内容" };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: "心愿内容不能超过100字" };
  }
  return { valid: true };
}
function countWishText(text) {
  return text.trim().length;
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let wishText = "";
    let customKey = "";
    let generatedKey = derived(() => customKey.trim() || generateWishKey());
    let charCount = derived(() => countWishText(wishText));
    let maxChars = 100;
    let textValidation = derived(() => validateWishText(wishText));
    let keyValidation = derived(() => validateCustomKey(customKey));
    let isValid = derived(() => textValidation().valid && keyValidation().valid);
    let isSubmitting = false;
    head("jztt4t", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>发布心愿 - 星辰大海 My Wish</title>`);
      });
    });
    $$renderer2.push(`<main class="create-page svelte-jztt4t"><form class="wish-form svelte-jztt4t"><section class="wish-input-section svelte-jztt4t"><label for="wish-text" class="section-label svelte-jztt4t">写下你的心愿</label> <textarea id="wish-text" class="wish-textarea svelte-jztt4t"${attr("maxlength", maxChars)} placeholder="愿家人平安健康，幸福美满..." aria-describedby="char-count"${attr("aria-invalid", !textValidation().valid)}>`);
    const $$body = escape_html(wishText);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> <div id="char-count"${attr_class("char-count svelte-jztt4t", void 0, { "over-limit": charCount() > maxChars })}>已输入 ${escape_html(charCount())}/100 字</div> `);
    if (!textValidation().valid && wishText.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="validation-error svelte-jztt4t" role="alert">${escape_html(textValidation().error)}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> <section class="wish-key-section svelte-jztt4t"><label for="wish-key" class="section-label svelte-jztt4t">心愿小钥匙（可选）</label> <div class="key-input-group svelte-jztt4t"><input id="wish-key" type="text" class="key-input svelte-jztt4t"${attr("value", customKey)}${attr("maxlength", 6)} placeholder="自定义6位小钥匙" aria-describedby="key-hint"${attr("aria-invalid", !keyValidation().valid)}/> <button type="button" class="regenerate-btn svelte-jztt4t" aria-label="重新生成小钥匙" title="重新生成小钥匙">`);
    Icon($$renderer2, { name: "refresh", size: 20 });
    $$renderer2.push(`<!----></button></div> <div id="key-hint" class="key-hint svelte-jztt4t">当前小钥匙：<span class="key-preview svelte-jztt4t">${escape_html(generatedKey())}</span></div> `);
    if (!keyValidation().valid && customKey.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="validation-error svelte-jztt4t" role="alert">${escape_html(keyValidation().error)}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> <button type="submit" class="submit-btn svelte-jztt4t"${attr("disabled", !isValid() || isSubmitting, true)}${attr("aria-busy", isSubmitting)}>`);
    {
      $$renderer2.push("<!--[-1-->");
      Icon($$renderer2, { name: "sparkles", size: 20 });
      $$renderer2.push(`<!----> 发布心愿`);
    }
    $$renderer2.push(`<!--]--></button></form> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></main>`);
  });
}
export {
  _page as default
};
