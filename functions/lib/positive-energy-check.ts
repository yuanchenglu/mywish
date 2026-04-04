/**
 * @description AI 正能量检测模块 - 使用 DeepSeek API
 * @version 3.0
 * @created 2026-04-04
 * 
 * API 配置：
 * - Endpoint: https://api.deepseek.com/v1/chat/completions
 * - 模型: deepseek-chat（快速、便宜）
 */

export interface PositiveEnergyResult {
  positive: boolean;
  reason: string;
}

interface AIResponse {
  positive: boolean;
  reason: string;
}

function buildPrompt(wishText: string): string {
  return `判断此心愿是否正能量，只输出JSON格式{"positive":true/false,"reason":"简短理由"}：

正能量：祝福、感恩、美好愿景、自我激励、友善表达
负能量：抱怨发泄、诅咒谩骂、恶意攻击、消极厌世、不当内容

心愿："${wishText}"`;
}

async function callDeepSeekAI(
  apiKey: string,
  wishText: string,
  timeout: number = 10000
): Promise<PositiveEnergyResult> {
  const prompt = buildPrompt(wishText);
  
  const requestBody = {
    model: 'deepseek-chat',
    max_tokens: 128,
    temperature: 0.1,
    messages: [{
      role: 'user',
      content: prompt
    }]
  };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('DeepSeek API error:', response.status);
      return { positive: true, reason: 'AI检测暂时不可用' };
    }
    
    const data = await response.json() as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    
    const aiText = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = aiText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as AIResponse;
        return {
          positive: parsed.positive === true,
          reason: parsed.reason?.slice(0, 20) || 'AI判断'
        };
      } catch {
        return { positive: true, reason: '解析失败' };
      }
    }
    
    if (aiText.includes('正能量') || aiText.includes('"positive": true')) {
      return { positive: true, reason: 'AI判断为正能量' };
    }
    if (aiText.includes('负能量') || aiText.includes('"positive": false')) {
      return { positive: false, reason: 'AI判断为负能量' };
    }
    
    return { positive: true, reason: '无法判断' };
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { positive: true, reason: 'AI检测超时' };
    }
    
    console.error('DeepSeek AI call failed:', error);
    return { positive: true, reason: 'AI检测异常' };
  }
}

export async function checkPositiveEnergy(
  apiKey: string,
  wishText: string
): Promise<PositiveEnergyResult> {
  if (!wishText || wishText.trim().length === 0) {
    return { positive: true, reason: '空内容' };
  }
  
  return await callDeepSeekAI(apiKey, wishText, 10000);
}

export { buildPrompt, callDeepSeekAI };