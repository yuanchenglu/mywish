# PLAN - 简化卡片操作 + 星+Top3 增量排名

## 目标

1. 卡片按钮简化：移除推荐按钮，只保留星星 + 分享
2. 首页改名：瓦数Top3 → 星+Top3
3. Top3 改为增量排名：每小时星星增量排行，避免霸榜

## 技术方案

### 增量排名实现

**新增 KV Key 结构**:
```
likes_hour:{hour}:{id} = 增量值
```

示例：`likes_hour:2026-04-04T04:abc123` = 5

**点赞时双写**:
1. 更新总点赞数 `likes:{id}`
2. 更新当前小时增量 `likes_hour:{hour}:{id}`

**Top3 查询**:
1. 获取当前小时桶 `getCurrentHourBucket()`
2. 遍历所有心愿，查询每小时增量
3. 按增量降序排序，取前 3 名

### 文件变更清单

| 文件 | 变更类型 |
|------|----------|
| `kv-schema.ts` | 修改类型定义 |
| `workers/lib/kv-schema.ts` | 同步修改 |
| `functions/api/like.ts` | 新增增量记录 |
| `functions/api/top3.ts` | 改为增量查询 |
| `workers/api/top3.ts` | 同步修改 |
| `src/components/WishCard.svelte` | 移除推荐按钮 |
| `src/routes/+page.svelte` | 更新标题文案 |

## 风险评估

- **低风险**: 纯新增功能，不影响现有数据
- **兼容性**: 旧数据没有 `likes_hour` 记录，默认增量为 0，不影响显示