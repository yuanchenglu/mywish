/**
 * @description 分享动作逻辑 - 支持微博分享、微信分享、链接复制
 * @version 1.0
 * @created 2026-04-03
 * @dependencies Wish 类型（kv-schema.ts）
 * 
 * 功能特性：
 * - Web Share API 优先（如果浏览器支持）
 * - 微博分享：跳转到微博分享页面（带参数）
 * - 微信分享：显示链接，提示用户手动复制（方案 B）
 * - 链接分享：复制心愿链接到剪贴板
 * - 分享成功/失败 Toast 提示
 */

/**
 * 分享配置
 */
interface ShareConfig {
  /** 分享 URL（心愿链接） */
  url: string;
  /** 分享文本（心愿内容） */
  text: string;
  /** 分享标题 */
  title?: string;
}

/**
 * 分享结果
 */
interface ShareResult {
  /** 是否成功 */
  success: boolean;
  /** 提示消息 */
  message: string;
  /** 分享方式 */
  method?: 'web-api' | 'weibo' | 'wechat' | 'clipboard';
}

/**
 * 生成心愿分享链接
 * 
 * @param wishKey 心愿小钥匙（6位 nanoid）
 * @returns 分享链接（如 https://mywish.starseas.org/wish/ABC123）
 */
export function generateShareUrl(wishKey: string): string {
  // [CRITICAL] 使用配置的域名（生产环境）
  const baseUrl = 'https://mywish.starseas.org';
  return `${baseUrl}/wish/${wishKey}`;
}

/**
 * 复制链接到剪贴板
 * 
 * @param url 分享链接
 * @returns Promise<ShareResult> - 复制结果
 * 
 * @example
 * ```typescript
 * const result = await copyLinkToClipboard('https://mywish.starseas.org/wish/ABC123');
 * if (result.success) {
 *   showToast(result.message); // '链接已复制到剪贴板'
 * }
 * ```
 */
export async function copyLinkToClipboard(url: string): Promise<ShareResult> {
  try {
    // [CRITICAL] 使用现代 Clipboard API
    await navigator.clipboard.writeText(url);
    
    return {
      success: true,
      message: '链接已复制到剪贴板',
      method: 'clipboard'
    };
  } catch (err) {
    // [CRITICAL] 降级方案：使用传统复制方法
    console.warn('[ShareAction] Clipboard API 失败，尝试降级方案:', err);
    
    try {
      // 创建临时 textarea 元素
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        return {
          success: true,
          message: '链接已复制到剪贴板',
          method: 'clipboard'
        };
      } else {
        return {
          success: false,
          message: '复制失败，请手动复制链接'
        };
      }
    } catch (fallbackErr) {
      console.error('[ShareAction] 降级复制失败:', fallbackErr);
      return {
        success: false,
        message: '复制失败，请手动复制链接'
      };
    }
  }
}

/**
 * 分享到微博
 * 
 * @param config 分享配置
 * @returns ShareResult - 分享结果（微博分享总是返回成功）
 * 
 * @example
 * ```typescript
 * const result = shareToWeibo({
 *   url: 'https://mywish.starseas.org/wish/ABC123',
 *   text: '我的心愿是...'
 * });
 * ```
 */
export function shareToWeibo(config: ShareConfig): ShareResult {
  // [CRITICAL] 微博分享 URL 格式
  // https://service.weibo.com/share/share.php?title=...&url=...
  const weiboUrl = 'https://service.weibo.com/share/share.php';
  
  // [CRITICAL] 构造参数
  const params = new URLSearchParams({
    title: config.text, // 分享文本
    url: config.url,    // 分享链接
    appkey: '',         // 应用 key（可选）
    ralateUid: '',      // 关联用户（可选）
    searchPic: 'true'   // 搜索图片（可选）
  });
  
  // [CRITICAL] 打开微博分享页面
  const fullUrl = `${weiboUrl}?${params.toString()}`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
  
  return {
    success: true,
    message: '已打开微博分享页面',
    method: 'weibo'
  };
}

/**
 * 分享到微信（方案 B：显示链接）
 * 
 * @param url 分享链接
 * @returns ShareResult - 分享结果（返回链接供用户手动复制）
 * 
 * @example
 * ```typescript
 * const result = shareToWechat('https://mywish.starseas.org/wish/ABC123');
 * // result.message = '请在微信中发送此链接：...'
 * ```
 */
export function shareToWechat(url: string): ShareResult {
  // [CRITICAL] 方案 B：不使用 SDK，仅显示链接提示用户手动复制
  return {
    success: true,
    message: `请在微信中发送此链接：${url}`,
    method: 'wechat'
  };
}

/**
 * 使用 Web Share API 分享（如果浏览器支持）
 * 
 * @param config 分享配置
 * @returns Promise<ShareResult> - 分享结果
 * 
 * @example
 * ```typescript
 * const result = await shareWithWebAPI({
 *   url: 'https://mywish.starseas.org/wish/ABC123',
 *   text: '我的心愿是...',
 *   title: '星辰心愿'
 * });
 * ```
 */
export async function shareWithWebAPI(config: ShareConfig): Promise<ShareResult> {
  // [CRITICAL] 检查浏览器是否支持 Web Share API
  if (!navigator.share) {
    console.warn('[ShareAction] Web Share API 不可用');
    return {
      success: false,
      message: '当前浏览器不支持原生分享功能'
    };
  }
  
  try {
    // [CRITICAL] 调用 Web Share API
    await navigator.share({
      title: config.title || '星辰心愿',
      text: config.text,
      url: config.url
    });
    
    return {
      success: true,
      message: '分享成功',
      method: 'web-api'
    };
  } catch (err) {
    // [CRITICAL] 用户取消分享或分享失败
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        message: '已取消分享'
      };
    }
    
    console.error('[ShareAction] Web Share API 失败:', err);
    return {
      success: false,
      message: '分享失败'
    };
  }
}

/**
 * 智能分享触发器（优先使用 Web Share API）
 * 
 * @param wishKey 心愿小钥匙
 * @param wishText 心愿文本
 * @returns Promise<ShareResult> - 分享结果
 * 
 * @example
 * ```typescript
 * const result = await triggerShare('ABC123', '我的心愿是...');
 * if (result.success) {
 *   showToast(result.message);
 * } else {
 *   // 显示 ShareModal 让用户选择其他分享方式
 *   showShareModal();
 * }
 * ```
 */
export async function triggerShare(
  wishKey: string,
  wishText: string
): Promise<ShareResult> {
  // [CRITICAL] 生成分享链接
  const shareUrl = generateShareUrl(wishKey);
  
  // [CRITICAL] 尝试使用 Web Share API（优先）
  const webApiResult = await shareWithWebAPI({
    url: shareUrl,
    text: wishText,
    title: '星辰心愿'
  });
  
  // [CRITICAL] 如果 Web Share API 成功，直接返回
  if (webApiResult.success) {
    return webApiResult;
  }
  
  // [CRITICAL] 如果 Web Share API 不可用或失败，返回失败结果
  // 由 ShareModal 提供其他分享选项
  return {
    success: false,
    message: '请选择其他分享方式',
    method: undefined
  };
}

/**
 * 检查浏览器是否支持 Web Share API
 * 
 * @returns boolean
 */
export function isWebShareSupported(): boolean {
  return typeof navigator.share === 'function';
}