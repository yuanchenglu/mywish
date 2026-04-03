/**
 * @description GET /api/wish/{key} - 通过小钥匙查询心愿详情
 */

import type { Wish, WishResponse, ErrorResponse } from '../../lib/kv-schema';
import { kvKey } from '../../lib/kv-schema';

interface Env {
  KV: KVNamespace;
}

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env, params } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  }
  
  if (request.method !== 'GET') {
    return buildErrorResponse(405, 'METHOD_NOT_ALLOWED', '仅支持 GET');
  }
  
  try {
    const key = params.key as string;
    const wishId = await env.KV.get(kvKey.key(key));
    
    if (!wishId) {
      return buildErrorResponse(404, 'KEY_NOT_FOUND', '小钥匙不存在');
    }
    
    const [wishData, likes, recommends] = await Promise.all([
      env.KV.get(kvKey.wish(wishId), 'json') as Promise<Wish | null>,
      env.KV.get(kvKey.likes(wishId)),
      env.KV.get(kvKey.recommends(wishId))
    ]);
    
    if (!wishData) {
      return buildErrorResponse(404, 'WISH_NOT_FOUND', '心愿不存在');
    }
    
    const response: WishResponse = {
      ...wishData,
      realtime_likes: parseInt(likes || '0', 10),
      realtime_recommends: parseInt(recommends || '0', 10)
    };
    
    return new Response(JSON.stringify({ success: true, data: response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return buildErrorResponse(500, 'INTERNAL_ERROR', '查询失败');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
