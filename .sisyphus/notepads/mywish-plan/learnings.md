
## [2026-04-03] 设计系统 Tokens 创建要点

### 成功模式
- **目录结构**: 创建前先检查目标目录（`ls ~/Code/mywish/src/`）
- **使用 mkdir -p**: 创建嵌套目录（`mkdir -p ~/Code/mywish/src/styles`）
- **Design Tokens 注释必要性**:
  - 文件头元信息（版本、创建日期）是必要的 API 文档
  - 章节分隔符（`/* === 颜色系统 === */`）帮助快速定位
  - 语义化注释（如"状元"、"榜眼探花"）防止颜色误用
  - 动画使用说明（`@usage`）是关键的 API 文档

### Design System 最佳实践
- **颜色命名**: 使用层级命名（primary-900/800/700）而非描述性命名
- **间距系统**: 基于 4px 单位，命名从 space-1 到 space-16
- **动画命名**: 使用语义化名称（star-fall/star-rise）而非技术术语
- **工具类**: 提供预设动画类 + 延迟辅助类

### 避坑备忘
- **工作目录陷阱**: 当前目录是 `homeservers`，但任务在 `mywish` 项目
- **检查路径**: 使用绝对路径 `~/Code/mywish/` 而非相对路径

---

## [2026-04-03] Svelte 5 + SvelteKit 架构决策

### 成功模式
- **Svelte 5 Runes Syntax**: 使用 `$state`, `$derived`, `$props` 而非旧语法
- **事件处理器**: Svelte 5 使用 `onclick={handler}` 而非 `on:click={handler}`
- **静态适配器**: Cloudflare Workers Pages 使用 `@sveltejs/adapter-static`
- **构建输出**: 配置 `pages: 'dist'` 输出到 dist 目录
- **Vite 升级**: Svelte 5 需要 `@sveltejs/vite-plugin-svelte@^4.0.0`

### 架构决策
- **前端框架**: 从纯静态 HTML 改为 SvelteKit（静态生成）
- **测试框架**: Vitest 单元测试 + Playwright E2E 测试（分离关注点）
- **组件测试**: 使用 `@testing-library/svelte` 测试渲染逻辑
- **部署方式**: SvelteKit 构建 → 静态文件 → Workers Pages 部署

### 必要文件结构
- `src/app.html`: SvelteKit HTML 模板（必需）
- `src/routes/+layout.svelte`: 全局布局组件
- `src/routes/+page.svelte`: 首页路由
- `svelte.config.js`: SvelteKit 配置（adapter-static）
- `vite.config.ts`: Vite 配置（包含 Vitest 设置）

### 避坑备忘
- **LSP vs 实际编译**: VSCode LSP 可能显示 Svelte 5 类型错误，但 svelte-check 通过即可
- **npm install 超时**: 分步安装，先编辑 package.json 再运行 npm install
- **导入路径**: components/ 目录引用 workers/lib 需使用 `../../` 路径

---

## [2026-04-03] Svelte 5 Vitest 测试环境修复

### 问题现象
- **错误**: `lifecycle_function_unavailable - mount(...) is not available on the server`
- **原因**: Vitest 默认使用 Node.js 入口点，导致 Svelte 5 的客户端渲染函数不可用

### 修复方案（关键配置）
```typescript
// vite.config.ts
resolve: process.env.VITEST
  ? {
      conditions: ['browser']
    }
  : undefined
```

**核心原理**:
- `conditions: ['browser']` 强制 Vitest 使用 package.json 的 browser 入口点
- Svelte 5 的 runes 和 `mount()` 函数在 browser 入口点中可用
- 仅在 Vitest 环境（`process.env.VITEST`）应用此配置，不影响正常构建

### 成功模式
- **测试通过**: 所有10个 WishCard 组件测试通过
- **环境验证**: 测试运行在 jsdom 浏览器环境（而非服务器环境）
- **文档来源**: Svelte 官方文档 https://github.com/sveltejs/svelte/blob/main/documentation/docs/07-misc/02-testing.md

### 避坑备忘
- **Svelte 5 测试特殊要求**: 必须添加 `resolve.conditions: ['browser']` 配置
- **环境配置顺序**: `environment: 'jsdom'` + `resolve.conditions` 双重保障
- **测试速度**: jsdom 环境初始化约 805ms（正常）

---

## [2026-04-03] 点赞动画与祝福语音实现要点

### 成功模式
- **Web Speech API**: 使用 SpeechSynthesisUtterance 播放祝福语音，无需额外音频文件
- **用户偏好持久化**: localStorage 存储语音开关，默认启用
- **星星飘落动画**: 使用 tokens.css 的 star-fall 动画类 + star-delay-1/2/3/4/5 延迟类
- **GPU 加速**: 使用 will-change: transform, opacity 提示浏览器优化
- **自动清理**: 3秒后使用 setTimeout 移除星星元素

### Design System 最佳实践
- **使用现有动画类**: 不重新定义动画，复用 tokens.css 的 star-fall
- **随机位置**: Math.random() * 100 + '%' 生成随机水平位置
- **延迟循环**: 延迟索引 % 5 复用 star-delay-1/2/3/4/5

### 测试经验
- **Mock Web Speech API**: jsdom 没有 SpeechSynthesisUtterance，需要手动 Mock
- **configurable: true**: Object.defineProperty 必须设置 configurable: true 才能重新定义
- **异步清理测试**: 使用 vi.useFakeTimers() + vi.runAllTimersAsync() 阻止自动清理
- **Promise flush**: vi.advanceTimersByTime + await vi.runAllTimersAsync() 确保异步完成

### 避坑备忘
- **异步测试陷阱**: 动画元素在 Promise await 后已移除，需要在清理前检查
- **speechSynthesis Mock**: jsdom 已有 speechSynthesis 定义，必须 configurable: true
- **星星数量范围**: Math.max(5, Math.min(10, count)) 确保 5-10 范围

---

## [2026-04-03] 设计系统完整性验证

### 设计系统检查清单
- ✅ 使用 tokens.css 动画类（star-fall）
- ✅ 使用 tokens.css 延迟类（star-delay-1/2/3/4/5）
- ✅ 使用 Design Tokens（无硬编码颜色/间距）
- ✅ 遵循现有命名约定（语义化命名）
- ✅ 匹配现有组件模式（Svelte 5 runes）

### 文件级注释规范
- 文件头 @description 是必要的公共 API 文档（强制注释标准 Level 1）
- 关键逻辑注释（[CRITICAL]）解释业务意图（强制注释标准 Level 3）
- 测试 Mock 注释是必要的测试环境配置说明

---

## [2026-04-03] TypeScript DOM 类型断言修复

### 问题根因
- `querySelectorAll()` 返回 `NodeListOf<Element>`（基类）
- `Element` 没有 `style` 属性（DOM API 设计）
- `HTMLElement` 继承 `Element`，才有 `style` 属性
- 访问 DOM 样式需要类型断言

### 修复模式
```typescript
// 错误写法
const stars = container.querySelectorAll('.star-fall');
stars.forEach(star => {
  const left = star.style.left;  // ❌ 类型错误
});

// 正确写法
const stars = container.querySelectorAll('.star-fall');
stars.forEach(star => {
  const left = (star as HTMLElement).style.left;  // ✅ 类型断言
});
```

### 最佳实践
- **类型断言**: DOM 操作时使用 `as HTMLElement` 访问样式属性
- **验证流程**: svelte-check + npm test 双重验证
- **修复范围**: 仅修改类型断言，不改变测试逻辑

### 避坑备忘
- `Element` 是 DOM 基类（抽象概念）
- `HTMLElement` 是实际 DOM 元素（有样式、事件等）
- TypeScript 严格模式下必须类型断言

---

## [2026-04-03] 推荐按钮实现要点

### 成功模式
- **简洁动画**: 推荐按钮使用 transform: scale 缩放动画，比点赞星星飘落更简单
- **禁用防重复**: 按钮点击后立即禁用（button.disabled = true），防止重复提交
- **高亮反馈**: 推荐成功后添加 CSS 类（recommend-highlight），使用星空蓝配色 + 星光效果
- **定时恢复**: setTimeout 在禁用时长后恢复按钮（disabled = false）
- **GPU 加速**: will-change: transform 提示浏览器优化动画性能

### Design System 最佳实践
- **复用 tokens.css**: 使用 --duration-fast、--ease-out、--color-secondary-400、--shadow-glow
- **动态类名**: JavaScript 动态添加 CSS 类（classList.add），Svelte 编译器无法检测（预期警告）
- **Promise 返回**: 返回 Promise，await 后按钮已恢复状态

### 测试经验
- **禁用状态验证**: expect(button.disabled).toBe(true) 验证初始禁用
- **定时器快进**: vi.advanceTimersByTimeAsync 快进到高亮时长/禁用时长
- **类名移除验证**: expect(button.classList.contains('recommend-highlight')).toBe(false)
- **缩放验证**: expect(button.style.transform).toBe('scale(1.1)')
- **自定义配置**: 验证自定义 disableDuration、highlightDuration、scaleRatio

### 避坑备忘
- **CSS 未使用选择器警告**: JavaScript 动态添加的类会触发 svelte-check 警告，属于预期行为
- **定时器顺序**: 高亮移除先于按钮恢复（highlightDuration < disableDuration）
- **GPU 加速清理**: 动画结束后清除 will-change 属性，避免持续占用 GPU

---

## [2026-04-03] WishCreator 心愿创建逻辑实现要点

### 成功模式
- **nanoid customAlphabet**: 使用 customAlphabet(ALPHABET, 6) 自定义 alphabet，确保仅包含字母和数字（不含 `_` 等特殊字符）
- **中文字符字数**: 使用 `.repeat()` 构造精确字数测试文本（如 '愿家人平安'.repeat(20) = 100字）
- **可选参数处理**: prepareWishInput 的 customKey 参数使用 `(customKey ?? '').trim()` 防止 undefined 调用 trim()
- **textarea 自闭合**: Svelte 中 textarea 必须使用显式闭合标签 `</textarea>`，不能使用自闭合 `/>`

### Design System 最佳实践
- **复用 tokens.css**: 使用 --color-*, --space-*, --radius-*, --font-size-* 等 tokens
- **响应式设计**: 使用 @media (min-width: 768px) 支持桌面端
- **验证错误提示**: 使用 aria-invalid + role="alert" 提供无障碍提示
- **字数统计实时显示**: $derived(countWishText(wishText)) 实时计算

### 测试经验
- **精确字数测试**: 使用 Node.js 脚本生成精确字数文本（node -e "console.log('愿家人平安'.repeat(20).length)")
- **可选参数 undefined**: 测试用例中 prepareWishInput(text) 不传第二个参数，验证 undefined 处理
- **XSS 防护测试**: 转义 &、<、> 符号，测试多重转义场景
- **碰撞检测**: 生成100次小钥匙/ID，验证全部唯一（Set.size = 100）

### 避坑备忘
- **nanoid 默认字符集**: 默认包含 `_`、`-` 等特殊字符，需要 customAlphabet 自定义
- **中文字符长度**: 中文字符在 JavaScript 中 length = 1（与英文字母相同），不是2
- **可选参数陷阱**: TypeScript 可选参数（?: string）可能为 undefined，必须先处理默认值

### 成功模式
- **Web Share API 优先**: 如果浏览器支持，使用原生分享功能（更简洁）
- **降级方案**: Clipboard API 失败时使用传统 `document.execCommand('copy')`
- **微博分享**: 使用 URL 方案（`https://service.weibo.com/share/share.php?title=...&url=...`）
- **微信分享（方案 B）**: 显示链接，提示用户手动复制（简单，无需 SDK）
- **底部弹出设计**: ShareModal 使用底部弹出动画（移动端友好）
- **桌面端居中**: 大于 768px 屏幕时，弹窗居中显示而非底部弹出

### Design System 最佳实践
- **复用 tokens.css**: 使用 --space-*, --radius-*, --font-size-*, --color-* 等 tokens
- **响应式设计**: 使用 `@media (min-width: 768px)` 支持桌面端
- **动画定义**: 使用 fadeIn + slideUp 动画（符合现有设计系统）
- **触摸目标优化**: min-height: 44px, min-width: 44px（移动端友好）

### 测试经验
- **Mock Clipboard API**: jsdom 有 navigator.clipboard，需要 Mock writeText
- **Mock document.execCommand**: jsdom 没有 execCommand，需要在 beforeEach 中 Mock
- **Mock navigator.share**: jsdom 没有 Web Share API，需要手动 Mock
- **Mock window.open**: 微博分享测试需要 Mock window.open
- **configurable: true**: Object.defineProperty 必须设置 configurable: true 才能重新定义

### 集成方式
- **ShareButton.svelte**: 独立组件，包含分享按钮 + 弹窗管理逻辑
- **WishCard.svelte**: 已有分享按钮（onShare 回调），无需修改
- **使用方式**: ShareButton 可作为 WishCard 的子组件，或 onShare 回调实现

### 避坑备忘
- **jsdom 限制**: jsdom 没有 execCommand、Web Share API，需要 Mock
- **降级方案测试**: Clipboard API 失败时，需要确保 execCommand Mock 在 beforeEach 中设置
- **URL 编码**: 微博分享参数需要 encodeURIComponent（已自动处理）
- **Toast 位置**: ShareModal 的 Toast 使用固定定位，bottom: var(--space-8)

