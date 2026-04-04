/**
 * @description AI 正能量检测模块 - 使用百炼 MiniMax-M2.5 模型
 * @version 1.0
 * @created 2026-04-04
 * 
 * 功能特性：
 * - 调用百炼 MiniMax-M2.5 模型检测心愿内容正能量
 * - 10秒超时控制
 * - 返回检测结果（positive: boolean, reason: string）
 * 
 * API 配置：
 * - Endpoint: https://coding.dashscope.aliyuncs.com/apps/anthropic/v1
 * - API 类型: Anthropic Messages API
 * - 模型: MiniMax-M2.5
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 正能量检测结果
 */
export interface PositiveEnergyResult {
  /** 是否为正能量内容 */
  positive: boolean;
  /** 检测理由（简短描述） */
  reason: string;
}

/**
 * AI 检测响应格式
 */
interface AIResponse {
  positive: boolean;
  reason: string;
}

// ============================================================================
// 提示词模板
// ============================================================================

/**
 * 构建正能量检测提示词
 * @param wishText 心愿文本
 * @returns 完整提示词
 */
function buildPrompt(wishText: string): string {
  return `你是心愿正能量检测助手。判断用户心愿是否适合公开发布。

**判断标准**：
- ✅ 正能量：鼓励、祝福、感恩、美好愿景、自我激励、友善表达、幽默调侃（善意）、生活感悟（积极）
- ❌ 负能量：抱怨发泄、诅咒谩骂、恶意攻击、消极厌世、不当内容（暴力/仇恨/敏感）、侮辱性表达

**输出格式**（严格JSON，无其他内容）：
{"positive": true/false, "reason": "简短理由（10字内）"}

**示例**：
输入："希望家人身体健康" → {"positive": true, "reason": "美好祝福"}
输入："希望考试顺利通过" → {"positive": true, "reason": "积极愿景"}
输入："讨厌这个破世界" → {"positive": false, "reason": "消极宣泄"}
输入："某某去死" → {"positive": false, "reason": "恶意诅咒"}

现在判断："${wishText}"`;
}

// ============================================================================
// AI API 调用
// ============================================================================

/**
 * 调用百炼 MiniMax-M2.5 模型进行正能量检测
 * @param apiKey 百炼 API Key
 * @param wishText 心愿文本
 * @param timeout 超时时间（毫秒）
 * @returns 检测结果
 */
async function callBailianAI(
  apiKey: string,
  wishText: string,
  timeout: number = 10000
): Promise<PositiveEnergyResult> {
  const prompt = buildPrompt(wishText);
  
  // 构建请求体（Anthropic Messages API 格式）
  const requestBody = {
    model: 'MiniMax-M2.5',
    max_tokens: 256,  // 检测结果很短，256 足够
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };
  
  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch('https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Bailian API error:', response.status, response.statusText);
      // API 错误时默认放行（避免阻断用户）
      return { positive: true, reason: 'AI检测暂时不可用' };
    }
    
    const data = await response.json() as {
      content: Array<{ type: string; text: string; thinking?: string }>;
      stop_reason: string;
    };
    
    // 找到 text 类型的内容（跳过 thinking）
    const textContent = data.content?.find(c => c.type === 'text');
    const aiText = textContent?.text || '';
    
    // 尝试提取 JSON（支持 ```json 代码块格式）
    const codeBlockMatch = aiText.match(/```json\s*\n?([\s\S]*?)\n?```/);
    const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : aiText;
    
    // 提取 JSON 对象
    const jsonMatch = jsonStr.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as AIResponse;
        return {
          positive: parsed.positive === true,
          reason: parsed.reason?.slice(0, 20) || 'AI判断'
        };
      } catch {
        // JSON 解析失败，默认放行
        return { positive: true, reason: '解析失败，默认放行' };
      }
    }
    
    // 未找到 JSON，检查文本中是否有明确的正/负判断
    if (aiText.includes('positive: true') || aiText.includes('正能量')) {
      return { positive: true, reason: 'AI判断为正能量' };
    }
    if (aiText.includes('positive: false') || aiText.includes('负能量')) {
      return { positive: false, reason: 'AI判断为负能量' };
    }
    
    // 无法判断时默认放行
    return { positive: true, reason: '无法明确判断，默认放行' };
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Bailian AI timeout after', timeout, 'ms');
      // 超时时默认放行（避免阻断用户）
      return { positive: true, reason: 'AI检测超时，默认放行' };
    }
    
    console.error('Bailian AI call failed:', error);
    // 其他错误时默认放行
    return { positive: true, reason: 'AI检测异常，默认放行' };
  }
}

// ============================================================================
// 主检测函数
// ============================================================================

/**
 * 检测心愿正能量
 * @param apiKey 百炼 API Key
 * @param wishText 心愿文本（已清洗）
 * @returns 检测结果
 */
export async function checkPositiveEnergy(
  apiKey: string,
  wishText: string
): Promise<PositiveEnergyResult> {
  // 空文本直接放行
  if (!wishText || wishText.trim().length === 0) {
    return { positive: true, reason: '空内容' };
  }
  
  // 调用 AI 检测（10秒超时）
  return await callBailianAI(apiKey, wishText, 10000);
}

// ============================================================================
// 导出类型和工具函数
// ============================================================================

export {
  buildPrompt,
  callBailianAI
};