import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlessingVoice, playBlessingVoice } from './BlessingVoice';

describe('BlessingVoice 祝福语音管理', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true
    });

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
  });

  it('应该检测浏览器是否支持 Web Speech API', () => {
    expect(BlessingVoice.isSupported()).toBe(true);
  });

  it('应该获取用户语音偏好（默认启用）', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    expect(BlessingVoice.isEnabled()).toBe(true);
  });

  it('应该读取 localStorage 中的用户偏好', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('false');
    expect(BlessingVoice.isEnabled()).toBe(false);
  });

  it('应该设置用户语音偏好到 localStorage', () => {
    BlessingVoice.setEnabled(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('mywish-blessing-voice-enabled', 'false');
  });

  it('应该播放祝福语音', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    await BlessingVoice.play();
    
    expect(speechSynthesis.cancel).toHaveBeenCalled();
    expect(speechSynthesis.speak).toHaveBeenCalled();
  });

  it('应该不播放语音（用户已关闭）', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('false');
    
    await BlessingVoice.play();
    
    expect(speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('应该使用默认祝福文本', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    await BlessingVoice.play();
    
    const utterance = vi.mocked(speechSynthesis.speak).mock.calls[0][0];
    expect(utterance.text).toBe('愿星辰大海守护你');
    expect(utterance.lang).toBe('zh-CN');
    expect(utterance.rate).toBe(0.9);
  });

  it('应该支持自定义祝福文本', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    await BlessingVoice.play({ text: '祝福你心想事成' });
    
    const utterance = vi.mocked(speechSynthesis.speak).mock.calls[0][0];
    expect(utterance.text).toBe('祝福你心想事成');
  });

  it('应该停止当前播放的语音', () => {
    BlessingVoice.stop();
    expect(speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('快捷函数应该调用 BlessingVoice.play()', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    await playBlessingVoice();
    
    expect(speechSynthesis.speak).toHaveBeenCalled();
  });
});