# 星辰大海产品升级研发计划

> **版本**: v1.0
> **创建日期**: 2026-04-04
> **计划执行者**: 技术部（状态 B）
> **设计文档**: 
> - `docs/10_Design/12_Feat_WishCardInteraction.md`
> - `docs/10_Design/13_Feat_VisualUpgrade.md`
> - `docs/10_Design/14_Feat_WishSeedData.md`

---

## 一、总体策略

### 1.1 执行原则

| 原则 | 说明 |
|------|------|
| **最小侵入** | 复用现有代码（LikeAction、RecommendAction、tokens.css） |
| **渐进增强** | 先完成核心功能，再优化细节 |
| **可回滚** | 每个模块独立提交，出问题可单独回滚 |
| **验证驱动** | 每个任务完成后立即手动验证 |

### 1.2 并行执行策略

```
Wave 1（可完全并行）:
├── 安装 Lucide Icons（5min）
├── 更新 tokens.css（15min）
└── 重写种子数据脚本（1h）

Wave 2（依赖 Wave 1）:
├── 创建 Icon 组件封装（30min）
└── 运行种子数据脚本（10min）

Wave 3（依赖 Wave 2）:
├── 替换底部导航图标（30min）
├── 替换心愿卡片图标（30min）
├── 替换弹窗图标（1h）
└── 集成交互动画（1h）

Wave 4（收尾）:
├── 文案升级（30min）
├── 手动验证（30min）
└── 代码审查与提交（30min）
```

---

## 二、任务分解

### Wave 1: 基础设施（可完全并行）

#### 任务 1.1: 安装 Lucide Icons
- **优先级**: 🔴 P0
- **工作量**: Quick（5min）
- **文件**: `package.json`, `package-lock.json`
- **命令**: `npm install lucide-svelte`
- **验证**: `npm list lucide-svelte` 显示版本号

#### 任务 1.2: 更新 Design Tokens
- **优先级**: 🔴 P0
- **工作量**: Quick（15min）
- **文件**: `src/styles/tokens.css`
- **修改内容**:
  ```css
  /* 新增图标尺寸系统 */
  --icon-size-xs: 16px;
  --icon-size-sm: 20px;
  --icon-size-base: 24px;
  --icon-size-lg: 28px;
  --icon-size-xl: 32px;
  
  /* 新增图标颜色系统 */
  --icon-color-default: var(--color-text-muted);
  --icon-color-active: var(--color-accent-gold);
  --icon-color-primary: var(--color-secondary-400);
  ```
- **验证**: 页面加载无报错

#### 任务 1.3: 重写种子数据脚本
- **优先级**: 🟠 P1
- **工作量**: Medium（1h）
- **文件**: `scripts/seed-wishes.js`（重写），删除 `scripts/generate-test-data.js`
- **修改内容**:
  - 更新为 100 条「打开心扉」版心愿
  - 实现幂律分布的点赞/推荐数
  - 实现时间分布模拟
  - 清理测试痕迹
- **验证**: 运行 `node scripts/seed-wishes.js` 成功

---

### Wave 2: 组件封装（依赖 Wave 1）

#### 任务 2.1: 创建 Icon 组件封装
- **优先级**: 🔴 P0
- **工作量**: Quick（30min）
- **文件**: 新建 `src/lib/components/Icon.svelte`
- **实现内容**:
  ```svelte
  <script lang="ts">
    import { Heart, Star, Share2, Key, Sparkles, Flame, LayoutGrid, Search, X, RefreshCw, AtSign, MessageCircle, Link } from 'lucide-svelte';
    
    const iconMap = {
      heart: Heart,
      star: Star,
      share: Share2,
      key: Key,
      sparkles: Sparkles,
      flame: Flame,
      grid: LayoutGrid,
      search: Search,
      x: X,
      refresh: RefreshCw,
      at: AtSign,
      message: MessageCircle,
      link: Link
    };
    
    interface Props {
      name: keyof typeof iconMap;
      size?: number;
      class?: string;
    }
    
    let { name, size = 24, class: className = '' }: Props = $props();
    const Icon = iconMap[name];
  </script>
  
  <Icon size={size} class={className} />
  ```
- **验证**: 在测试页面能正常渲染图标

#### 任务 2.2: 运行种子数据脚本
- **优先级**: 🟠 P1
- **工作量**: Quick（10min）
- **命令**: `node scripts/seed-wishes.js https://your-domain.com`
- **验证**: KV 中有 100 条新心愿

---

### Wave 3: 核心功能（依赖 Wave 2）

#### 任务 3.1: 替换底部导航图标
- **优先级**: 🔴 P0
- **工作量**: Quick（30min）
- **文件**: `src/components/BottomNav.svelte`
- **修改内容**:
  ```svelte
  <script>
    import Icon from '../lib/components/Icon.svelte';
    
    const tabs = [
      { id: 'like', icon: 'flame', label: '点亮心愿' },
      { id: 'publish', icon: 'sparkles', label: '许个心愿' },
      { id: 'square', icon: 'grid', label: '星空广场' }
    ];
  </script>
  
  {#each tabs as tab}
    <button class="nav-tab">
      <Icon name={tab.icon} size={28} />
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
  ```
- **验证**: 底部导航显示 SVG 图标，无 emoji

#### 任务 3.2: 替换心愿卡片图标
- **优先级**: 🔴 P0
- **工作量**: Quick（30min）
- **文件**: `src/components/WishCard.svelte`
- **修改内容**:
  ```svelte
  <script>
    import Icon from '../lib/components/Icon.svelte';
    import { triggerLikeAnimation } from '../lib/LikeAction';
  </script>
  
  <button class="action-btn like-btn" onclick={handleLikeClick}>
    <Icon name="heart" size={20} />
    <span>{currentLikes}</span>
  </button>
  
  <button class="action-btn recommend-btn" onclick={handleRecommendClick}>
    <Icon name="star" size={20} />
    <span>{currentRecommends}</span>
  </button>
  
  <button class="action-btn share-btn" onclick={handleShareClick}>
    <Icon name="share" size={20} />
    <span>分享</span>
  </button>
  ```
- **集成动画**:
  ```typescript
  async function handleLikeClick() {
    // ... API 调用
    if (json.success) {
      currentLikes = json.data.likes;
      
      // 触发星星飘落动画
      triggerLikeAnimation(articleElement);
      
      // 卡片发光
      articleElement.style.filter = 'brightness(1.15)';
      setTimeout(() => articleElement.style.filter = '', 600);
      
      // 文案升级
      toastMessage = '愿星辰大海守护你';
      showToast = true;
    }
  }
  ```
- **验证**: 点赞时触发星星飘落动画

#### 任务 3.3: 替换弹窗图标
- **优先级**: 🟠 P1
- **工作量**: Medium（1h）
- **文件**: 
  - `src/components/PublishModal.svelte`
  - `src/components/ShareModal.svelte`
  - `src/components/FirstTimeIntro.svelte`
- **修改内容**: 替换所有 emoji 为 SVG 图标
- **验证**: 所有弹窗显示 SVG 图标，无 emoji

#### 任务 3.4: 集成交互动画
- **优先级**: 🔴 P0
- **工作量**: Medium（1h）
- **文件**: `src/components/WishCard.svelte`
- **修改内容**:
  - 集成 `LikeAction.ts`（星星飘落 + 语音）
  - 集成 `RecommendAction.ts`（按钮缩放 + 高亮）
  - 添加数字跳动动画
  - 添加卡片发光效果
- **验证**: 
  - 点赞 → 星星飘落 + 语音 + 卡片发光
  - 推荐 → 按钮缩放 + 高亮

---

### Wave 4: 收尾工作

#### 任务 4.1: 文案升级
- **优先级**: 🟠 P1
- **工作量**: Quick（30min）
- **文件**: 
  - `src/components/BottomNav.svelte`（导航文案）
  - `src/components/FirstTimeIntro.svelte`（确认按钮）
  - `src/components/WishCard.svelte`（Toast 消息）
- **修改内容**:
  | 位置 | 当前 | 升级 |
  |------|------|------|
  | 导航 Tab 1 | 全民点赞 | 点亮心愿 |
  | 导航 Tab 2 | 发布心愿 | 许个心愿 |
  | 导航 Tab 3 | 心愿广场 | 星空广场 |
  | 确认按钮 | I get | 我懂了 |
  | 点赞 Toast | ❤️ 祝福已送达！ | 愿星辰大海守护你 |
  | 推荐 Toast | 🌟 已推荐！ | 为光明添砖加瓦 |
  | 分享 Toast | 📤 分享成功！ | 让心愿飞向更远方 |
- **验证**: 所有文案已更新

#### 任务 4.2: 手动验证
- **优先级**: 🔴 P0
- **工作量**: Quick（30min）
- **验证清单**:
  - [ ] 底部导航显示 SVG 图标，无 emoji
  - [ ] 心愿卡片操作按钮显示 SVG 图标
  - [ ] 点赞触发星星飘落动画 + 语音
  - [ ] 推荐触发按钮缩放动画
  - [ ] 分享触发星光散开动画
  - [ ] Toast 消息文案已升级
  - [ ] 导航文案已升级
  - [ ] 确认按钮文案已升级
  - [ ] KV 中有 100 条新心愿
  - [ ] 无测试痕迹

#### 任务 4.3: 代码审查与提交
- **优先级**: 🟠 P1
- **工作量**: Quick（30min）
- **提交策略**:
  - Wave 1 → 单独提交：`chore: 安装 Lucide Icons + 更新 Design Tokens`
  - Wave 2 → 单独提交：`feat: 创建 Icon 组件 + 重写种子数据脚本`
  - Wave 3 → 单独提交：`feat: 替换图标 + 集成交互动画`
  - Wave 4 → 单独提交：`feat: 文案情感化升级`

---

## 三、依赖关系

```
任务 1.1 (安装 Lucide) ──┐
任务 1.2 (更新 Tokens) ──┼──> 任务 2.1 (Icon 组件) ──┐
任务 1.3 (种子数据)  ────┘                          │
                                                   ├──> 任务 3.x (核心功能)
任务 2.2 (运行脚本) ─────────────────────────────────┘     │
                                                           │
                                                        任务 4.x (收尾)
```

---

## 四、风险点与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|---------|
| Lucide Icons 包体积过大 | 低 | 中 | 按需引入，Tree-shaking |
| 语音 API 浏览器兼容性 | 中 | 低 | 已有 localStorage 开关，用户可关闭 |
| 种子数据脚本运行失败 | 低 | 高 | 先在测试环境验证，再在生产环境执行 |
| 动画与组件集成报错 | 中 | 中 | 分步集成，每步验证 |
| 用户习惯 emoji | 低 | 低 | 新图标更清晰，用户会适应 |

---

## 五、验收标准

| 维度 | 成功标准 | 验证方式 |
|------|---------|---------|
| **图标一致性** | 所有图标使用 SVG，无 emoji | grep 搜索 emoji 字符 |
| **跨平台一致** | iOS/Android/Windows 显示相同 | 截图对比 |
| **交互闭环** | 点赞/推荐/分享有动画反馈 | 手动测试 |
| **文案情感化** | 导航文案升级为动词短语 | 代码审查 |
| **数据质量** | 100 条心愿无测试痕迹 | 人工检查 |
| **沉浸感** | 用户感觉是真实数据 | 用户测试 |

---

## 六、时间预估

| Wave | 任务数 | 工作量 | 累计 |
|------|-------|-------|------|
| Wave 1 | 3 | 1.5h | 1.5h |
| Wave 2 | 2 | 0.7h | 2.2h |
| Wave 3 | 4 | 3h | 5.2h |
| Wave 4 | 3 | 1.5h | 6.7h |

**总工作量**: Medium（约 7 小时）

---

## 七、执行命令

```bash
# Wave 1
npm install lucide-svelte
# 更新 src/styles/tokens.css
# 重写 scripts/seed-wishes.js

# Wave 2
# 创建 src/lib/components/Icon.svelte
node scripts/seed-wishes.js https://your-domain.com

# Wave 3
# 修改 src/components/BottomNav.svelte
# 修改 src/components/WishCard.svelte
# 修改 src/components/PublishModal.svelte
# 修改 src/components/ShareModal.svelte
# 修改 src/components/FirstTimeIntro.svelte

# Wave 4
# 文案升级
# 手动验证
# Git 提交
```

---

## 八、变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2026-04-04 | v1.0 | 初版研发计划 | 技术部 |