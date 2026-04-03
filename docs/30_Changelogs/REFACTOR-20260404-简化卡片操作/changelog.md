# Changelog - 简化卡片操作 + 星+Top3 增量排名

## Context (Why)

用户反馈：
1. 卡片三个按钮（星星、推荐、分享）容易混淆，希望简化
2. Top3 按总推荐数排名会导致长期霸榜，新心愿没有机会上榜

## Decision (How)

### 1. 卡片按钮简化

移除推荐按钮，只保留：
- 星星按钮：点赞功能
- 分享按钮：分享/复制链接

### 2. 首页改名

- "瓦数Top3" → "**星+Top3**"
- 描述更新为："每小时星星增量排行，见证心愿闪耀时刻"

### 3. Top3 增量排名机制

**KV 结构变更**:
```
新增: likes_hour:{hour}:{id} = 该小时内的星星增量
```

**点赞逻辑**:
```
1. likes:{id} += 1          // 总点赞数
2. likes_hour:{hour}:{id} += 1  // 当前小时增量
```

**Top3 查询**:
```
1. 获取当前小时桶 (YYYY-MM-DDTHH)
2. 查询所有心愿的该小时增量
3. 按增量降序排序，取 Top3
```

## Manifest (What)

### 修改的文件

| 文件 | 变更说明 |
|------|----------|
| `kv-schema.ts` | `HourlyTopItem.recommends` → `likes_increment`，新增 `likesHour()` |
| `workers/lib/kv-schema.ts` | 同步修改 |
| `functions/api/like.ts` | 点赞时双写：总点赞数 + 每小时增量 |
| `functions/api/top3.ts` | 改为查询当前小时增量排名 |
| `workers/api/top3.ts` | 同步修改 |
| `src/components/WishCard.svelte` | 移除推荐按钮，Top3 显示增量值 |
| `src/routes/+page.svelte` | 更新标题文案，移除推荐相关代码 |

### 废弃的功能

- `/api/recommend` API 保留但前端不再调用
- `recommends` 字段保留在数据结构中，但不再更新显示