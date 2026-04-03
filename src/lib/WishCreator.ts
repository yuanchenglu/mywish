/**
 * @description 心愿创建逻辑 - 输入验证、小钥匙生成、XSS防护
 * @version 1.0
 * @created 2026-04-03
 * @dependencies nanoid (唯一ID生成), kv-schema.ts (CreateWishInput)
 * 
 * 功能特性：
 * - 小钥匙生成（nanoid 6位）
 * - 心愿文本验证（最少1字，最多100字）
 * - XSS防护（转义HTML标签）
 * - 自定义小钥匙支持（可选）
 */

import { customAlphabet } from 'nanoid';
import type { CreateWishInput } from '../../workers/lib/kv-schema';

// [CRITICAL] 自定义 alphabet：仅字母和数字（不含特殊字符）
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// ============================================================================
// 小钥匙生成
// ============================================================================

/**
 * 生成心愿小钥匙
 * @returns 6位唯一小钥匙（仅字母和数字）
 * 
 * [CRITICAL] 小钥匙格式：6位字符（字母 + 数字）
 * 碰撞概率：62^6 ≈ 568亿种组合，单次碰撞概率极低
 */
export function generateWishKey(): string {
  return customAlphabet(ALPHABET, 6)();
}

/**
 * 生成心愿唯一ID
 * @returns 12位唯一ID（仅字母和数字）
 * 
 * [CRITICAL] ID格式：12位字符（字母 + 数字）
 * 碰撞概率：62^12 ≈ 3.2×10^21种组合，全局唯一性极高
 */
export function generateWishId(): string {
  return customAlphabet(ALPHABET, 12)();
}

/**
 * 验证自定义小钥匙格式
 * @param key 自定义小钥匙
 * @returns 验证结果：{ valid: boolean, error?: string }
 * 
 * [CRITICAL] 小钥匙规则：
 * - 必须 6 位字符
 * - 仅允许字母和数字
 * - 不允许特殊字符
 */
export function validateCustomKey(key: string): { valid: boolean; error?: string } {
  if (key.length === 0) {
    return { valid: true }; // 空=允许（自动生成）
  }
  
  if (key.length !== 6) {
    return { valid: false, error: '小钥匙必须是6位字符' };
  }
  
  // [CRITICAL] 正则验证：仅字母和数字
  const pattern = /^[a-zA-Z0-9]{6}$/;
  if (!pattern.test(key)) {
    return { valid: false, error: '小钥匙只能包含字母和数字' };
  }
  
  return { valid: true };
}

// ============================================================================
// 心愿文本验证
// ============================================================================

/**
 * 验证心愿文本内容
 * @param text 心愿文本
 * @returns 验证结果：{ valid: boolean; error?: string }
 * 
 * [CRITICAL] 心愿文本规则：
 * - 最少 1 字（trim后）
 * - 最多 100 字（trim后）
 * - 不允许纯空白字符
 */
export function validateWishText(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: '请输入心愿内容' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: '心愿内容不能超过100字' };
  }
  
  return { valid: true };
}

/**
 * 计算心愿文本字数（实时显示）
 * @param text 心愿文本
 * @returns 字数（trim后）
 */
export function countWishText(text: string): number {
  return text.trim().length;
}

// ============================================================================
// XSS防护
// ============================================================================

/**
 * 心愿文本XSS防护（转义HTML标签）
 * @param text 原始文本
 * @returns 安全文本（HTML标签已转义）
 * 
 * [CRITICAL] XSS防护规则：
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - trim处理（去除前后空白）
 */
export function sanitizeWishText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

// ============================================================================
// 心愿创建集成
// ============================================================================

/**
 * 创建心愿输入参数（前端提交前验证）
 * @param text 心愿文本
 * @param customKey 自定义小钥匙（可选）
 * @returns 创建结果：{ success: boolean, data?: CreateWishInput, error?: string }
 * 
 * [CRITICAL] 创建流程：
 * 1. 验证心愿文本
 * 2. 验证自定义小钥匙（如有）
 * 3. XSS防护处理
 * 4. 生成最终小钥匙（自定义 or 自动）
 */
export function prepareWishInput(
  text: string,
  customKey?: string
): { success: boolean; data?: CreateWishInput; error?: string } {
  // Step 1: 验证心愿文本
  const textValidation = validateWishText(text);
  if (!textValidation.valid) {
    return { success: false, error: textValidation.error };
  }
  
  // Step 2: 验证自定义小钥匙（如有）
  const keyToValidate = (customKey ?? '').trim();
  if (keyToValidate) {
    const keyValidation = validateCustomKey(keyToValidate);
    if (!keyValidation.valid) {
      return { success: false, error: keyValidation.error };
    }
  }
  
  // Step 3: XSS防护处理
  const sanitizedText = sanitizeWishText(text);
  
  // Step 4: 生成最终小钥匙
  const finalKey = keyToValidate || generateWishKey();
  
  // [CRITICAL] 返回 CreateWishInput 格式（供 API 调用）
  return {
    success: true,
    data: {
      text: sanitizedText,
      key: finalKey
    }
  };
}

// ============================================================================
// 工具函数导出
// ============================================================================

export type ValidationResult = { valid: boolean; error?: string };
export type PrepareResult = { success: boolean; data?: CreateWishInput; error?: string };