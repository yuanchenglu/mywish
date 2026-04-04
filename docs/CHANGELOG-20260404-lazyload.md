# 心愿广场无限滚动懒加载功能

> **Commit**: 3e3e1ec
> **日期**: 2026-04-04
> **作者**: OpenCode (Sisyphus)

---

## 一、业务需求

### 1.1 背景

用户在心愿广场浏览时，只能看到 10 条心愿，无法继续浏览更多内容。原本的设计只加载了 10 条心愿，没有分页或懒加载机制。

### 1.2 需求目标

- 用户能够浏览所有心愿（当前共 283 条）
- 滚动体验流畅，不需要手动点击"加载更多"
- 预加载机制：用户滚动时提前加载下一批数据，减少等待时间

### 1.3 验收标准

| 标准 | 结果 |
|------|------|
| 初始加载不少于 20 条 | ✅ 初始加载 20 条 |
| 滚动到底部自动加载 | ✅ 滚动到 70% 位置自动预加载 |
| 显示加载状态 | ✅ "加载更多..." 提示 |
| 显示到底提示 | ✅ "已经到底了" 提示 |
| API 支持分页 | ✅ `GET /api/wishes?page=1&limit=20` |

---

## 二、技术方式

### 2.1 前端实现

**文件**: `src/routes/+page.svelte`

**新增状态变量**:
```typescript
let loadingMore = $state(false);      // 加载更多中
let hasMore = $state(true);           // 是否还有更多
let currentPage = $state(1);          // 当前页码
let totalWishes = $state(0);          // 总数

const PAGE_SIZE = 20;                 // 每页条数
const PRELOAD_THRESHOLD = 10;         // 预加载阈值（未使用，改为百分比）
```

**核心函数**:

1. `loadWishes()` - 初始加载
   - 重置页码为 1
   - 请求第一页数据
   - 更新 hasMore 状态

2. `loadMoreWishes()` - 加载更多
   - 检查是否正在加载、是否还有更多
   - 请求下一页数据
   - 追加到现有列表

3. `handleScroll()` - 滚动监听
   - 检测滚动位置
   - 当滚动到页面 70% 位置时触发预加载
   - 避免重复加载

**滚动监听注册**:
```typescript
onMount(() => {
  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
});
```

### 2.2 后端 API

**文件**: `functions/api/wishes.ts`

已有分页支持，无需修改：
```
GET /api/wishes?page=1&limit=20
```

返回格式：
```json
{
  "success": true,
  "data": {
    "wishes": [...],
    "page": 1,
    "limit": 20,
    "total": 283
  }
}
```

---

## 三、核心逻辑

### 3.1 懒加载流程图

```
用户进入心愿广场
       │
       ▼
  loadWishes()
  加载第 1 页 (20 条)
       │
       ▼
  用户向下滚动
       │
       ▼
  handleScroll() 触发
       │
       ├─ 滚动位置 < 70% → 不处理
       │
       └─ 滚动位置 >= 70%
              │
              ▼
         loadMoreWishes()
         加载下一页
              │
              ▼
         追加到 wishes[]
              │
              ▼
         更新 hasMore
              │
              ├─ 还有更多 → 继续监听
              │
              └─ 没有更多 → 显示"已经到底了"
```

### 3.2 预加载策略

**触发条件**: 滚动位置 >= 页面高度的 70%

```typescript
const scrollPosition = window.innerHeight + window.scrollY;
const documentHeight = document.documentElement.scrollHeight;
const threshold = documentHeight * 0.3;

if (scrollPosition >= documentHeight - threshold) {
  loadMoreWishes();
}
```

**为什么是 70%**:
- 提前加载，用户滚动到底部时数据已准备好
- 避免过早加载浪费资源
- 平衡用户体验和性能

---

## 四、数据流转

### 4.1 数据流向

```
Cloudflare KV (wishes:all)
       │
       ▼
GET /api/wishes?page=1&limit=20
       │
       ▼
前端接收 JSON
       │
       ▼
wishes[] 状态数组
       │
       ▼
WishCard 组件渲染
```

### 4.2 状态管理

| 状态 | 类型 | 说明 |
|------|------|------|
| `wishes` | `Wish[]` | 心愿列表数据 |
| `loading` | `boolean` | 初始加载中 |
| `loadingMore` | `boolean` | 加载更多中 |
| `hasMore` | `boolean` | 是否还有更多 |
| `currentPage` | `number` | 当前页码 |
| `totalWishes` | `number` | 服务端返回的总数 |

---

## 五、相关改动

### 5.1 冷启动数据脚本更新

**文件**: `scripts/seed-wishes.js`

移除推荐数相关代码：
- 删除 `REC_RANGES` 配置
- 删除 `addRecommends()` 函数
- 删除推荐数相关的 console 输出

### 5.2 补充点赞脚本更新

**文件**: `scripts/supplement-likes.js`

更新心愿 key 映射为最新创建的心愿 key。

---

## 六、测试验证

### 6.1 功能测试

```bash
# API 测试
curl -s "https://mywish.starseas.org/api/wishes?page=1&limit=20" | jq '.data.total'
# 输出: 283

# 验证分页
curl -s "https://mywish.starseas.org/api/wishes?page=2&limit=20" | jq '.data.wishes | length'
# 输出: 20
```

### 6.2 前端测试

1. 打开 https://mywish.starseas.org/
2. 切换到「漫步星空」tab
3. 验证初始显示 20 条心愿
4. 向下滚动，验证自动加载更多
5. 滚动到底部，验证"已经到底了"提示

---

## 七、后续优化建议

1. **虚拟列表**: 当心愿数量超过 500 条时，考虑使用虚拟滚动优化性能
2. **骨架屏**: 加载时显示骨架屏而非纯文字
3. **下拉刷新**: 添加下拉刷新功能
4. **离线缓存**: 使用 Service Worker 缓存已加载的数据