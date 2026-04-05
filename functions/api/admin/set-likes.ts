/**
 * POST /api/admin/set-likes - 批量设置点赞数
 */

import type { ErrorResponse } from '../../kv-schema';
import { kvKey } from '../../kv-schema';

interface Env {
  KV: KVNamespace;
}

interface SetLikesInput {
  wishKey: string;
  count: number;
}

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env } = context;
  
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
  
  if (request.method !== 'POST') {
    return buildErrorResponse(405, 'METHOD_NOT_ALLOWED', '仅支持 POST');
  }
  
  try {
    const body = await request.json() as SetLikesInput;
    
    if (!body.wishKey) {
      return buildErrorResponse(400, 'INVALID_INPUT', '请提供 wishKey');
    }
    
    if (typeof body.count !== 'number' || body.count < 0) {
      return buildErrorResponse(400, 'INVALID_COUNT', 'count 必须为非负整数');
    }
    
    // 获取心愿ID
    const wishId = await env.KV.get(kvKey.key(body.wishKey));
    if (!wishId) {
      return buildErrorResponse(404, 'KEY_NOT_FOUND', '小钥匙不存在');
    }
    
    // 直接设置点赞数
    await env.KV.put(kvKey.likes(wishId), String(body.count));
    
    return new Response(JSON.stringify({
      success: true,
      data: { wishId, wishKey: body.wishKey, likes: body.count }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      return buildErrorResponse(400, 'INVALID_JSON', '请求体格式错误');
    }
    return buildErrorResponse(500, 'INTERNAL_ERROR', '设置失败');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}