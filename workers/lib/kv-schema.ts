/**
 * @description Cloudflare KV 数据结构类型定义
 * @version 1.0
 * @date 2026-04-03
 */

// ============================================================================
// 心愿数据类型
// ============================================================================

/**
 * 心愿完整数据结构
 * 存储在 KV Key: `wish:{id}`
 */
export interface Wish {
  /** 心愿唯一 ID（nanoid 12 位） */
  id: string;
  /** 心愿小钥匙（nanoid 6 位，用户可选设置） */
  key: string;
  /** 心愿内容（最大 100 字） */
  text: string;
  /** 点赞数（显示值，实际计数在独立 Key） */
  likes: number;
  /** 推荐数（显示值，实际计数在独立 Key） */
  recommends: number;
  /** 创建时间（ISO 8601） */
  created_at: string;
  /** 更新时间（ISO 8601） */
  updated_at: string;
  /** 所属小时桶（格式: YYYY-MM-DDTHH） */
  hour_bucket: string;
}

/**
 * 创建心愿时的输入参数
 */
export interface CreateWishInput {
  /** 心愿内容（最大 100 字） */
  text: string;
  /** 心愿小钥匙（可选，如未设置自动生成） */
  key?: string;
}

/**
 * 心愿响应数据（API 返回）
 */
export interface WishResponse extends Wish {
  /** 实时点赞数（从计数器获取） */
  realtime_likes: number;
  /** 实时推荐数（从计数器获取） */
  realtime_recommends: number;
}

// ============================================================================
// 计数器类型
// ============================================================================

/**
 * 点赞计数器
 * 存储在 KV Key: `likes:{id}`
 * 类型: number
 */
export type LikesCounter = number;

/**
 * 推荐计数器
 * 存储在 KV Key: `recommends:{id}`
 * 类型: number
 */
export type RecommendsCounter = number;

// ============================================================================
// 索引类型
// ============================================================================

/**
 * 全局心愿 ID 列表
 * 存储在 KV Key: `wishes:all`
 */
export type WishIdList = string[];

/**
 * 每小时 Top3 心愿索引项
 */
export interface HourlyTopItem {
  /** 心愿 ID */
  id: string;
  /** 心愿小钥匙 */
  key: string;
  /** 心愿内容 */
  text: string;
  /** 该小时内的星星增量 */
  likes_increment: number;
  /** 排名称号 */
  rank: '状元' | '榜眼' | '探花';
}

/**
 * 每小时 Top3 心愿索引
 * 存储在 KV Key: `wishes:hour:{timestamp}`
 */
export type HourlyTop3 = HourlyTopItem[];

/**
 * 关键词倒排索引
 * 存储在 KV Key: `keywords:{word}`
 * 内容: 包含该关键词的心愿 ID 列表
 */
export type KeywordIndex = string[];

/**
 * 全局索引元数据（分片时使用）
 * 存储在 KV Key: `wishes:all:meta`
 */
export interface WishIndexMeta {
  /** 心愿总数 */
  total: number;
  /** 分片数量 */
  shards: number;
}

// ============================================================================
// Key 命名类型
// ============================================================================

/**
 * KV Key 类型枚举
 */
export enum KVKeyType {
  /** 心愿数据 */
  WISH = 'wish',
  /** 点赞计数器 */
  LIKES = 'likes',
  /** 推荐计数器 */
  RECOMMENDS = 'recommends',
  /** 全局索引 */
  WISHES_ALL = 'wishes:all',
  /** 小时索引 */
  WISHES_HOUR = 'wishes:hour',
  /** 关键词索引 */
  KEYWORDS = 'keywords',
  /** 小钥匙映射 */
  KEY = 'key',
}

/**
 * KV Key 构建函数签名
 */
export interface KVKeyBuilder {
  /** 心愿数据 Key: wish:{id} */
  wish: (id: string) => string;
  /** 点赞计数器 Key: likes:{id} */
  likes: (id: string) => string;
  /** 每小时点赞增量 Key: likes_hour:{hour}:{id} */
  likesHour: (hour: string, id: string) => string;
  /** 推荐计数器 Key: recommends:{id} */
  recommends: (id: string) => string;
  /** 全局索引 Key: wishes:all */
  wishesAll: () => string;
  /** 小时索引 Key: wishes:hour:{timestamp} */
  wishesHour: (timestamp: string) => string;
  /** 关键词索引 Key: keywords:{word} */
  keywords: (word: string) => string;
  /** 小钥匙映射 Key: key:{key} */
  key: (key: string) => string;
}

// ============================================================================
// API 响应类型
// ============================================================================

/**
 * 点赞操作响应
 */
export interface LikeResponse {
  /** 最新点赞数 */
  likes: number;
  /** 祝福消息 */
  message: string;
}

/**
 * 推荐操作响应
 */
export interface RecommendResponse {
  /** 最新推荐数 */
  recommends: number;
}

/**
 * 搜索响应
 */
export interface SearchResponse {
  /** 搜索关键词 */
  keyword: string;
  /** 匹配的心愿列表 */
  wishes: WishResponse[];
  /** 匹配数量 */
  count: number;
}

/**
 * 心愿广场响应（随机 10 条）
 */
export interface WishesSquareResponse {
  /** 心愿列表 */
  wishes: WishResponse[];
  /** 总心愿数 */
  total: number;
}

/**
 * Top3 心愿响应
 */
export interface Top3Response {
  /** Top3 心愿列表 */
  top3: HourlyTop3;
  /** 统计时间 */
  hour: string;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  /** 错误类型 */
  error: string;
  /** 错误消息 */
  message: string;
}

// ============================================================================
// KV 数据访问函数签名
// ============================================================================

/**
 * KV 数据访问服务接口
 * 供 Workers API 实现参考
 */
export interface KVDataService {
  // === 心愿操作 ===
  /** 创建心愿 */
  createWish: (input: CreateWishInput) => Promise<Wish>;
  /** 获取心愿详情 */
  getWish: (id: string) => Promise<WishResponse | null>;
  /** 通过小钥匙获取心愿 */
  getWishByKey: (key: string) => Promise<WishResponse | null>;

  // === 计数器操作 ===
  /** 点赞（原子递增） */
  incrementLikes: (id: string) => Promise<number>;
  /** 推荐（原子递增） */
  incrementRecommends: (id: string) => Promise<number>;
  /** 获取点赞数 */
  getLikes: (id: string) => Promise<number>;
  /** 获取推荐数 */
  getRecommends: (id: string) => Promise<number>;

  // === 索引操作 ===
  /** 获取所有心愿 ID */
  getAllWishIds: () => Promise<WishIdList>;
  /** 随机获取心愿列表 */
  getRandomWishes: (count: number) => Promise<WishResponse[]>;
  /** 搜索心愿 */
  searchWishes: (keyword: string) => Promise<WishResponse[]>;
  /** 获取每小时 Top3 */
  getHourlyTop3: (timestamp: string) => Promise<HourlyTop3 | null>;

  // === 紧急统计操作（Cron） ===
  /** 生成每小时 Top3 */
  generateHourlyTop3: (timestamp: string) => Promise<HourlyTop3>;
}

// ============================================================================
// Key 构建工具函数
// ============================================================================

/**
 * 构建 KV Key 的工具函数
 */
export const kvKey: KVKeyBuilder = {
  wish: (id: string) => `wish:${id}`,
  likes: (id: string) => `likes:${id}`,
  likesHour: (hour: string, id: string) => `likes_hour:${hour}:${id}`,
  recommends: (id: string) => `recommends:${id}`,
  wishesAll: () => `wishes:all`,
  wishesHour: (timestamp: string) => `wishes:hour:${timestamp}`,
  keywords: (word: string) => `keywords:${word}`,
  key: (key: string) => `key:${key}`,
};

// ============================================================================
// 排名类型
// ============================================================================

/**
 * 排名称号
 */
export type RankTitle = '状元' | '榜眼' | '探花';

/**
 * 获取排名称号
 * @param position 排名位置（1-3）
 */
export function getRankTitle(position: number): RankTitle {
  switch (position) {
    case 1:
      return '状元';
    case 2:
      return '榜眼';
    case 3:
      return '探花';
    default:
      throw new Error('Invalid rank position');
  }
}

// ============================================================================
// 时间桶工具函数
// ============================================================================

/**
 * 获取当前小时桶
 * 格式: YYYY-MM-DDTHH
 */
export function getCurrentHourBucket(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}`;
}

/**
 * 获取上一小时桶（用于统计）
 */
export function getPreviousHourBucket(): string {
  const now = new Date();
  now.setHours(now.getHours() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}`;
}