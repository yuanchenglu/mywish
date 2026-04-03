/**
 * @description GET /api/top3 - 获取推荐数最高的3个心愿
 */

import type { Wish, HourlyTopItem, Top3Response } from '../../kv-schema';
import { kvKey, getRankTitle } from '../../kv-schema';

interface Env {
  KV: KVNamespace;
}

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
    const wishIds = await env.KV.get(kvKey.wishesAll(), 'json') as string[] | null;
    
    if (!wishIds || wishIds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          top3: [],
          hour: new Date().toISOString().slice(0, 13)
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const wishes = await Promise.all(
      wishIds.map(id => env.KV.get(kvKey.wish(id), 'json') as Promise<Wish | null>)
    );
    
    const wishesWithRecommends = await Promise.all(
      wishes.filter(w => w !== null).map(async w => {
        const recCount = await env.KV.get(kvKey.recommends(w.id));
        return {
          ...w,
          realtime_recommends: parseInt(recCount || '0', 10)
        };
      })
    );
    
    const sorted = wishesWithRecommends
      .sort((a, b) => b.realtime_recommends - a.realtime_recommends)
      .slice(0, 3);
    
    const top3: HourlyTopItem[] = sorted.map((w, index) => ({
      id: w.id,
      key: w.key,
      text: w.text,
      recommends: w.realtime_recommends,
      rank: getRankTitle(index + 1)
    }));
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        top3,
        hour: new Date().toISOString().slice(0, 13)
      } as Top3Response
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    console.error('获取 Top3 失败:', error);
    return buildErrorResponse(500, 'INTERNAL_ERROR', '获取 Top3 失败');
  }
}

function buildErrorResponse(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}