# 首次引导浮窗设计文档

> 版本: v1.0
> 创建时间: 2026-04-04
> 设计师: 小路 + Sisyphus
> 状态: 待开发

---

## 一、功能概述 (One-Liner)

首次打开心愿社区时，展示引导浮窗，传递社区灵魂："没有规则，只有善意"，并承诺SEO优化价值。

---

## 二、用户故事 (User Story)

### 主用户故事

```
作为 一名新用户
我想要 首次打开社区时了解社区文化和价值承诺
以便于 快速理解社区精神，建立信任感
```

### 验收标准 (DoD)

- [ ] 首次打开页面时，浮窗自动弹出
- [ ] 用户点击"I get"按钮后，浮窗消失
- [ ] 用户点击遮罩区域后，浮窗消失
- [ ] 用户按ESC键后，浮窗消失
- [ ] 关闭后，localStorage记录状态，再次打开不显示
- [ ] 清除浏览器缓存后，浮窗再次显示
- [ ] 文案阅读时长在10秒以内
- [ ] 移动端底部弹出，桌面端居中弹出

---

## 三、文案设计

### 最终文案

```
你相信光吗？🌟
你相信吸引力法则吗？💫

心愿不会石沉大海——
极致SEO优化，让心愿被全网收录，
冲向星辰，被更多人看见。

想许愿就许愿，想点赞就点赞。
不防爬，不限赞，全凭缘分。
这里没有规则，只有善意。

[ I get ]
```

### 文案分析

| 维度 | 数据 |
|------|------|
| **总字数** | 约65字 |
| **阅读时长** | 约6-7秒 |
| **开头仪式感** | 双问句："光" + "吸引力法则" |
| **痛点回应** | "不会石沉大海" |
| **技术承诺** | "极致SEO优化，全网收录" |
| **社区灵魂** | "没有规则，只有善意" |
| **按钮文案** | "I get"（理解社区精神） |

### 文案结构

```
第一部分：仪式感开场（2行）
├─ "你相信光吗？🌟"
└─ "你相信吸引力法则吗？💫"

第二部分：技术价值承诺（3行）
├─ "心愿不会石沉大海——"
├─ "极致SEO优化，让心愿被全网收录，"
└─ "冲向星辰，被更多人看见。"

第三部分：社区灵魂表达（3行）
├─ "想许愿就许愿，想点赞就点赞。"
├─ "不防爬，不限赞，全凭缘分。"
└─ "这里没有规则，只有善意。"

第四部分：行动召唤（1行）
└─ "[ I get ]"
```

---

## 四、UI设计

### 4.1 视觉排版

```
┌─────────────────────────────────────┐
│                              [×]     │
│                                      │
│     你相信光吗？🌟                    │
│   你相信吸引力法则吗？💫              │
│                                      │
│  心愿不会石沉大海——                  │
│  极致SEO优化，让心愿被全网收录，      │
│  冲向星辰，被更多人看见。             │
│                                      │
│  想许愿就许愿，想点赞就点赞。         │
│  不防爬，不限赞，全凭缘分。           │
│  这里没有规则，只有善意。             │
│                                      │
│      ┌────────────────────┐         │
│      │       I get        │         │
│      └────────────────────┘         │
│                                      │
└─────────────────────────────────────┘
```

### 4.2 样式规范

#### 覆盖层（Backdrop）

```css
.intro-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--color-bg-overlay);  /* rgba(10, 10, 10, 0.95) */
  z-index: 250;  /* 高于PublishModal(200) */
  opacity: 0;
  transition: opacity 0.3s var(--ease-out);
  
  /* 移动端：底部对齐 */
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* 桌面端：居中对齐 */
@media (min-width: 768px) {
  .intro-backdrop {
    align-items: center;
  }
}
```

#### 浮窗容器（Modal）

```css
.intro-modal {
  width: 100%;
  max-width: 600px;
  background: var(--gradient-card);  /* 深空紫渐变 */
  
  /* 移动端：仅顶部圆角 */
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  
  /* 边框和阴影 */
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  
  /* 动画：从底部滑入 */
  transform: translateY(100%);
  transition: transform 0.3s var(--ease-out);
  
  max-height: 85vh;
  overflow-y: auto;
}

/* 桌面端：全圆角 */
@media (min-width: 768px) {
  .intro-modal {
    border-radius: var(--radius-lg);
    max-width: 500px;
  }
}
```

#### 关闭按钮（Close Button）

```css
.close-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  
  background: transparent;
  color: var(--color-text-muted);
  font-size: 20px;
  
  min-width: 44px;
  min-height: 44px;
  border-radius: var(--radius-base);
  
  border: none;
  cursor: pointer;
  
  transition: all var(--duration-fast) var(--ease-out);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}
```

#### 内容区域（Content）

```css
.intro-content {
  padding: var(--space-8) var(--space-6);
  text-align: center;
}

.intro-opening {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  line-height: var(--line-height-loose);
  margin-bottom: var(--space-6);
}

.intro-tech {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-base);
  margin-bottom: var(--space-6);
}

.intro-soul {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--line-height-base);
  margin-bottom: var(--space-8);
}
```

#### 确认按钮（CTA Button）

```css
.confirm-btn {
  background: var(--gradient-accent);  /* 星空蓝渐变 */
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  
  width: 100%;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-base);
  border: none;
  
  min-height: 44px;
  cursor: pointer;
  
  transition: all var(--duration-fast) var(--ease-out);
  will-change: transform, opacity;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);  /* 星光效果 */
}
```

### 4.3 动画规范

| 动画类型 | 持续时间 | 缓动函数 | 用途 |
|----------|----------|----------|------|
| `fadeIn` | 300ms | `var(--ease-out)` | 遮罩层淡入 |
| `slideUp` | 300ms | `var(--ease-out)` | 内容从底部滑入 |
| `star-glow` | 2s | `ease-in-out infinite` | emoji闪烁（可选） |

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes star-glow {
  0%, 100% { opacity: 0.7; filter: brightness(1); }
  50% { opacity: 1; filter: brightness(1.3); }
}
```

---

## 五、交互设计

### 5.1 触发逻辑

```typescript
// 检查是否需要显示引导浮窗
function shouldShowIntro(): boolean {
  return !localStorage.getItem('seen_wish_intro');
}

// 记录已查看状态
function markIntroAsSeen(): void {
  localStorage.setItem('seen_wish_intro', 'true');
}
```

### 5.2 关闭逻辑

| 关闭方式 | 触发条件 | 后续动作 |
|----------|----------|----------|
| **点击按钮** | 点击"I get"按钮 | 记录localStorage → 延迟300ms关闭 → 触发onClose回调 |
| **点击遮罩** | 点击遮罩区域（非内容区域） | 同上 |
| **按ESC键** | 按下ESC键 | 同上 |

```typescript
// 关闭浮窗（带动画）
function handleClose() {
  isVisible = false;
  setTimeout(() => {
    markIntroAsSeen();
    onClose();
  }, 300);
}

// 点击遮罩关闭
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose();
  }
}

// ESC键关闭
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleClose();
  }
}
```

### 5.3 状态管理

```svelte
<script lang="ts">
  // Svelte 5 runes
  let isVisible = $state(false);
  
  // 组件挂载后触发进入动画
  $effect(() => {
    setTimeout(() => { isVisible = true; }, 10);
  });
</script>
```

---

## 六、组件接口设计

### Props

```typescript
interface Props {
  /** 关闭浮窗回调 */
  onClose: () => void;
}
```

### 使用示例

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import FirstTimeIntro from '../components/FirstTimeIntro.svelte';
  
  let showIntro = $state(false);
  
  onMount(() => {
    showIntro = !localStorage.getItem('seen_wish_intro');
  });
  
  function handleIntroClose() {
    showIntro = false;
  }
</script>

{#if showIntro}
  <FirstTimeIntro onClose={handleIntroClose} />
{/if}
```

---

## 七、边缘情况 (Edge Cases)

### 7.1 localStorage 不可用

**场景**：用户浏览器禁用localStorage（隐私模式）

**处理方案**：
```typescript
function shouldShowIntro(): boolean {
  try {
    return !localStorage.getItem('seen_wish_intro');
  } catch {
    // localStorage不可用时，每次都显示
    return true;
  }
}

function markIntroAsSeen(): void {
  try {
    localStorage.setItem('seen_wish_intro', 'true');
  } catch {
    // 静默失败，不影响用户体验
  }
}
```

### 7.2 用户快速连续打开页面

**场景**：用户在多个标签页同时打开社区

**处理方案**：
- 使用localStorage作为共享状态
- 一旦某个标签页关闭浮窗，其他标签页刷新后也会隐藏

### 7.3 屏幕尺寸变化

**场景**：用户在浮窗打开时旋转设备或调整窗口大小

**处理方案**：
- CSS使用响应式布局，自动适配
- 移动端：底部弹出，仅顶部圆角
- 桌面端：居中弹出，全圆角

### 7.4 长文案在小屏幕设备上的显示

**场景**：小屏幕设备（如iPhone SE）文案可能超出屏幕

**处理方案**：
```css
.intro-modal {
  max-height: 85vh;
  overflow-y: auto;
}
```

---

## 八、可访问性 (Accessibility)

### 8.1 ARIA属性

```svelte
<div 
  class="intro-backdrop"
  role="dialog"
  aria-modal="true"
  aria-labelledby="intro-title"
  aria-describedby="intro-desc"
>
  <div class="intro-modal">
    <h2 id="intro-title" class="sr-only">心愿社区介绍</h2>
    <p id="intro-desc" class="sr-only">了解心愿社区的文化和承诺</p>
    
    <!-- 内容 -->
  </div>
</div>
```

### 8.2 键盘导航

- **Tab键**：在浮窗内可聚焦元素间切换
- **ESC键**：关闭浮窗
- **Enter键**：聚焦在"I get"按钮上时，触发关闭

### 8.3 焦点管理

```typescript
// 打开浮窗时，焦点移到浮窗内
$effect(() => {
  if (isVisible) {
    // 聚焦到关闭按钮或确认按钮
    document.querySelector('.close-btn')?.focus();
  }
});

// 关闭浮窗时，焦点返回到触发元素
function handleClose() {
  isVisible = false;
  // 焦点返回到body或上一个聚焦元素
  document.body.focus();
}
```

---

## 九、性能优化

### 9.1 懒加载

```svelte
<!-- 仅在需要时渲染浮窗 -->
{#if showIntro}
  <FirstTimeIntro onClose={handleIntroClose} />
{/if}
```

### 9.2 动画性能

```css
.intro-modal {
  /* 启用GPU加速 */
  will-change: transform, opacity;
  
  /* 使用transform而非top/left */
  transform: translateY(100%);
}
```

### 9.3 避免布局抖动

```css
.intro-backdrop {
  /* 固定定位，不影响文档流 */
  position: fixed;
}
```

---

## 十、SEO价值承诺的技术支撑

### 10.1 已实现的SEO优化

| 项目 | 实现状态 | 文件位置 |
|------|---------|---------|
| **静态站点生成** | ✅ 已实现 | `svelte.config.js` (adapter-static) |
| **Schema.org结构化数据** | ✅ 已实现 | `index.html` (WebSite + SearchAction) |
| **Open Graph标签** | ✅ 已实现 | `index.html` (og:title, og:description) |
| **页面级动态SEO** | ✅ 已实现 | 各路由文件的 `<svelte:head>` |
| **语义化HTML** | ✅ 已实现 | 使用 `<main>`, `<header>`, `<section>` |

### 10.2 缺失的SEO优化（建议补充）

| 项目 | 实现状态 | 优先级 |
|------|---------|--------|
| **sitemap.xml** | ❌ 未实现 | ⭐⭐⭐⭐ |
| **robots.txt** | ❌ 未实现 | ⭐⭐⭐⭐ |
| **canonical URL** | ❌ 未实现 | ⭐⭐⭐ |
| **OG图片** | ❌ 未实现 | ⭐⭐⭐ |
| **心愿详情页结构化数据** | ❌ 未实现 | ⭐⭐⭐ |
| **AI大模型优化（llm.txt）** | ❌ 未实现 | ⭐⭐ |

### 10.3 文案承诺与实际能力对比

| 文案承诺 | 实际能力 | 是否可以承诺 |
|---------|---------|-------------|
| "极致SEO优化" | 静态站点 + Schema.org + OG标签 | ✅ 可以 |
| "心愿被全网收录" | 静态HTML页面，搜索引擎可抓取 | ✅ 可以 |
| "不会石沉大海" | 每个心愿独立页面 + 专属URL | ✅ 可以 |
| "冲向星辰" | 品牌意象，非技术承诺 | ✅ 可以（情感表达）|

---

## 十一、Non-Goals (约束)

### 不做的事

1. **不收集用户数据**：不要求用户登录或填写信息
2. **不强制用户操作**：用户可随时关闭浮窗，无强制阅读要求
3. **不多次打扰**：仅在首次打开时显示，不会重复弹出
4. **不包含复杂交互**：无多步骤引导，无表单输入
5. **不依赖第三方服务**：纯前端实现，无需API调用

---

## 十二、依赖声明 (Dependencies)

### 设计依赖

- `docs/kv-structure.md` — 数据结构设计，了解心愿数据模型

### 技术依赖

- `src/styles/tokens.css` — Design Tokens（色彩、字体、间距、圆角）
- `src/styles/layout.css` — 响应式布局工具类
- `src/components/PublishModal.svelte` — 现有Modal样式参考
- `src/components/ShareModal.svelte` — 现有Modal样式参考

### 品牌依赖

- 社区名称：星辰大海 My Wish
- 主色调：深空紫 + 星空蓝 + 金色
- 设计语言：星空、星辰、宇宙意象

---

## 十三、后续优化方向

### Phase 2（可选）

1. **个性化引导**：根据用户来源（微信/微博/搜索）显示不同文案
2. **A/B测试**：测试不同文案版本的转化率
3. **动画增强**：添加星星飘落动画，增强视觉吸引力
4. **多语言支持**：支持英文版本

### Phase 3（未来）

1. **引导步骤拆分**：如果社区功能增加，可拆分为多步引导
2. **视频引导**：添加短视频介绍社区文化
3. **互动式引导**：让用户在引导过程中完成第一个心愿发布

---

## 附录：参考资料

### 业界案例

1. **小宇宙社区公约**：三卡片布局 + 签署仪式感
2. **Modal UX Design Best Practices** (Userpilot, 2026)
3. **UGC Platform Onboarding Flows** (Din Studio, 2025)
4. **15 Onboarding Screens Examples** (Userpilot, 2026)

### 设计规范

1. **iOS Human Interface Guidelines** — 最小触摸目标44px
2. **Material Design** — Modal动画时长200-300ms
3. **WCAG 2.1** — 对比度、焦点管理、键盘导航

---

**文档结束** 🌟