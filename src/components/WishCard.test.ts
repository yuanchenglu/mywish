import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import WishCard from './WishCard.svelte';
import type { Wish } from '../../workers/lib/kv-schema';

describe('WishCard 组件', () => {
  const mockWish: Wish = {
    id: 'abc123def456',
    key: 'xY9zKm',
    text: '愿家人平安健康，幸福美满',
    likes: 128,
    recommends: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hour_bucket: '2026-04-03T10'
  };
  
  beforeEach(() => {
    // Mock fetch API
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: { likes: 129, recommends: 46 }
      })
    }) as unknown as typeof fetch;
    
    // Mock clipboard
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
  });
  
  it('应该正确渲染心愿文本', () => {
    const { getByText } = render(WishCard, { wish: mockWish });
    expect(getByText('愿家人平安健康，幸福美满')).toBeTruthy();
  });
  
  it('应该显示小钥匙', () => {
    const { getByText } = render(WishCard, { wish: mockWish });
    expect(getByText('🔑 xY9zKm')).toBeTruthy();
  });
  
  it('应该显示点赞数和推荐数', () => {
    const { getByText } = render(WishCard, { wish: mockWish });
    expect(getByText('❤️ 128')).toBeTruthy();
    expect(getByText('🌟 45')).toBeTruthy();
  });
  
  it('应该显示相对时间（刚刚）', () => {
    const { getByText } = render(WishCard, { wish: mockWish });
    expect(getByText('刚刚')).toBeTruthy();
  });
  
  it('应该触发点赞回调', async () => {
    const onLike = vi.fn();
    const { getByText } = render(WishCard, { 
      wish: mockWish, 
      onLike 
    });
    
    const likeBtn = getByText('❤️ 128');
    await likeBtn.click();
    
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(onLike).toHaveBeenCalledOnce();
  });
  
  it('应该触发推荐回调', async () => {
    const onRecommend = vi.fn();
    const { getByText } = render(WishCard, { 
      wish: mockWish, 
      onRecommend 
    });
    
    const recommendBtn = getByText('🌟 45');
    await recommendBtn.click();
    
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(onRecommend).toHaveBeenCalledOnce();
  });
  
  it('应该复制小钥匙到剪贴板', async () => {
    const { getByText } = render(WishCard, { wish: mockWish });
    const keyBtn = getByText('🔑 xY9zKm');
    await keyBtn.click();
    
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('xY9zKm');
  });
  
  it('应该显示历史时间的相对格式', () => {
    const oldWish: Wish = {
      ...mockWish,
      created_at: new Date(Date.now() - 3600000).toISOString() // 1小时前
    };
    
    const { getByText } = render(WishCard, { wish: oldWish });
    expect(getByText('1小时前')).toBeTruthy();
  });
  
  it('应该应用星空蓝主题样式', () => {
    const { container } = render(WishCard, { wish: mockWish });
    const card = container.querySelector('.wish-card');
    
    expect(card).toBeTruthy();
    expect(card?.classList.contains('wish-card')).toBe(true);
  });
  
  it('应该包含分享按钮', () => {
    const { getByText } = render(WishCard, { wish: mockWish });
    expect(getByText('🔗 分享')).toBeTruthy();
  });
});