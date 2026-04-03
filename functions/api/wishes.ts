/**
 * @description GET /api/wishes?page=1&limit=20 - 心愿列表分页
 */

import type { Wish, WishResponse, ErrorResponse } from '../../kv-schema';
import { kvKey } from '../../kv-schema';

interface Env {
  KV: KVNamespace;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

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
    const page = parseInt(url.searchParams.get('page') || String(DEFAULT_PAGE), 10);
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMIT), 10),
      MAX_LIMIT
    );
    
    if (page < 1) return buildErrorResponse(400, 'INVALID_PAGE', '页码必须 > 0');
    if (limit < 1) return buildErrorResponse(400, 'INVALID_LIMIT', '每页数量必须 > 0');
    
    const wishIds = await env.KV.get(kvKey.wishesAll(), 'json') as string[] | null;
    const total = wishIds?.length || 0;
    
    if (!wishIds || wishIds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: { wishes: [], page, limit, total: 0 }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const start = (page - 1) * limit;
    const pageIds = wishIds.slice(start, start + limit);
    
    const wishes = await Promise.all(
      pageIds.map(id => env.KV.get(kvKey.wish(id), 'json') as Promise<Wish | null>)
    );
    
    const responses = await Promise.all(
      wishes.filter(w => w !== null).map(async w => {
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
      data: { wishes: responses, page, limit, total }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    return buildErrorResponse(500, 'INTERNAL_ERROR', '获取列表失败');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
