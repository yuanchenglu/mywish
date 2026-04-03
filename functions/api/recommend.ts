/**
 * @description POST /api/recommend - 推荐操作
 */

import type { ErrorResponse } from '../../kv-schema';
import { kvKey } from '../../kv-schema';

interface Env {
  KV: KVNamespace;
}

interface RecommendInput {
  wishId?: string;
  wishKey?: string;
}

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }
  
  if (request.method !== 'POST') {
    return buildErrorResponse(405, 'METHOD_NOT_ALLOWED', '仅支持 POST');
  }
  
  try {
    const body = await request.json() as RecommendInput;
    
    if (!body.wishId && !body.wishKey) {
      return buildErrorResponse(400, 'INVALID_INPUT', '请提供 wishId 或 wishKey');
    }
    
    let wishId = body.wishId;
    
    if (!wishId && body.wishKey) {
      const mappedId = await env.KV.get(kvKey.key(body.wishKey));
      if (!mappedId) {
        return buildErrorResponse(404, 'KEY_NOT_FOUND', '小钥匙不存在');
      }
      wishId = mappedId;
    }
    
    // FIX: KV.increment() 在 Pages Functions 中可能返回对象或不兼容
    // 改用手动 get + put 方式确保兼容性
    const currentRecommends = await env.KV.get(kvKey.recommends(wishId));
    const currentCount = currentRecommends ? parseInt(currentRecommends, 10) : 0;
    const newRecommends = currentCount + 1;
    await env.KV.put(kvKey.recommends(wishId), String(newRecommends));
    
    return new Response(JSON.stringify({
      success: true,
      data: { wishId, recommends: newRecommends }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      return buildErrorResponse(400, 'INVALID_JSON', '请求体格式错误');
    }
    return buildErrorResponse(500, 'INTERNAL_ERROR', '推荐失败');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
