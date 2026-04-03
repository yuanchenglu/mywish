# 心愿卡片交互升级设计方案

> **版本**: v1.0
> **创建日期**: 2026-04-04
> **状态**: 方案冻结，等待技术部实现
> **设计者**: 产品设计部（状态 A）

---

## 一、背景与目标

### 1.1 问题诊断

**当前得分：60分**

| 维度 | 痛点 | 影响 |
|------|------|------|
| **动画与组件割裂** | LikeAction.ts、RecommendAction.ts 已定义动画，但 WishCard.svelte 未调用 | 用户点赞/推荐只看到 Toast 文字，无视觉冲击 |
| **反馈单调** | 点赞/推荐/分享只有 Toast 文字反馈 | 无仪式感，用户无感 |
| **情绪价值缺失** | 用户期待"传递祝福的神圣感"，实际是"数字+1的无感" | 与目标用户心理预期不符 |
| **Top3 机制未落地** | 每小时 Top3 推荐上首页未实现，无徽章展示 | 用户缺乏推荐动力 |

### 1.2 核心目标

| 维度 | 当前得分 | 目标得分 | 提升路径 |
|------|---------|---------|---------|
| **反馈丰富度** | 60分（仅 Toast 文字） | 95分（动画+语音+徽章） | 集成现有动画代码 |
| **情绪价值** | 40分（功能型无感） | 90分（仪式感闭环） | 文案升级+视觉冲击 |
| **用户动机** | 低（无可见回报） | 高（荣誉徽章+社交激励） | Top3 机制落地 |

---

## 二、目标用户心理分析

### 2.1 用户画像

**核心画像：精神寄托型轻量用户**

| 维度 | 特征 | 设计应对 |
|------|------|---------|
| **动机** | 发布心愿寄托情感 | 发布成功需"神圣感"反馈 |
| **期待** | 被祝福、被看见、被认可 | 点赞需"祝福仪式"，推荐需"荣誉仪式" |
| **仪式感需求** | 相信光、吸引力法则 | 动画+语音+徽章 = 神圣感闭环 |
| **社交预期** | 心愿飞向更远方 | 分享需"传播仪式"反馈 |

### 2.2 用户心理旅程（发布后）

```
发布心愿
    │
    ├─→ 期待被看见 → 需要心愿卡片有吸引力（视觉升级）
    │
    ├─→ 期待被祝福 → 需要点赞有仪式感（星星飘落+语音）
    │
    ├─→ 期待被认可 → 需要推荐有荣誉感（Top3徽章）
    │
    └─→ 期待传播 → 需要分享有成就感（星光散开）
```

---

## 三、三个核心动作的情绪价值设计

### 3.1 点赞 → 祝福仪式（P0 最高优先级）

#### 用户心理预期

```
点击 ❤️ → 我在传递祝福 → 期待"神圣感"反馈
```

#### 当前体验（60分）

```
点击 ❤️ → Toast "祝福已送达" → 数字+1 → ❌ 无感
```

#### 升级方案（90分）

| 反馈层 | 内容 | 情绪价值 | 技术实现 |
|-------|------|---------|---------|
| **视觉层** | 7颗星星飘落 | ✨ 神圣感 | LikeAction.ts（已有） |
| **听觉层** | "愿星辰大海守护你"语音 | 🎵 仪式感 | BlessingVoice.ts（已有） |
| **动效层** | 数字跳动动画 | 📈 成长感 | CSS transition（新增） |
| **氛围层** | 心愿卡片微微发光 | ✨ 被祝福感 | CSS filter（新增） |
| **文案层** | "愿星辰大海守护你" | 💬 温暖感 | Toast 文案升级 |

#### 视觉效果示意

```
点赞前：
┌─────────────────────────┐
│   心愿内容文字          │
│   ❤️ 12  🌟 5           │
└─────────────────────────┘

点赞后（500ms内）：
┌─────────────────────────┐
│   心愿内容文字          │ ✨✨✨ 星星飘落
│   ❤️ 13→ 🌟 5           │（数字跳动）
│   [卡片微微发光]        │ 🎵 语音播放
└─────────────────────────┘
    ↓
Toast：愿星辰大海守护你
```

#### 技术集成要点

```typescript
// WishCard.svelte
import { triggerLikeAnimation } from '../lib/LikeAction';

async function handleLikeClick() {
  const res = await fetch('/api/like', { method: 'POST', body: ... });
  if (json.success) {
    currentLikes = json.data.likes;
    
    // 1. 触发星星飘落动画（已有代码）
    triggerLikeAnimation(articleElement);
    
    // 2. 卡片微微发光（新增）
    articleElement.style.filter = 'brightness(1.15)';
    setTimeout(() => articleElement.style.filter = '', 600);
    
    // 3. 文案升级（已有代码）
    toastMessage = '愿星辰大海守护你';
    showToast = true;
  }
}
```

#### 边界情况

| 场景 | 处理方案 |
|------|---------|
| 用户关闭语音 | BlessingVoice.ts 已有 localStorage 开关 |
| 重复点赞 | LikeAction.ts 禁用按钮 |
| 移动端卡顿 | 降低星星数量（7→5） |

---

### 3.2 推荐 → 荣誉仪式（P1 次要优先级）

#### 用户心理预期

```
点击 🌟 → 我在认可这个心愿 → 期待"荣誉感"反馈
```

#### 当前体验（60分）

```
点击 🌟 → Toast "已推荐" → 数字+1 → ❌ 无荣誉感
```

#### 升级方案（90分）

| 反馈层 | 内容 | 情绪价值 | 技术实现 |
|-------|------|---------|---------|
| **视觉层** | 按钮缩放+金色光环 | ✨ 被认可感 | RecommendAction.ts（已有） |
| **动效层** | 数字跳动动画 | 📈 成长感 | CSS transition（新增） |
| **文案层** | "为光明添砖加瓦" | 💬 使命感 | Toast 文案升级 |
| **荣誉层** | Top3徽章展示 | 🏆 成就感 | 条件渲染（新增） |

#### Top3徽章设计

```
状元（第1名）：🥇 金色徽章 + "状元"称号
榜眼（第2名）：🥈 银色徽章 + "榜眼"称号
探花（第3名）：🥉 铅色徽章 + "探花"称号
```

#### 视觉效果示意

```
推荐前：
┌─────────────────────────┐
│   心愿内容文字          │
│   ❤️ 12  🌟 5           │
└─────────────────────────┘

推荐后（500ms内）：
┌─────────────────────────┐
│   心愿内容文字          │
│   ❤️ 12  🌟 6→          │（数字跳动）
│   [按钮金色光环]        │
└─────────────────────────┘
    ↓
Toast：为光明添砖加瓦

如果进入Top3：
┌─────────────────────────┐
│   🥇 状元               │（新增徽章）
│   心愿内容文字          │
│   ❤️ 12  🌟 6           │
└─────────────────────────┘
```

#### 技术集成要点

```typescript
// WishCard.svelte
import { triggerRecommend } from '../lib/RecommendAction';

async function handleRecommendClick(event) {
  const button = event.currentTarget;
  const res = await fetch('/api/recommend', { method: 'POST', body: ... });
  if (json.success) {
    currentRecommends = json.data.recommends;
    
    // 1. 触发按钮缩放+高亮（已有代码）
    triggerRecommend(button);
    
    // 2. 文案升级
    toastMessage = '为光明添砖加瓦';
    showToast = true;
  }
}
```

#### Top3徽章条件渲染

```svelte
<!-- WishCard.svelte 底部新增 -->
{#if wish.rank && wish.rank <= 3}
  <div class="top-badge">
    {#if wish.rank === 1}
      <span class="badge badge-gold">🥇 状元</span>
    {:elif wish.rank === 2}
      <span class="badge badge-silver">🥈 榜眼</span>
    {:elif wish.rank === 3}
      <span class="badge badge-bronze">🥉 探花</span>
    {/if}
  </div>
{/if}
```

---

### 3.3 分享 → 传播仪式（P2 最低优先级）

#### 用户心理预期

```
点击 🔗 → 我在让心愿飞向更远方 → 期待"成就感"反馈
```

#### 当前体验（60分）

```
点击 🔗 → Toast "链接已复制" → ❌ 无传播感
```

#### 升级方案（90分）

| 反馈层 | 内容 | 情绪价值 | 技术实现 |
|-------|------|---------|---------|
| **视觉层** | 星光散开动画 | ✨ 传播感 | CSS 动画（新增） |
| **文案层** | "让心愿飞向更远方" | 💬 使命感 | Toast 文案升级 |
| **动效层** | 分享按钮微动 | 📤 发送感 | CSS scale（已有） |

#### 视觉效果示意

```
分享前：
┌─────────────────────────┐
│   心愿内容文字          │
│   ❤️ 12  🌟 5  🔗       │
└─────────────────────────┘

分享后（500ms内）：
┌─────────────────────────┐
│   心愿内容文字          │
│   ❤️ 12  🌟 5  🔗       │
│   [星光散开动画]        │
└─────────────────────────┘
    ↓
Toast：让心愿飞向更远方
```

#### 技术集成要点

```typescript
// WishCard.svelte
async function handleShareClick() {
  const url = `${window.location.origin}/wish/${wish.key}`;
  
  if (navigator.share) {
    await navigator.share({ title: '心愿', text: wish.text, url });
  } else {
    await navigator.clipboard.writeText(url);
  }
  
  // 1. 触发星光散开动画（新增）
  shareButtonElement.classList.add('star-disperse');
  setTimeout(() => shareButtonElement.classList.remove('star-disperse'), 500);
  
  // 2. 文案升级
  toastMessage = '让心愿飞向更远方';
  showToast = true;
}
```

---

## 四、心愿卡片整体视觉升级

### 4.1 Design Tokens 统一引用

```css
/* WishCard.svelte 样式升级 */
.wish-card {
  /* 使用 tokens.css 统一变量 */
  background: var(--gradient-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-glass);
}

.action-btn {
  transition: all var(--duration-fast) var(--ease-out);
}

.action-btn:hover {
  transform: scale(1.05);
}
```

### 4.2 卡片进入动画

```css
/* tokens.css 新增 */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wish-card-enter {
  animation: card-enter 0.4s var(--ease-out);
}
```

### 4.3 数字跳动动画

```css
/* tokens.css 新增 */
@keyframes number-bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); color: var(--color-accent-gold); }
  100% { transform: scale(1); }
}

.number-bump {
  animation: number-bump 0.3s var(--ease-out);
}
```

---

## 五、实现优先级与工作量预估

| 优先级 | 任务 | 工作量 | 技术实现 |
|-------|------|-------|---------|
| 🔴 P0 | 点赞闭环（星星飘落+语音+发光+文案） | Quick（<1h） | 导入+调用现有代码 |
| 🟠 P1 | 推荐闭环（按钮缩放+徽章+文案） | Medium（2-3h） | 导入现有代码+徽章渲染 |
| 🟢 P2 | 分享闭环（星光散开+文案） | Quick（<30min） | 新增 CSS 动画+文案升级 |
| 🟢 P3 | 卡片整体视觉升级 | Quick（<30min） | 统一引用 tokens.css |

**总工作量预估**：Quick 级（<3h）

---

## 六、验收标准（DoD）

| 维度 | 成功标准 | 验证方式 |
|------|---------|---------|
| **点赞闭环** | 7颗星星飘落+语音播放+卡片发光+Toast 文案升级 | 手动点赞测试 |
| **推荐闭环** | 按钮缩放+高亮+Toast 文案升级 | 手动推荐测试 |
| **Top3徽章** | 状元/榜眼/探花徽章正确展示 | 检查 rank 字段 |
| **分享闭环** | 星光散开动画+Toast 文案升级 | 手动分享测试 |
| **性能** | 动画流畅，移动端无卡顿 | 低端设备测试 |
| **用户开关** | 语音可关闭，不影响其他反馈 | localStorage 测试 |

---

## 七、风险与边界

### 7.1 技术风险

| 风险 | 缓解措施 |
|------|---------|
| Top3徽章需后端 rank 字段 | 后端定时任务每小时更新排名 |
| 语音可能打扰用户 | BlessingVoice.ts 已有 localStorage 开关 |
| 移动端动画卡顿 | 降低星星数量（7→5），GPU 加速 |

### 7.2 用户风险

| 风险 | 缓解措施 |
|------|---------|
| 首次点赞语音打扰 | 弹窗询问："是否开启祝福语音？" |
| 动画重复触发 | LikeAction.ts 禁用按钮 |
| 用户不喜欢动画 | tokens.css 支持降级版本（纯 CSS 微动画） |

---

## 八、依赖声明

### Dependencies

| 文档 | 关系 | 说明 |
|------|------|------|
| `11_Feat_FirstTimeIntro.md` | 上下文关联 | 首次引导文案与本次交互文案风格需统一 |
| `kv-structure.md` | 数据依赖 | Top3徽章展示依赖 rank 字段，需参考数据结构设计 |

---

## 九、方案冻结声明

> **产品设计部（状态 A）已完成设计方案**
> 
> **核心结论**：
> - ✅ 技术可行性 100%（代码已写好，只是未集成）
> - ✅ 情绪价值闭环完整（三个动作均有仪式感反馈）
> - ✅ 优先级明确（点赞 > 推荐 > 分享）
> 
> **方案已冻结，请技术部接手实现。**
> 
> 预估工作量：Quick 级（<3h），主要是导入现有代码+调用。

---

## 十、变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2026-04-04 | v1.0 | 初版设计方案 | 产品设计部 |