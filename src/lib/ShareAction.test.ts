import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateShareUrl,
  copyLinkToClipboard,
  shareToWeibo,
  shareToWechat,
  shareWithWebAPI,
  triggerShare,
  isWebShareSupported
} from './ShareAction';

describe('ShareAction 分享动作逻辑', () => {
  beforeEach(() => {
    // Mock Clipboard API
    const clipboardMock = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: clipboardMock,
      configurable: true
    });

    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: vi.fn(),
      configurable: true
    });

    // [CRITICAL] Mock document.execCommand（jsdom 没有）
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
      writable: true
    });
  });

  describe('generateShareUrl', () => {
    it('应该生成正确的分享链接', () => {
      const wishKey = 'ABC123';
      const url = generateShareUrl(wishKey);

      expect(url).toBe('https://mywish.starseas.org/wish/ABC123');
    });

    it('应该处理不同的 wishKey', () => {
      const wishKey = 'XYZ789';
      const url = generateShareUrl(wishKey);

      expect(url).toBe('https://mywish.starseas.org/wish/XYZ789');
    });
  });

  describe('copyLinkToClipboard', () => {
    it('应该成功复制链接到剪贴板', async () => {
      const url = 'https://mywish.starseas.org/wish/ABC123';
      const result = await copyLinkToClipboard(url);

      expect(result.success).toBe(true);
      expect(result.message).toBe('链接已复制到剪贴板');
      expect(result.method).toBe('clipboard');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    });

    it('应该在 Clipboard API 失败时使用降级方案', async () => {
      // Mock Clipboard API 失败
      const clipboardMock = {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard API 失败'))
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: clipboardMock,
        configurable: true
      });

      const url = 'https://mywish.starseas.org/wish/ABC123';
      const result = await copyLinkToClipboard(url);

      expect(result.success).toBe(true);
      expect(result.message).toBe('链接已复制到剪贴板');
      expect(result.method).toBe('clipboard');
    });

    it('应该在降级方案也失败时返回失败结果', async () => {
      // Mock Clipboard API 失败
      const clipboardMock = {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard API 失败'))
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: clipboardMock,
        configurable: true
      });

      // [CRITICAL] Mock execCommand 失败
      Object.defineProperty(document, 'execCommand', {
        value: vi.fn().mockReturnValue(false),
        configurable: true,
        writable: true
      });

      const url = 'https://mywish.starseas.org/wish/ABC123';
      const result = await copyLinkToClipboard(url);

      expect(result.success).toBe(false);
      expect(result.message).toBe('复制失败，请手动复制链接');
    });
  });

  describe('shareToWeibo', () => {
    it('应该打开微博分享页面', () => {
      const config = {
        url: 'https://mywish.starseas.org/wish/ABC123',
        text: '我的心愿是...'
      };

      const result = shareToWeibo(config);

      expect(result.success).toBe(true);
      expect(result.message).toBe('已打开微博分享页面');
      expect(result.method).toBe('weibo');
      expect(window.open).toHaveBeenCalled();
    });

    it('应该构造正确的微博分享 URL', () => {
      const config = {
        url: 'https://mywish.starseas.org/wish/ABC123',
        text: '我的心愿是...'
      };

      shareToWeibo(config);

      const openCall = (window.open as any).mock.calls[0];
      const weiboUrl = openCall[0];

      expect(weiboUrl).toContain('https://service.weibo.com/share/share.php');
      expect(weiboUrl).toContain('title=');
      expect(weiboUrl).toContain('url=');
    });
  });

  describe('shareToWechat', () => {
    it('应该返回微信分享提示', () => {
      const url = 'https://mywish.starseas.org/wish/ABC123';
      const result = shareToWechat(url);

      expect(result.success).toBe(true);
      expect(result.message).toContain('请在微信中发送此链接');
      expect(result.message).toContain(url);
      expect(result.method).toBe('wechat');
    });
  });

  describe('shareWithWebAPI', () => {
    it('应该在浏览器支持时成功分享', async () => {
      // Mock navigator.share
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockResolvedValue(undefined),
        configurable: true
      });

      const config = {
        url: 'https://mywish.starseas.org/wish/ABC123',
        text: '我的心愿是...',
        title: '星辰心愿'
      };

      const result = await shareWithWebAPI(config);

      expect(result.success).toBe(true);
      expect(result.message).toBe('分享成功');
      expect(result.method).toBe('web-api');
      expect(navigator.share).toHaveBeenCalledWith({
        title: '星辰心愿',
        text: '我的心愿是...',
        url: 'https://mywish.starseas.org/wish/ABC123'
      });
    });

    it('应该在浏览器不支持时返回失败', async () => {
      // Mock navigator.share 不存在
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        configurable: true
      });

      const config = {
        url: 'https://mywish.starseas.org/wish/ABC123',
        text: '我的心愿是...'
      };

      const result = await shareWithWebAPI(config);

      expect(result.success).toBe(false);
      expect(result.message).toBe('当前浏览器不支持原生分享功能');
    });

    it('应该处理用户取消分享', async () => {
      // Mock navigator.share 抛出 AbortError
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockRejectedValue(abortError),
        configurable: true
      });

      const config = {
        url: 'https://mywish.starseas.org/wish/ABC123',
        text: '我的心愿是...'
      };

      const result = await shareWithWebAPI(config);

      expect(result.success).toBe(false);
      expect(result.message).toBe('已取消分享');
    });
  });

  describe('triggerShare', () => {
    it('应该在 Web Share API 成功时返回成功结果', async () => {
      // Mock navigator.share
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockResolvedValue(undefined),
        configurable: true
      });

      const wishKey = 'ABC123';
      const wishText = '我的心愿是...';

      const result = await triggerShare(wishKey, wishText);

      expect(result.success).toBe(true);
      expect(result.method).toBe('web-api');
    });

    it('应该在 Web Share API 失败时返回失败结果', async () => {
      // Mock navigator.share 不存在
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        configurable: true
      });

      const wishKey = 'ABC123';
      const wishText = '我的心愿是...';

      const result = await triggerShare(wishKey, wishText);

      expect(result.success).toBe(false);
      expect(result.message).toBe('请选择其他分享方式');
    });
  });

  describe('isWebShareSupported', () => {
    it('应该在浏览器支持时返回 true', () => {
      // Mock navigator.share
      Object.defineProperty(navigator, 'share', {
        value: vi.fn(),
        configurable: true
      });

      expect(isWebShareSupported()).toBe(true);
    });

    it('应该在浏览器不支持时返回 false', () => {
      // Mock navigator.share 不存在
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        configurable: true
      });

      expect(isWebShareSupported()).toBe(false);
    });
  });
});