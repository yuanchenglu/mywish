/**
 * @description GET /api/debug-energy - 调试正能量检测
 */

interface Env {
  KV: KVNamespace;
  BAILIAN_API_KEY: string;
}

export async function onRequest(context: EventContext<Env, string, unknown>): Promise<Response> {
  const { request, env } = context;
  
  const url = new URL(request.url);
  const text = url.searchParams.get('text') || '希望家人身体健康';
  
  const results: {
    step: string;
    status: string;
    data?: unknown;
    error?: string;
    time?: number;
  }[] = [];
  
  try {
    // Step 1: 检查 API Key
    results.push({
      step: 'check_api_key',
      status: env.BAILIAN_API_KEY ? 'ok' : 'missing',
      data: env.BAILIAN_API_KEY ? `${env.BAILIAN_API_KEY.slice(0, 10)}...` : null
    });
    
    if (!env.BAILIAN_API_KEY) {
      return new Response(JSON.stringify({ results, error: 'BAILIAN_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Step 2: 调用百炼 API（标准 API）
    const startTime = Date.now();
    
    const requestBody = {
      model: 'qwen-plus',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `判断此心愿是否正能量，输出JSON格式{"positive":true/false,"reason":"理由"}："${text}"`
      }]
    };
    
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.BAILIAN_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const elapsed = Date.now() - startTime;
    
    results.push({
      step: 'bailian_api_call',
      status: response.ok ? 'ok' : 'error',
      data: {
        status: response.status,
        statusText: response.statusText,
        elapsed_ms: elapsed
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      results.push({
        step: 'bailian_api_error',
        status: 'error',
        error: errorText
      });
    } else {
      const data = await response.json() as {
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      };
      
      const aiText = data.choices?.[0]?.message?.content || '';
      
      results.push({
        step: 'bailian_api_response',
        status: 'ok',
        data: {
          raw_text: aiText.slice(0, 500),
          parsed: extractJSON(aiText)
        }
      });
    }
    
  } catch (error) {
    results.push({
      step: 'exception',
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function extractJSON(text: string): { positive: boolean; reason: string } | null {
  const codeBlockMatch = text.match(/```json\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : text;
  const jsonMatch = jsonStr.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}