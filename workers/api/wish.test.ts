/**
 * POST /api/wish API 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateWishId,
  generateWishKey,
  validateWishText,
  validateCustomKey,
  sanitizeWishText,
  checkKeyUniqueness,
  writeWishToKV
} from './wish';
import type { Wish } from '../lib/kv-schema';
import { kvKey } from '../lib/kv-schema';

// ============================================================================
// Mock KV Namespace
// ============================================================================

const createMockKV = () => {
  const storage = new Map<string, string>();
  
  return {
    get: vi.fn(async (key: string, type?: string) => {
      const value = storage.get(key);
      if (type === 'json' && value) {
        return JSON.parse(value);
      }
      return value || null;
    }),
    put: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
    _storage: storage // 内部访问（用于测试验证）
  } as unknown as KVNamespace & { _storage: Map<string, string> };
};

// ============================================================================
// ID 生成测试
// ============================================================================

describe('ID 生成', () => {
  it('should generate 12-character wish ID', () => {
    const id = generateWishId();
    expect(id.length).toBe(12);
    expect(id).toMatch(/[A-Za-z0-9]{12}/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateWishId());
    }
    expect(ids.size).toBe(100);
  });

  it('should generate 6-character wish key', () => {
    const key = generateWishKey();
    expect(key.length).toBe(6);
    expect(key).toMatch(/[A-Za-z0-9]{6}/);
  });

  it('should generate unique keys', () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateWishKey());
    }
    expect(keys.size).toBe(100);
  });
});

// ============================================================================
// 输入验证测试
// ============================================================================

describe('心愿文本验证', () => {
  it('should accept valid text', () => {
    const result = validateWishText('愿家人平安健康');
    expect(result.valid).toBe(true);
  });

  it('should reject empty text', () => {
    const result = validateWishText('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('请输入心愿内容');
  });

  it('should reject whitespace-only text', () => {
    const result = validateWishText('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('请输入心愿内容');
  });

  it('should reject text longer than 100 characters', () => {
    const longText = '愿'.repeat(101);
    const result = validateWishText(longText);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('心愿内容不能超过100字');
  });

  it('should accept text with exactly 100 characters', () => {
    const text = '愿'.repeat(100);
    const result = validateWishText(text);
    expect(result.valid).toBe(true);
  });

  it('should trim text before validation', () => {
    const result = validateWishText('  愿家人平安  ');
    expect(result.valid).toBe(true);
  });
});

describe('小钥匙验证', () => {
  it('should accept empty key (auto-generate)', () => {
    const result = validateCustomKey('');
    expect(result.valid).toBe(true);
  });

  it('should accept valid 6-character key', () => {
    const result = validateCustomKey('abc123');
    expect(result.valid).toBe(true);
  });

  it('should accept uppercase and lowercase letters', () => {
    const result = validateCustomKey('ABCxyz');
    expect(result.valid).toBe(true);
  });

  it('should reject key shorter than 6 characters', () => {
    const result = validateCustomKey('abc12');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙必须是6位字符');
  });

  it('should reject key longer than 6 characters', () => {
    const result = validateCustomKey('abc1234');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙必须是6位字符');
  });

  it('should reject key with special characters', () => {
    const result = validateCustomKey('abc-12');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙只能包含字母和数字');
  });

  it('should reject key with spaces', () => {
    const result = validateCustomKey('abc 12');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('小钥匙只能包含字母和数字');
  });
});

// ============================================================================
// XSS 防护测试
// ============================================================================

describe('XSS 防护', () => {
  it('should escape HTML tags', () => {
    const input = '<script>alert("xss")</script>';
    const output = sanitizeWishText(input);
    expect(output).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  it('should escape ampersands', () => {
    const input = '家人&朋友';
    const output = sanitizeWishText(input);
    expect(output).toBe('家人&amp;朋友');
  });

  it('should trim whitespace', () => {
    const input = '  愿家人平安  ';
    const output = sanitizeWishText(input);
    expect(output).toBe('愿家人平安');
  });

  it('should handle complex XSS patterns', () => {
    const input = '<img src=x onerror=alert(1)>';
    const output = sanitizeWishText(input);
    expect(output).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('should preserve normal text', () => {
    const input = '愿家人平安健康';
    const output = sanitizeWishText(input);
    expect(output).toBe(input);
  });
});

// ============================================================================
// KV 操作测试
// ============================================================================

describe('小钥匙唯一性检查', () => {
  it('should return true for unique key', async () => {
    const mockKV = createMockKV();
    const env = { KV: mockKV };
    
    const isUnique = await checkKeyUniqueness(env, 'abc123');
    expect(isUnique).toBe(true);
  });

  it('should return false for existing key', async () => {
    const mockKV = createMockKV();
    mockKV._storage.set(kvKey.key('abc123'), 'wish123');
    const env = { KV: mockKV };
    
    const isUnique = await checkKeyUniqueness(env, 'abc123');
    expect(isUnique).toBe(false);
  });
});

describe('KV 写入', () => {
  it('should write wish data to KV', async () => {
    const mockKV = createMockKV();
    const env = { KV: mockKV };
    
    const wish: Wish = {
      id: 'test123',
      key: 'key123',
      text: '愿家人平安',
      likes: 0,
      recommends: 0,
      created_at: '2026-04-03T10:00:00Z',
      updated_at: '2026-04-03T10:00:00Z',
      hour_bucket: '2026-04-03T10'
    };
    
    await writeWishToKV(env, wish);
    
    // 验证心愿数据写入
    const wishData = mockKV._storage.get(kvKey.wish('test123'));
    expect(wishData).toBeDefined();
    expect(JSON.parse(wishData!)).toEqual(wish);
    
    // 验证点赞计数器写入
    const likesData = mockKV._storage.get(kvKey.likes('test123'));
    expect(likesData).toBe('0');
    
    // 验证推荐计数器写入
    const recommendsData = mockKV._storage.get(kvKey.recommends('test123'));
    expect(recommendsData).toBe('0');
    
    // 验证小钥匙映射写入
    const keyMapping = mockKV._storage.get(kvKey.key('key123'));
    expect(keyMapping).toBe('test123');
    
    // 验证全局索引写入
    const allIds = mockKV._storage.get(kvKey.wishesAll());
    expect(JSON.parse(allIds!)).toContain('test123');
  });

  it('should append wish ID to existing index', async () => {
    const mockKV = createMockKV();
    mockKV._storage.set(kvKey.wishesAll(), JSON.stringify(['existing1', 'existing2']));
    const env = { KV: mockKV };
    
    const wish: Wish = {
      id: 'new123',
      key: 'key456',
      text: '愿朋友快乐',
      likes: 0,
      recommends: 0,
      created_at: '2026-04-03T10:00:00Z',
      updated_at: '2026-04-03T10:00:00Z',
      hour_bucket: '2026-04-03T10'
    };
    
    await writeWishToKV(env, wish);
    
    const allIds = JSON.parse(mockKV._storage.get(kvKey.wishesAll())!);
    expect(allIds).toEqual(['existing1', 'existing2', 'new123']);
  });
});

// ============================================================================
// API 整体流程测试（集成测试）
// ============================================================================

describe('API 整体流程', () => {
  it('should handle successful wish creation', async () => {
    const mockKV = createMockKV();
    const env = { KV: mockKV };
    
    // 模拟请求
    const request = new Request('http://localhost/api/wish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '愿家人平安健康', key: 'abc123' })
    });
    
    const context = {
      request,
      env,
      params: {},
      next: vi.fn()
    } as unknown as EventContext<{ KV: KVNamespace }, string, unknown>;
    
    const { onRequest } = await import('./wish');
    const response = await onRequest(context);
    
    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.text).toBe('愿家人平安健康');
    expect(body.data.key).toBe('abc123');
    expect(body.data.likes).toBe(0);
    expect(body.data.recommends).toBe(0);
    expect(body.data.id).toMatch(/[A-Za-z0-9]{12}/);
  });

  it('should reject invalid text', async () => {
    const mockKV = createMockKV();
    const env = { KV: mockKV };
    
    const request = new Request('http://localhost/api/wish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });
    
    const context = {
      request,
      env,
      params: {},
      next: vi.fn()
    } as unknown as EventContext<{ KV: KVNamespace }, string, unknown>;
    
    const { onRequest } = await import('./wish');
    const response = await onRequest(context);
    
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('INVALID_TEXT');
  });

  it('should reject duplicate key', async () => {
    const mockKV = createMockKV();
    mockKV._storage.set(kvKey.key('abc123'), 'existing123');
    const env = { KV: mockKV };
    
    const request = new Request('http://localhost/api/wish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '愿家人平安', key: 'abc123' })
    });
    
    const context = {
      request,
      env,
      params: {},
      next: vi.fn()
    } as unknown as EventContext<{ KV: KVNamespace }, string, unknown>;
    
    const { onRequest } = await import('./wish');
    const response = await onRequest(context);
    
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toBe('KEY_EXISTS');
  });

  it('should reject non-POST requests', async () => {
    const mockKV = createMockKV();
    const env = { KV: mockKV };
    
    const request = new Request('http://localhost/api/wish', {
      method: 'GET'
    });
    
    const context = {
      request,
      env,
      params: {},
      next: vi.fn()
    } as unknown as EventContext<{ KV: KVNamespace }, string, unknown>;
    
    const { onRequest } = await import('./wish');
    const response = await onRequest(context);
    
    expect(response.status).toBe(405);
  });

  it('should handle OPTIONS CORS request', async () => {
    const mockKV = createMockKV();
    const env = { KV: mockKV };
    
    const request = new Request('http://localhost/api/wish', {
      method: 'OPTIONS'
    });
    
    const context = {
      request,
      env,
      params: {},
      next: vi.fn()
    } as unknown as EventContext<{ KV: KVNamespace }, string, unknown>;
    
    const { onRequest } = await import('./wish');
    const response = await onRequest(context);
    
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});