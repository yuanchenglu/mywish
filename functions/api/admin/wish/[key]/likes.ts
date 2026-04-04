import type { Wish, ErrorResponse } from '../../../../../kv-schema';
import { kvKey, getCurrentHourBucket } from '../../../../../kv-schema';

interface Env {
  KV: KVNamespace;
}

const ADMIN_PASSWORD = 'mywish2026';

interface UpdateLikesRequest {
  add_likes: number;
}

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env, params } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
      }
    });
  }
  
  if (request.method !== 'PUT') {
    return buildErrorResponse(405, 'METHOD_NOT_ALLOWED', '仅支持 PUT');
  }
  
  const providedPassword = request.headers.get('X-Admin-Password');
  if (providedPassword !== ADMIN_PASSWORD) {
    return buildErrorResponse(401, 'UNAUTHORIZED', '密码错误，无权限操作');
  }
  
  try {
    const key = params.key as string;
    
    const wishId = await env.KV.get(kvKey.key(key));
    if (!wishId) {
      return buildErrorResponse(404, 'KEY_NOT_FOUND', `小钥匙 ${key} 不存在`);
    }
    
    const body = await request.json() as UpdateLikesRequest;
    const addLikes = Math.floor(body.add_likes || 0);
    
    if (addLikes < 0) {
      return buildErrorResponse(400, 'INVALID_VALUE', '只能增加点赞数，不能减少');
    }
    
    if (addLikes === 0) {
      return buildErrorResponse(400, 'INVALID_VALUE', '请输入要增加的点赞数');
    }
    
    if (addLikes > 10000) {
      return buildErrorResponse(400, 'INVALID_VALUE', '单次最多增加 10000 点赞');
    }
    
    const currentLikes = parseInt(await env.KV.get(kvKey.likes(wishId)) || '0', 10);
    const newLikes = currentLikes + addLikes;
    
    const hourBucket = getCurrentHourBucket();
    const currentHourLikes = parseInt(await env.KV.get(kvKey.likesHour(hourBucket, wishId)) || '0', 10);
    const newHourLikes = currentHourLikes + addLikes;
    
    await Promise.all([
      env.KV.put(kvKey.likes(wishId), String(newLikes)),
      env.KV.put(kvKey.likesHour(hourBucket, wishId), String(newHourLikes))
    ]);
    
    const wishData = await env.KV.get(kvKey.wish(wishId), 'json') as Wish | null;
    
    return new Response(JSON.stringify({
      success: true,
      message: `已为心愿「${wishData?.text?.slice(0, 20) || key}...」增加 ${addLikes} 个点赞`,
      key,
      wishId,
      previousLikes: currentLikes,
      addedLikes: addLikes,
      currentLikes: newLikes,
      hourBucket,
      hourLikesIncrement: newHourLikes
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('更新点赞失败:', error);
    
    if (error instanceof SyntaxError) {
      return buildErrorResponse(400, 'INVALID_JSON', '请求体格式错误');
    }
    
    return buildErrorResponse(500, 'INTERNAL_ERROR', '操作失败，请稍后重试');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  const errorResponse: ErrorResponse = { error, message };
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}