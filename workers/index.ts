/**
 * Workers API 入口
 * 处理所有 API 请求
 */

import { onRequest as wishHandler } from './api/wish';
import { onRequest as likeHandler } from './api/like';
import { onRequest as recommendHandler } from './api/recommend';
import { onRequest as searchHandler } from './api/search';
import { onRequest as wishesHandler } from './api/wishes';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 路由 API 请求
    if (path.startsWith('/api/wish/') && path !== '/api/wish') {
      // GET /api/wish/{key}
      const key = path.split('/').pop();
      return wishHandler({ request, env, params: { key } } as any);
    } else if (path === '/api/wish' && request.method === 'POST') {
      return wishHandler({ request, env } as any);
    } else if (path === '/api/like') {
      return likeHandler({ request, env } as any);
    } else if (path === '/api/recommend') {
      return recommendHandler({ request, env } as any);
    } else if (path === '/api/search') {
      return searchHandler({ request, env } as any);
    } else if (path === '/api/wishes') {
      return wishesHandler({ request, env } as any);
    }

    // 其他请求返回 404
    return new Response('Not Found', { status: 404 });
  }
};

interface Env {
  KV: KVNamespace;
  R2: R2Bucket;
}
