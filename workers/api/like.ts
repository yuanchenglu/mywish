/**
 * @description POST /api/like - 点赞操作
 */

import type { ErrorResponse } from '../lib/kv-schema';
import { kvKey } from '../lib/kv-schema';

interface Env {
  KV: KVNamespace;
}

interface LikeInput {
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
    const body = await request.json() as LikeInput;
    
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
    
    const newLikes = await env.KV.increment(kvKey.likes(wishId));
    
    return new Response(JSON.stringify({
      success: true,
      data: { wishId, likes: newLikes }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      return buildErrorResponse(400, 'INVALID_JSON', '请求体格式错误');
    }
    return buildErrorResponse(500, 'INTERNAL_ERROR', '点赞失败');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
