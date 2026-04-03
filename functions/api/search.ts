/**
 * @description GET /api/search?q=keyword - 搜索心愿
 */

import type { Wish, WishResponse, ErrorResponse } from '../../kv-schema';
import { kvKey } from '../../kv-schema';

interface Env {
  KV: KVNamespace;
}

const MAX_RESULTS = 20;

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env } = context;
  
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
    const url = new URL(request.url);
    const keyword = url.searchParams.get('q')?.trim();
    
    if (!keyword) {
      return buildErrorResponse(400, 'MISSING_KEYWORD', '请提供搜索关键词');
    }
    
    const wishIds = await env.KV.get(kvKey.wishesAll(), 'json') as string[] | null;
    
    if (!wishIds || wishIds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: { keyword, wishes: [], count: 0 }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const wishes = await Promise.all(
      wishIds.map(id => env.KV.get(kvKey.wish(id), 'json') as Promise<Wish | null>)
    );
    
    const matched = wishes
      .filter(w => w && w.text.includes(keyword))
      .slice(0, MAX_RESULTS) as Wish[];
    
    const responses = await Promise.all(
      matched.map(async w => {
        const [likes, rec] = await Promise.all([
          env.KV.get(kvKey.likes(w.id)),
          env.KV.get(kvKey.recommends(w.id))
        ]);
        return {
          ...w,
          realtime_likes: parseInt(likes || '0', 10),
          realtime_recommends: parseInt(rec || '0', 10)
        } as WishResponse;
      })
    );
    
    return new Response(JSON.stringify({
      success: true,
      data: { keyword, wishes: responses, count: responses.length }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    return buildErrorResponse(500, 'INTERNAL_ERROR', '搜索失败');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
