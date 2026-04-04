import type { Wish, ErrorResponse } from '../../../../kv-schema';
import { kvKey } from '../../../../kv-schema';

interface Env {
  KV: KVNamespace;
}

const ADMIN_PASSWORD = 'mywish2026';

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env, params } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
      }
    });
  }
  
  if (request.method !== 'DELETE') {
    return buildErrorResponse(405, 'METHOD_NOT_ALLOWED', '仅支持 DELETE');
  }
  
  const providedPassword = request.headers.get('X-Admin-Password');
  if (providedPassword !== ADMIN_PASSWORD) {
    return buildErrorResponse(401, 'UNAUTHORIZED', '密码错误，无权限删除');
  }
  
  try {
    const key = params.key as string;
    
    const wishId = await env.KV.get(kvKey.key(key));
    if (!wishId) {
      return buildErrorResponse(404, 'KEY_NOT_FOUND', `小钥匙 ${key} 不存在`);
    }
    
    const wishData = await env.KV.get(kvKey.wish(wishId), 'json') as Wish | null;
    if (!wishData) {
      return buildErrorResponse(404, 'WISH_NOT_FOUND', '心愿数据不存在');
    }
    
    const wishText = wishData.text;
    
    await Promise.all([
      env.KV.delete(kvKey.wish(wishId)),
      env.KV.delete(kvKey.likes(wishId)),
      env.KV.delete(kvKey.recommends(wishId)),
      env.KV.delete(kvKey.key(key))
    ]);
    
    const allWishes = await env.KV.get(kvKey.wishesAll(), 'json') as string[] | null;
    if (allWishes) {
      const updatedWishes = allWishes.filter(id => id !== wishId);
      await env.KV.put(kvKey.wishesAll(), JSON.stringify(updatedWishes));
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `已删除心愿「${wishText.slice(0, 20)}...」`,
      deletedKey: key,
      deletedId: wishId
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('删除心愿失败:', error);
    return buildErrorResponse(500, 'INTERNAL_ERROR', '删除失败，请稍后重试');
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