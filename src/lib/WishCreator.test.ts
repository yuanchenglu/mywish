/**
 * @description WishCreator 单元测试 - 心愿创建逻辑验证
 * @version 1.0
 * @created 2026-04-03
 * 
 * 测试覆盖：
 * - 小钥匙生成（长度、格式）
 * - 自定义小钥匙验证（长度、字符类型）
 * - 心愿文本验证（长度、空白）
 * - XSS防护（HTML标签转义）
 * - 心愿创建集成（完整流程）
 */

import { describe, it, expect } from 'vitest';
import {
  generateWishKey,
  generateWishId,
  validateCustomKey,
  validateWishText,
  countWishText,
  sanitizeWishText,
  prepareWishInput
} from './WishCreator';

// ============================================================================
// 小钥匙生成测试
// ============================================================================

describe('generateWishKey', () => {
  it('应该生成6位小钥匙', () => {
    const key = generateWishKey();
    expect(key.length).toBe(6);
  });
  
  it('应该只包含字母和数字', () => {
    const key = generateWishKey();
    const pattern = /^[a-zA-Z0-9]+$/;
    expect(pattern.test(key)).toBe(true);
  });
  
  it('应该生成不同的小钥匙（碰撞检测）', () => {
    const keys = Array.from({ length: 100 }, () => generateWishKey());
    const uniqueKeys = new Set(keys);
    // [CRITICAL] 100次生成应该全部唯一
    expect(uniqueKeys.size).toBe(100);
  });
});

describe('generateWishId', () => {
  it('应该生成12位ID', () => {
    const id = generateWishId();
    expect(id.length).toBe(12);
  });
  
  it('应该只包含字母和数字', () => {
    const id = generateWishId();
    const pattern = /^[a-zA-Z0-9]+$/;
    expect(pattern.test(id)).toBe(true);
  });
  
  it('应该生成不同的ID（碰撞检测）', () => {
    const ids = Array.from({ length: 100 }, () => generateWishId());
    const uniqueIds = new Set(ids);
    // [CRITICAL] 100次生成应该全部唯一
    expect(uniqueIds.size).toBe(100);
  });
});

// ============================================================================
// 自定义小钥匙验证测试
// ============================================================================

describe('validateCustomKey', () => {
  it('应该允许空小钥匙（自动生成）', () => {
    const result = validateCustomKey('');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  it('应该拒绝长度不足6位的小钥匙', () => {
    const result = validateCustomKey('abc12');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙必须是6位字符');
  });
  
  it('应该拒绝长度超过6位的小钥匙', () => {
    const result = validateCustomKey('abc1234');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙必须是6位字符');
  });
  
  it('应该拒绝包含特殊字符的小钥匙', () => {
    const result = validateCustomKey('abc-12');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙只能包含字母和数字');
  });
  
  it('应该拒绝包含空格的小钥匙', () => {
    const result = validateCustomKey('abc 12');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙只能包含字母和数字');
  });
  
  it('应该接受合法的6位小钥匙', () => {
    const result = validateCustomKey('xY9zKm');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  it('应该接受纯数字小钥匙', () => {
    const result = validateCustomKey('123456');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  it('应该接受纯字母小钥匙', () => {
    const result = validateCustomKey('abcdef');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

// ============================================================================
// 心愿文本验证测试
// ============================================================================

describe('validateWishText', () => {
  it('应该拒绝空文本', () => {
    const result = validateWishText('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('请输入心愿内容');
  });
  
  it('应该拒绝纯空白字符', () => {
    const result = validateWishText('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('请输入心愿内容');
  });
  
  it('应该接受1字文本', () => {
    const result = validateWishText('愿');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  it('应该接受100字文本', () => {
    // [CRITICAL] 构造精确100字的文本（5字 * 20）
    const text = '愿家人平安'.repeat(20);
    expect(text.length).toBe(100);
    const result = validateWishText(text);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  it('应该拒绝超过100字的文本', () => {
    // [CRITICAL] 构造精确101字的文本（100字 + 1字）
    const text = '愿家人平安'.repeat(20) + '多';
    expect(text.length).toBe(101);
    const result = validateWishText(text);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('心愿内容不能超过100字');
  });
  
  it('应该trim后验证（去除前后空白）', () => {
    const result = validateWishText('   愿家人平安   ');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  it('应该接受包含标点符号的文本', () => {
    const result = validateWishText('愿家人平安、健康、幸福！');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
  
  it('应该接受包含换行符的文本', () => {
    const result = validateWishText('愿家人平安\n健康幸福');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

// ============================================================================
// 字数统计测试
// ============================================================================

describe('countWishText', () => {
  it('应该返回trim后的字数', () => {
    expect(countWishText('   愿家人平安   ')).toBe(5); // 实际是5字（愿家人平安）
  });
  
  it('应该返回0（空文本）', () => {
    expect(countWishText('')).toBe(0);
  });
  
  it('应该返回0（纯空白）', () => {
    expect(countWishText('   ')).toBe(0);
  });
  
  it('应该正确计算中文字数', () => {
    expect(countWishText('愿家人平安健康')).toBe(7); // 实际是7字（愿家人平安健康）
  });
  
  it('应该正确计算英文单词数（按字符）', () => {
    expect(countWishText('hello world')).toBe(11); // 英文按字符数
  });
});

// ============================================================================
// XSS防护测试
// ============================================================================

describe('sanitizeWishText', () => {
  it('应该转义HTML标签（<script>）', () => {
    const result = sanitizeWishText('愿家人平安<script>alert("xss")</script>');
    expect(result).toBe('愿家人平安&lt;script&gt;alert("xss")&lt;/script&gt;');
  });
  
  it('应该转义HTML标签（<b>）', () => {
    const result = sanitizeWishText('愿<b>家人</b>平安');
    expect(result).toBe('愿&lt;b&gt;家人&lt;/b&gt;平安');
  });
  
  it('应该转义&符号', () => {
    const result = sanitizeWishText('愿家人平安&健康');
    expect(result).toBe('愿家人平安&amp;健康');
  });
  
  it('应该转义<符号', () => {
    const result = sanitizeWishText('愿家人<平安');
    expect(result).toBe('愿家人&lt;平安');
  });
  
  it('应该转义>符号', () => {
    const result = sanitizeWishText('愿家人>平安');
    expect(result).toBe('愿家人&gt;平安');
  });
  
  it('应该trim前后空白', () => {
    const result = sanitizeWishText('   愿家人平安   ');
    expect(result).toBe('愿家人平安');
  });
  
  it('应该不转义普通文本', () => {
    const result = sanitizeWishText('愿家人平安健康');
    expect(result).toBe('愿家人平安健康');
  });
  
  it('应该处理多重转义', () => {
    const result = sanitizeWishText('愿<script>家人</script>&平安>健康');
    expect(result).toBe('愿&lt;script&gt;家人&lt;/script&gt;&amp;平安&gt;健康');
  });
});

// ============================================================================
// 心愿创建集成测试
// ============================================================================

describe('prepareWishInput', () => {
  it('应该成功创建心愿（自动生成小钥匙）', () => {
    const result = prepareWishInput('愿家人平安健康');
    expect(result.success).toBe(true);
    expect(result.data?.text).toBe('愿家人平安健康');
    expect(result.data?.key?.length).toBe(6);
    expect(result.error).toBeUndefined();
  });
  
  it('应该成功创建心愿（自定义小钥匙）', () => {
    const result = prepareWishInput('愿家人平安健康', 'xY9zKm');
    expect(result.success).toBe(true);
    expect(result.data?.text).toBe('愿家人平安健康');
    expect(result.data?.key).toBe('xY9zKm');
    expect(result.error).toBeUndefined();
  });
  
  it('应该拒绝空文本', () => {
    const result = prepareWishInput('');
    expect(result.success).toBe(false);
    expect(result.error).toBe('请输入心愿内容');
    expect(result.data).toBeUndefined();
  });
  
  it('应该拒绝超过100字的文本', () => {
    // [CRITICAL] 构造精确101字的文本（100字 + 1字）
    const longText = '愿家人平安'.repeat(20) + '多';
    const result = prepareWishInput(longText);
    expect(result.success).toBe(false);
    expect(result.error).toBe('心愿内容不能超过100字');
    expect(result.data).toBeUndefined();
  });
  
  it('应该拒绝非法自定义小钥匙', () => {
    const result = prepareWishInput('愿家人平安健康', 'abc-12');
    expect(result.success).toBe(false);
    expect(result.error).toBe('小钥匙只能包含字母和数字');
    expect(result.data).toBeUndefined();
  });
  
  it('应该XSS防护处理', () => {
    const result = prepareWishInput('愿<script>家人</script>平安');
    expect(result.success).toBe(true);
    expect(result.data?.text).toBe('愿&lt;script&gt;家人&lt;/script&gt;平安');
  });
  
  it('应该trim处理空白', () => {
    const result = prepareWishInput('   愿家人平安健康   ', '  xY9zKm  ');
    expect(result.success).toBe(true);
    expect(result.data?.text).toBe('愿家人平安健康');
    expect(result.data?.key).toBe('xY9zKm');
  });
  
  it('应该自动生成小钥匙（自定义为空）', () => {
    const result = prepareWishInput('愿家人平安健康', '');
    expect(result.success).toBe(true);
    expect(result.data?.key?.length).toBe(6);
  });
});