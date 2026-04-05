/**
 * @description POST /api/like - 点赞操作
 */

import type { ErrorResponse } from '../../kv-schema';
import { kvKey, getCurrentHourBucket } from '../../kv-schema';

interface Env {
  KV: KVNamespace;
}

interface LikeInput {
  wishId?: string;
  wishKey?: string;
  count?: number;
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
    
    let newLikes: number;
    let newHourLikes: number;
    
    if (typeof body.count === 'number' && body.count >= 0) {
      newLikes = body.count;
      newHourLikes = body.count;
      await env.KV.put(kvKey.likes(wishId!), String(newLikes));
      const hourBucket = getCurrentHourBucket();
      await env.KV.put(kvKey.likesHour(hourBucket, wishId!), String(newHourLikes));
    } else {
      const currentLikes = await env.KV.get(kvKey.likes(wishId!));
      const currentCount = currentLikes ? parseInt(currentLikes, 10) : 0;
      newLikes = currentCount + 1;
      await env.KV.put(kvKey.likes(wishId!), String(newLikes));
      
      const hourBucket = getCurrentHourBucket();
      const hourLikesKey = kvKey.likesHour(hourBucket, wishId!);
      const currentHourLikes = await env.KV.get(hourLikesKey);
      const hourCount = currentHourLikes ? parseInt(currentHourLikes, 10) : 0;
      newHourLikes = hourCount + 1;
      await env.KV.put(hourLikesKey, String(newHourLikes));
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: { wishId, likes: newLikes, hour_likes: newHourLikes }
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
