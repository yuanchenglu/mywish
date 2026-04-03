# Cloudflare KV 数据结构设计

> 版本: v1.0
> 更新时间: 2026-04-03
> KV Namespace ID: `ed6a9db909d24bbda3f430154ea264e2`

---

## 一、数据结构概览

### Key 命名规范

| Key 类型 | 格式 | 用途 |
|----------|------|------|
| 心愿数据 | `wish:{id}` | 存储心愿完整信息 |
| 点赞计数器 | `likes:{id}` | 点赞数（atomic increment） |
| 推荐计数器 | `recommends:{id}` | 推荐数（atomic increment） |
| 全局索引 | `wishes:all` | 所有心愿 ID 列表 |
| 时间索引 | `wishes:hour:{timestamp}` | 每小时 top3 心愿 |
| 搜索索引 | `keywords:{word}` | 倒排索引（关键词→心愿列表） |
| 小钥匙映射 | `key:{key}` | 小钥匙→心愿 ID 映射 |

---

## 二、心愿数据结构

### `wish:{id}`

**存储心愿完整信息，使用 nanoid 生成的唯一 ID**

```json
{
  "id": "abc123def456",
  "key": "xY9zKm",
  "text": "愿家人平安健康，幸福美满",
  "likes": 0,
  "recommends": 0,
  "created_at": "2026-04-03T10:30:00Z",
  "updated_at": "2026-04-03T10:30:00Z",
  "hour_bucket": "2026-04-03T10"
}
```

**字段说明**:

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| `id` | string | 心愿唯一 ID（nanoid 12 位） | ✅ |
| `key` | string | 心愿小钥匙（nanoid 6 位，用户可选设置） | ❌ |
| `text` | string | 心愿内容（最大 100 字） | ✅ |
| `likes` | number | 点赞数（初始为 0） | ✅ |
| `recommends` | number | 推荐数（初始为 0） | ✅ |
| `created_at` | string | 创建时间（ISO 8601） | ✅ |
| `updated_at` | string | 更新时间（ISO 8601） | ✅ |
| `hour_bucket` | string | 所属小时桶（格式: YYYY-MM-DDTHH） | ✅ |

**注意事项**:
- `id` 使用 nanoid(12) 生成，确保唯一性
- `key` 用户可选设置，如未设置则为空字符串
- `likes` 和 `recommends` 初始值为 0，实际计数存储在独立的计数器 Key 中
- `hour_bucket` 用于每小时统计，格式为 `2026-04-03T10`（小时精度）

---

## 三、计数器结构

### `likes:{id}`

**存储点赞数，使用 KV atomic increment API**

```json
42
```

**特点**:
- 使用 KV 的 `increment()` 方法实现原子递增
- 避免 race condition（多用户同时点赞）
- 初始值为 0，创建心愿时同步创建

### `recommends:{id}`

**存储推荐数，使用 KV atomic increment API**

```json
15
```

**特点**:
- 同样使用 `increment()` 方法
- 用于每小时 top3 统计的依据
- 初始值为 0

---

## 四、索引结构

### `wishes:all`

**全局索引，存储所有心愿 ID 列表**

```json
[
  "abc123def456",
  "ghi789jkl012",
  "mno345pqr678"
]
```

**用途**:
- 心愿广场随机加载（从列表随机选取 10 条）
- 遍历所有心愿（用于统计、sitemap 生成）
- 心愿总数统计

**维护方式**:
- 发布心愿时追加 ID 到列表
- 使用 `KV.put()` 全量更新（注意：大列表需要分片处理）

**分片策略**（当心愿数超过 1000）:
```
wishes:all:0 → [id1...id1000]
wishes:all:1 → [id1001...id2000]
wishes:all:meta → {"total": 2500, "shards": 3}
```

---

### `wishes:hour:{timestamp}`

**每小时 top3 心愿索引，Cron 任务每小时生成**

格式: `wishes:hour:2026-04-03T10`

```json
[
  {
    "id": "abc123def456",
    "key": "xY9zKm",
    "text": "愿家人平安健康",
    "recommends": 42,
    "rank": "状元"
  },
  {
    "id": "ghi789jkl012",
    "key": "aB3cD",
    "text": "祝福祖国繁荣昌盛",
    "recommends": 35,
    "rank": "榜眼"
  },
  {
    "id": "mno345pqr678",
    "key": "eF5gH",
    "text": "愿世界和平",
    "recommends": 28,
    "rank": "探花"
  }
]
```

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 心愿 ID |
| `key` | string | 心愿小钥匙 |
| `text` | string | 心愿内容 |
| `recommends` | number | 该小时内的推荐数 |
| `rank` | string | 排名称号（状元/榜眼/探花） |

**生成逻辑**:
1. Cron 每小时触发（如 10:00 统计 09:00-10:00）
2. 查询 `hour_bucket = 2026-04-03T09` 的所有心愿
3. 按 `recommends` 降序排序取 top3
4. 写入 `wishes:hour:2026-04-03T09`

---

### `keywords:{word}`

**倒排索引，用于关键词搜索**

格式: `keywords:平安`

```json
["abc123def456", "ghi789jkl012", "mno345pqr678"]
```

**特点**:
- 存储包含该关键词的心愿 ID 列表
- 支持模糊匹配（如搜索"平安"匹配"平安健康"、"出入平安"）
- 发布心愿时提取关键词并更新索引

**关键词提取规则**:
- 中文分词：提取 2-4 字的常用词组
- 示例关键词：平安、健康、快乐、幸福、祖国、星辰大海
- 黑名单过滤：排除敏感词汇

**搜索逻辑**:
```
用户搜索 "平安"
→ 查询 keywords:平安
→ 返回心愿 ID 列表
→ 批量查询 wish:{id} 获取详情
```

---

## 五、小钥匙映射

### `key:{key}`

**小钥匙→心愿 ID 映射，用于通过小钥匙找回心愿**

格式: `key:xY9zKm`

```json
"abc123def456"
```

**用途**:
- 用户通过小钥匙找回心愿
- 检查小钥匙唯一性（发布时检查）

**唯一性保证**:
```typescript
// 发布心愿时
const key = nanoid(6);
const existing = await KV.get(`key:${key}`);
if (existing) {
  // retry: 重新生成直到唯一
}
await KV.put(`key:${key}`, wishId);
```

---

## 六、数据生命周期

### 写入流程（发布心愿）

```
1. 生成 wishId = nanoid(12)
2. 生成/验证 key = nanoid(6) 或用户设置
3. 提取关键词 keywords = extractKeywords(text)
4. 计算 hourBucket = getCurrentHourBucket()

写入 KV:
- wish:{wishId} → 心愿数据
- likes:{wishId} → 0
- recommends:{wishId} → 0
- key:{key} → wishId (如果设置了小钥匙)
- keywords:{word} → 追加 wishId (每个关键词)
- wishes:all → 追加 wishId
```

### 读取流程（点赞操作）

```
1. 用户点击点赞按钮
2. POST /api/like/{wishId}
3. KV.increment('likes:{wishId}')
4. 返回最新点赞数 + 祝福语音触发
```

### 统计流程（每小时 Cron）

```
1. Cron Trigger 每小时触发
2. 查询上一小时的心愿（通过 hour_bucket）
3. 按 recommends 排序取 top3
4. 写入 wishes:hour:{timestamp}
```

---

## 七、容量与性能考虑

### KV 存储限制

| 项目 | 限制 | 备注 |
|------|------|------|
| 单个 Key 值大小 | 25 MB | 心愿数据远低于此限制 |
| 单个 Namespace Key 数 | 无限制 | 心愿数量无上限 |
| 读取延迟 | ~10-50ms | 全球分布式，延迟低 |
| 写入延迟 | ~50-100ms | 比读取略慢 |

### 性能优化策略

| 场景 | 优化方案 |
|------|----------|
| `wishes:all` 过大 | 分片存储，每 1000 条一个分片 |
| 搜索关键词过多 | 只索引高频关键词（出现 >5 次） |
| 热门心愿高并发点赞 | 使用 atomic increment 避免 race condition |
| sitemap 生成慢 | 定期生成静态 sitemap，而非实时 |

---

## 八、错误处理

### Key 不存在处理

```typescript
// 读取心愿
const wish = await KV.get(`wish:${id}`, 'json');
if (!wish) {
  return { error: 'WISH_NOT_FOUND', message: '心愿不存在' };
}
```

### 计数器初始值处理

```typescript
// atomic increment 返回新值，如果 Key 不存在则从 0 开始
const newLikes = await KV.increment(`likes:${id}`);
// 返回 1（首次点赞）
```

### 搜索空结果处理

```typescript
const wishIds = await KV.get(`keywords:${keyword}`, 'json');
if (!wishIds || wishIds.length === 0) {
  return { error: 'NO_RESULTS', message: '没有找到相关心愿' };
}
```

---

## 九、API 与 KV 操作对应

| API 端点 | KV 操作 |
|----------|---------|
| `POST /api/wish` | `KV.put('wish:{id}')`, `KV.put('key:{key}')`, `KV.put('keywords:{word}')`, `KV.put('wishes:all')` |
| `POST /api/like/{id}` | `KV.increment('likes:{id}')` |
| `POST /api/recommend/{id}` | `KV.increment('recommends:{id}')` |
| `GET /api/wish/{key}` | `KV.get('key:{key}')` → `KV.get('wish:{id}')` |
| `GET /api/search?q={keyword}` | `KV.get('keywords:{keyword}')` → 批量 `KV.get('wish:{id}')` |
| `GET /api/wishes` | `KV.get('wishes:all')` → 随机选取 → 批量 `KV.get('wish:{id}')` |
| `GET /api/top3` | `KV.get('wishes:hour:{latestHour}')` |
| Cron 每小时 | 查询 → 排序 → `KV.put('wishes:hour:{timestamp}')` |

---

## 十、监控与维护

### 建议监控指标

| 指标 | 说明 |
|------|------|
| `wishes:all` 长度 | 心愿总数 |
| `wishes:hour:{timestamp}` 生成状态 | Cron 任务是否正常 |
| `keywords:{word}` 热门关键词 | 搜索热度分析 |

### 数据清理（可选）

- 旧小时索引保留策略：保留最近 30 天的 `wishes:hour:{timestamp}`
- 心愿数据：暂不清理（情感价值数据，建议永久保留）

---

## 附录：Cloudflare KV API 参考

### 常用操作

```typescript
// 写入 JSON 数据
await KV.put('wish:abc123', JSON.stringify(wishData));

// 读取 JSON 数据
const wish = await KV.get('wish:abc123', 'json');

// 原子递增
const newValue = await KV.increment('likes:abc123');

// 删除 Key
await KV.delete('wish:abc123');

// 列出 Keys（用于批量操作）
const list = await KV.list({ prefix: 'wish:' });
```

### 参考文档
- Cloudflare KV API: https://developers.cloudflare.com/kv/api/
- KV Bindings: https://developers.cloudflare.com/workers/runtime-apis/kv/