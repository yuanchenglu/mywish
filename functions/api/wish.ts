/**
 * @description POST /api/wish - 创建心愿 API
 * @version 1.0
 * @created 2026-04-03
 * 
 * 功能特性：
 * - 接收 POST 请求，创建心愿
 * - 输入验证（text 必填，key 可选）
 * - 小钥匙唯一性检查
 * - KV 存储（wish:{id}, likes:{id}, recommends:{id}, key:{key}, wishes:all）
 * - 返回创建的心愿数据
 * 
 * 错误处理：
 * - 400 Bad Request: 输入验证失败
 * - 409 Conflict: 小钥匙已存在
 * - 500 Internal Server Error: KV 写入失败
 */

import { customAlphabet } from 'nanoid';
import type { Wish, CreateWishInput, ErrorResponse } from '../../kv-schema';
import { kvKey, getCurrentHourBucket } from '../../kv-schema';

// [CRITICAL] 自定义 alphabet：仅字母和数字（不含特殊字符）
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// ============================================================================
// 环境变量类型定义
// ============================================================================

/**
 * Worker 环境变量
 */
interface Env {
  /** KV namespace binding */
  KV: KVNamespace;
}

// ============================================================================
// ID 生成函数
// ============================================================================

/**
 * 生成心愿唯一 ID（12位）
 */
function generateWishId(): string {
  return customAlphabet(ALPHABET, 12)();
}

/**
 * 生成心愿小钥匙（6位）
 */
function generateWishKey(): string {
  return customAlphabet(ALPHABET, 6)();
}

// ============================================================================
// 输入验证
// ============================================================================

/**
 * 验证心愿文本
 * @param text 心愿文本
 * @returns 验证结果
 */
function validateWishText(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: '请输入心愿内容' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: '心愿内容不能超过100字' };
  }
  
  return { valid: true };
}

/**
 * 验证自定义小钥匙格式
 * @param key 自定义小钥匙
 * @returns 验证结果
 */
function validateCustomKey(key: string): { valid: boolean; error?: string } {
  if (key.length === 0) {
    return { valid: true }; // 空=允许（自动生成）
  }
  
  if (key.length !== 6) {
    return { valid: false, error: '小钥匙必须是6位字符' };
  }
  
  // [CRITICAL] 正则验证：仅字母和数字
  const pattern = /^[a-zA-Z0-9]{6}$/;
  if (!pattern.test(key)) {
    return { valid: false, error: '小钥匙只能包含字母和数字' };
  }
  
  return { valid: true };
}

/**
 * XSS 防护（转义 HTML 标签）
 * @param text 原始文本
 * @returns 安全文本
 */
function sanitizeWishText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

// ============================================================================
// API 响应构建
// ============================================================================

/**
 * 构建成功响应
 */
function buildSuccessResponse(wish: Wish): Response {
  return new Response(JSON.stringify({
    success: true,
    data: wish
  }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 构建错误响应
 */
function buildErrorResponse(status: number, error: string, message: string): Response {
  const errorResponse: ErrorResponse = {
    error,
    message
  };
  
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// ============================================================================
// KV 数据写入
// ============================================================================

/**
 * 检查小钥匙唯一性
 * @param env Worker 环境
 * @param key 小钥匙
 * @returns 是否唯一
 */
async function checkKeyUniqueness(env: Env, key: string): Promise<boolean> {
  const existingId = await env.KV.get(kvKey.key(key));
  return existingId === null;
}

/**
 * 写入心愿数据到 KV
 * @param env Worker 环境
 * @param wish 心愿数据
 */
async function writeWishToKV(env: Env, wish: Wish): Promise<void> {
  const now = wish.created_at;
  
  // [CRITICAL] 并行写入所有 KV Keys（提升性能）
  const operations = [
    // 1. 写入心愿数据
    env.KV.put(kvKey.wish(wish.id), JSON.stringify(wish)),
    
    // 2. 初始化点赞计数器
    env.KV.put(kvKey.likes(wish.id), '0'),
    
    // 3. 初始化推荐计数器
    env.KV.put(kvKey.recommends(wish.id), '0'),
    
    // 4. 写入小钥匙映射（如果设置了小钥匙）
    env.KV.put(kvKey.key(wish.key), wish.id)
  ];
  
  // 5. 追加到全局索引（需要读取现有列表）
  const existingIds = await env.KV.get(kvKey.wishesAll(), 'json') as string[] | null;
  const updatedIds = existingIds ? [...existingIds, wish.id] : [wish.id];
  operations.push(env.KV.put(kvKey.wishesAll(), JSON.stringify(updatedIds)));
  
  // [CRITICAL] 并行执行所有写入操作
  await Promise.all(operations);
}

// ============================================================================
// 主处理函数
// ============================================================================

/**
 * POST /api/wish 请求处理
 * @param context Worker 事件上下文
 */
export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env } = context;
  
  // [CRITICAL] CORS 预检请求处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
  
  // [CRITICAL] 仅允许 POST 方法
  if (request.method !== 'POST') {
    return buildErrorResponse(405, 'METHOD_NOT_ALLOWED', '仅支持 POST 方法');
  }
  
  try {
    // Step 1: 解析请求体
    const body = await request.json() as CreateWishInput;
    
    // Step 2: 验证心愿文本
    const textValidation = validateWishText(body.text);
    if (!textValidation.valid) {
      return buildErrorResponse(400, 'INVALID_TEXT', textValidation.error!);
    }
    
    // Step 3: 处理小钥匙
    const customKey = (body.key ?? '').trim();
    
    // 验证自定义小钥匙格式（如有）
    if (customKey) {
      const keyValidation = validateCustomKey(customKey);
      if (!keyValidation.valid) {
        return buildErrorResponse(400, 'INVALID_KEY', keyValidation.error!);
      }
      
      // [CRITICAL] 检查小钥匙唯一性
      const isUnique = await checkKeyUniqueness(env, customKey);
      if (!isUnique) {
        return buildErrorResponse(409, 'KEY_EXISTS', '小钥匙已存在，请使用其他小钥匙');
      }
    }
    
    // Step 4: 生成心愿数据
    const wishId = generateWishId();
    const wishKey = customKey || generateWishKey();
    const sanitizedText = sanitizeWishText(body.text);
    const createdAt = new Date().toISOString();
    const hourBucket = getCurrentHourBucket();
    
    // [CRITICAL] 构建心愿对象
    const wish: Wish = {
      id: wishId,
      key: wishKey,
      text: sanitizedText,
      likes: 0,
      recommends: 0,
      created_at: createdAt,
      updated_at: createdAt,
      hour_bucket: hourBucket
    };
    
    // Step 5: 写入 KV
    await writeWishToKV(env, wish);
    
    // Step 6: 返回成功响应
    return buildSuccessResponse(wish);
    
  } catch (error) {
    // [CRITICAL] 错误处理
    console.error('创建心愿失败:', error);
    
    // 判断错误类型
    if (error instanceof SyntaxError) {
      return buildErrorResponse(400, 'INVALID_JSON', '请求体格式错误，请提供有效的 JSON');
    }
    
    return buildErrorResponse(500, 'INTERNAL_ERROR', '创建心愿失败，请稍后重试');
  }
}

// ============================================================================
// 导出类型和工具函数（供测试使用）
// ============================================================================

export {
  generateWishId,
  generateWishKey,
  validateWishText,
  validateCustomKey,
  sanitizeWishText,
  checkKeyUniqueness,
  writeWishToKV
};