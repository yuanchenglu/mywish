# 变更记录：用户体验优化

## 概述

**变更类型**: FIX（Bug 修复）
**变更日期**: 2026-04-04
**变更原因**: 用户反馈 5 个明显的产品体验问题

---

## 详细变更

### 1. 修复广场页面点赞后整页刷新问题

**业务需求**：
用户在广场页面点击心心点赞时，动画播放到一半突然中断，整个页面刷新，体验极差。

**技术方式**：
- 移除子组件向父组件的事件回调 `onLike?.()`
- 在 `WishCard` 组件内部直接更新本地状态
- 避免触发父组件重新渲染

**核心逻辑**：
```typescript
// 修改前：
onLike?.(); // 触发父组件 loadTop3()

// 修改后：
// 不调用 onLike，只在内部更新状态
currentLikes = json.data.likes;
likesIncrement = likesIncrement + 1;
```

**数据流转**：
```
用户点击 → WishCard.handleLikeClick() 
         → /api/like API 
         → 更新 local state (currentLikes, likesIncrement)
         → 动画播放完整
         → 不触发父组件更新
```

**修改文件**：
- `src/components/WishCard.svelte` (第 69-86 行)

---

### 2. 修复首页控制台报错 + Invalid Date 问题

**业务需求**：
用户打开首页时控制台有报错，Top3 页面日期显示 "Invalid Date"。

**技术方式**：
- 在 `HourlyTopItem` 接口添加可选字段 `created_at?: string`
- 更新 API 返回该字段
- 添加日期有效性检查函数

**核心逻辑**：
```typescript
// kv-schema.ts
export interface HourlyTopItem {
  // ... 其他字段
  created_at?: string; // 新增可选字段
}

// WishCard.svelte - formatRelativeTime()
if (isNaN(date.getTime())) {
  console.warn('无效日期:', dateString);
  return '未知时间';
}
```

**数据流转**：
```
top3.ts API → 从 Wish 获取 created_at 
            → 返回给前端 
            → WishCard 显示时间
```

**修改文件**：
- `kv-schema.ts` (第 96-97 行)
- `workers/api/top3.ts` (第 79 行)
- `src/components/WishCard.svelte` (第 36-42 行)

---

### 3. 优化卡片视觉设计

**业务需求**：
用户反馈卡片视觉效果不对称，建议将底部信息条移到卡片内容上面。

**技术方式**：
- 调整 DOM 结构顺序
- CSS 布局从 `justify-content: space-between` 改为 `justify-content: center`
- 添加上下边框形成视觉分隔

**核心逻辑**：
```html
<!-- 修改后的 DOM 结构 -->
<p class="wish-text">{wish.text}</p>
<div class="wish-footer">  <!-- 移到上面 -->
  <button class="wish-key">...</button>
  <span class="wish-time">...</span>
</div>
<div class="wish-actions">
  <button class="like-btn">...</button>
  <button class="share-btn">...</button>
</div>
```

**视觉效果**：
```
┌─────────────────────────┐
│  🥇 状元 (排名徽章)      │
│                         │
│  愿家人平安健康...       │  ← 心愿文字
│                         │
│  ─────────────────────  │
│  🔑 abc123 · 3小时前     │  ← 密钥时间（居中）
│  ─────────────────────  │
│                         │
│  ✨ 42    📤 分享        │  ← 操作按钮
└─────────────────────────┘
```

**修改文件**：
- `src/components/WishCard.svelte` (第 141-161 行, 第 256-290 行)

---

### 4. 修复发布心愿页面刷新按钮黑色背景问题

**业务需求**：
发布心愿页面的"重新生成密钥"按钮是黑色背景，在深色背景上看不见。

**技术方式**：
- 将 `.regenerate-btn` 的背景从 `transparent` 改为 `rgba(255, 255, 255, 0.15)`
- hover 时背景变亮

**核心逻辑**：
```css
/* 修改前 */
background: transparent;

/* 修改后 */
background: rgba(255, 255, 255, 0.15);
border: 1px solid rgba(255, 255, 255, 0.3);
```

**视觉效果**：
- 默认：白色半透明背景，清晰可见
- hover：更亮的白色背景，带发光效果

**修改文件**：
- `src/routes/create/+page.svelte` (第 392-419 行)

---

## Manifest（关联 Commit）

| Commit Hash | 描述 |
|-------------|------|
| (待提交) | FIX: 用户体验优化 - 点赞动画、卡片布局、按钮样式、日期显示 |

---

## 影响范围

| 模块 | 影响程度 | 说明 |
|------|----------|------|
| 心愿卡片 | 高 | DOM 结构、样式、事件处理均有修改 |
| 首页 | 中 | handleLike 逻辑优化 |
| 发布页面 | 低 | 仅修改按钮样式 |
| API | 低 | 新增可选字段，向后兼容 |

---

## 回滚方案

如需回滚，执行：

```bash
git revert <commit-hash>
```

所有修改均在单一 commit 中，可安全回滚。