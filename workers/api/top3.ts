/**
 * @description GET /api/top3 - 获取当前小时星星增量最高的3个心愿
 * @version 2.0
 * @updated 2026-04-04
 */

import type { Wish, WishResponse, HourlyTopItem, Top3Response } from '../lib/kv-schema';
import { kvKey, getRankTitle, getCurrentHourBucket } from '../lib/kv-schema';

interface Env {
  KV: KVNamespace;
}

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env } = context;
  
  // CORS 预检
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
    const currentHour = getCurrentHourBucket();
    
    // 1. 获取所有心愿 ID
    const wishIds = await env.KV.get(kvKey.wishesAll(), 'json') as string[] | null;
    
    if (!wishIds || wishIds.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          top3: [],
          hour: currentHour
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // 2. 批量获取心愿数据和当前小时增量
    const wishesWithIncrement = await Promise.all(
      wishIds.map(async id => {
        const wish = await env.KV.get(kvKey.wish(id), 'json') as Wish | null;
        if (!wish) return null;
        
        const hourIncrement = await env.KV.get(kvKey.likesHour(currentHour, id));
        const increment = parseInt(hourIncrement || '0', 10);
        
        return {
          ...wish,
          likes_increment: increment
        };
      })
    );
    
    // 3. 过滤掉 null，按增量降序排序，取前3
    const validWishes = wishesWithIncrement.filter(w => w !== null && w.likes_increment > 0) as Array<Wish & { likes_increment: number }>;
    const sorted = validWishes
      .sort((a, b) => b.likes_increment - a.likes_increment)
      .slice(0, 3);
    
    // 4. 构建响应，添加排名徽章
    const top3: HourlyTopItem[] = sorted.map((w, index) => ({
      id: w!.id,
      key: w!.key,
      text: w!.text,
      likes_increment: w!.likes_increment,
      rank: getRankTitle(index + 1),
      created_at: w!.created_at
    }));
    
    // 5. 返回响应
    return new Response(JSON.stringify({
      success: true,
      data: {
        top3,
        hour: currentHour
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