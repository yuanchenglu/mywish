import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerLikeAnimation, triggerStarsOnly, triggerVoiceOnly } from './LikeAction';

describe('LikeAction 点赞动画逻辑', () => {
  let mockContainer: HTMLElement;

  beforeEach(() => {
    // 创建模拟容器
    mockContainer = document.createElement('div');
    mockContainer.style.position = 'static';
    document.body.appendChild(mockContainer);

    // Mock SpeechSynthesisUtterance（jsdom 没有）
    class MockSpeechSynthesisUtterance {
      text: string;
      lang: string;
      rate: number;
      volume: number;
      voice: SpeechSynthesisVoice | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: any) => void) | null = null;

      constructor(text: string) {
        this.text = text;
        this.lang = 'zh-CN';
        this.rate = 1;
        this.volume = 1;
      }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockSpeechSynthesisUtterance,
      configurable: true
    });

    // Mock speechSynthesis
    const speechSynthesisMock = {
      speak: vi.fn((utterance: any) => {
        if (utterance.onend) setTimeout(utterance.onend, 10);
      }),
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([])
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: speechSynthesisMock,
      configurable: true
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true
    });
  });

  it('应该创建 7 个星星元素（默认数量）', async () => {
    // [CRITICAL] 使用 vi.useFakeTimers() 阻止异步清理
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer);
    
    // 立即检查星星数量（清理前）
    const stars = mockContainer.querySelectorAll('.star-fall');
    expect(stars.length).toBe(7);
    
    // 快进时间，完成 Promise
    vi.advanceTimersByTime(3000);
    await promise;
    
    vi.useRealTimers();
  });

  it('应该支持自定义星星数量（5-10）', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer, { count: 10 });
    
    const stars = mockContainer.querySelectorAll('.star-fall');
    expect(stars.length).toBe(10);
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    vi.useRealTimers();
  });

  it('应该应用 star-fall 动画类', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer);
    
    const star = mockContainer.querySelector('.star-fall');
    expect(star?.classList.contains('star-fall')).toBe(true);
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    vi.useRealTimers();
  });

  it('应该应用延迟辅助类（star-delay-1/2/3/4/5）', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer);
    
    const stars = mockContainer.querySelectorAll('.star-fall');
    stars.forEach((star, index) => {
      const delayIndex = index % 5;
      expect(star.classList.contains(`star-delay-${delayIndex + 1}`)).toBe(true);
    });
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    vi.useRealTimers();
  });

  it('应该设置随机水平位置', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer);
    
    const stars = mockContainer.querySelectorAll('.star-fall');
    stars.forEach(star => {
      const leftValue = (star as HTMLElement).style.left;
      expect(leftValue).toMatch(/\d+%/);
      
      const percentage = parseFloat(leftValue);
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    vi.useRealTimers();
  });

  it('应该确保容器支持相对定位', async () => {
    vi.useFakeTimers();
    
    mockContainer.style.position = 'static';
    
    const promise = triggerLikeAnimation(mockContainer);
    
    expect(mockContainer.style.position).toBe('relative');
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    vi.useRealTimers();
  });

  it('应该播放祝福语音（如果启用）', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer, { enableVoice: true });
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    expect(speechSynthesis.speak).toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('应该不播放语音（如果禁用）', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer, { enableVoice: false });
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    expect(speechSynthesis.speak).not.toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('应该使用 GPU 加速样式', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer);
    
    const star = mockContainer.querySelector('.star-fall') as HTMLElement;
    expect(star.style.willChange).toBe('transform, opacity');
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    vi.useRealTimers();
  });

  it('应该在 3 秒后自动清理星星', async () => {
    vi.useFakeTimers();
    
    const promise = triggerLikeAnimation(mockContainer);
    
    // 检查星星存在
    expect(mockContainer.querySelectorAll('.star-fall').length).toBe(7);
    
    // 快进 3 秒 + Promise flush
    vi.advanceTimersByTime(3000);
    await vi.runAllTimersAsync();
    await promise;
    
    // 检查星星已移除
    expect(mockContainer.querySelectorAll('.star-fall').length).toBe(0);
    
    vi.useRealTimers();
  });

  it('triggerStarsOnly 应该仅触发动画（无语音）', async () => {
    vi.useFakeTimers();
    
    const promise = triggerStarsOnly(mockContainer);
    
    expect(mockContainer.querySelectorAll('.star-fall').length).toBe(7);
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    expect(speechSynthesis.speak).not.toHaveBeenCalled();
    
    vi.useRealTimers();
  });

  it('triggerVoiceOnly 应该仅播放语音（无动画）', async () => {
    vi.useFakeTimers();
    
    const promise = triggerVoiceOnly();
    
    vi.advanceTimersByTime(3000);
    await promise;
    
    expect(mockContainer.querySelectorAll('.star-fall').length).toBe(0);
    expect(speechSynthesis.speak).toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});