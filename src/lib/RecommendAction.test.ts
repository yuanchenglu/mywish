/**
 * @description RecommendAction 单元测试
 * @version 1.0
 * @created 2026-04-03
 * 
 * 测试覆盖：
 * - triggerRecommend 函数调用
 * - 按钮禁用状态
 * - 高亮类添加和移除
 * - 缩放动画触发
 * - 成功回调调用
 * - 按钮恢复状态
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerRecommend, DEFAULT_RECOMMEND_CONFIG } from './RecommendAction';

describe('RecommendAction', () => {
  // Mock 定时器
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('应该禁用按钮并触发缩放动画', async () => {
    // 创建按钮元素
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // 触发推荐
    const promise = triggerRecommend(button);
    
    // [CRITICAL] 验证初始状态
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('recommend-highlight')).toBe(true);
    expect(button.style.transform).toBe('scale(1.1)');
    expect(button.style.willChange).toBe('transform');
    
    // 快进到高亮时长结束（500ms）
    await vi.advanceTimersByTimeAsync(DEFAULT_RECOMMEND_CONFIG.highlightDuration);
    
    // [CRITICAL] 验证高亮移除
    expect(button.classList.contains('recommend-highlight')).toBe(false);
    expect(button.style.transform).toBe('');
    expect(button.style.willChange).toBe('');
    
    // 快进到禁用时长结束（1000ms）
    await vi.advanceTimersByTimeAsync(
      DEFAULT_RECOMMEND_CONFIG.disableDuration - DEFAULT_RECOMMEND_CONFIG.highlightDuration
    );
    
    // [CRITICAL] 验证按钮恢复
    expect(button.disabled).toBe(false);
    
    // 清理
    button.remove();
  });
  
  it('应该调用成功回调', async () => {
    // 创建按钮元素
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // [CRITICAL] Mock 成功回调
    const onSuccess = vi.fn();
    
    // 触发推荐
    const promise = triggerRecommend(button, onSuccess);
    
    // [CRITICAL] 验证回调被调用
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith();
    
    // 快进到禁用时长结束
    await vi.runAllTimersAsync();
    
    // 清理
    button.remove();
  });
  
  it('应该接受自定义配置', async () => {
    // 创建按钮元素
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // [CRITICAL] 自定义配置
    const customConfig = {
      disableDuration: 2000,
      highlightDuration: 800,
      scaleRatio: 1.2
    };
    
    // 触发推荐
    const promise = triggerRecommend(button, undefined, customConfig);
    
    // [CRITICAL] 验证自定义缩放比例
    expect(button.style.transform).toBe('scale(1.2)');
    
    // 快进到自定义高亮时长结束（800ms）
    await vi.advanceTimersByTimeAsync(customConfig.highlightDuration);
    
    // [CRITICAL] 验证高亮移除
    expect(button.classList.contains('recommend-highlight')).toBe(false);
    
    // 快进到自定义禁用时长结束（2000ms）
    await vi.advanceTimersByTimeAsync(
      customConfig.disableDuration - customConfig.highlightDuration
    );
    
    // [CRITICAL] 验证按钮恢复
    expect(button.disabled).toBe(false);
    
    // 清理
    button.remove();
  });
  
  it('应该不调用回调如果未提供', async () => {
    // 创建按钮元素
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // 触发推荐（无回调）
    const promise = triggerRecommend(button);
    
    // 快进到禁用时长结束
    await vi.runAllTimersAsync();
    
    // [CRITICAL] 验证按钮恢复（无错误）
    expect(button.disabled).toBe(false);
    
    // 清理
    button.remove();
  });
  
  it('应该返回 Promise 并在禁用时长后 resolve', async () => {
    // 创建按钮元素
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // 触发推荐
    const promise = triggerRecommend(button);
    
    // [CRITICAL] 验证 Promise 存在
    expect(promise).toBeInstanceOf(Promise);
    
    // 快进到禁用时长结束
    await vi.runAllTimersAsync();
    
    // [CRITICAL] 验证 Promise resolved
    await expect(promise).resolves.toBeUndefined();
    
    // 清理
    button.remove();
  });
});