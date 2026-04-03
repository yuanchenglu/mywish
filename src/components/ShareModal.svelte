<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import {
    copyLinkToClipboard,
    shareToWeibo,
    shareToWechat,
    generateShareUrl
  } from '../lib/ShareAction';
  
  /**
   * 组件 Props 类型定义
   */
  interface Props {
    /** 心愿小钥匙（6位 nanoid） */
    wishKey: string;
    /** 心愿文本 */
    wishText: string;
    /** 关闭弹窗回调 */
    onClose: () => void;
  }
  
  // [CRITICAL] Svelte 5 runes syntax
  let { wishKey, wishText, onClose }: Props = $props();
  
  // Toast 状态管理
  let showToast = $state(false);
  let toastMessage = $state('');
  
  // [CRITICAL] 生成分享链接（派生状态）
  let shareUrl = $derived(generateShareUrl(wishKey));
  
  /**
   * 复制链接到剪贴板
   */
  async function handleCopyLink() {
    const result = await copyLinkToClipboard(shareUrl);
    
    showToast = true;
    toastMessage = result.message;
    
    // 3秒后隐藏 toast
    setTimeout(() => {
      showToast = false;
    }, 3000);
    
    // [CRITICAL] 复制成功后延迟关闭弹窗
    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }
  
  /**
   * 分享到微博
   */
  function handleWeiboShare() {
    const result = shareToWeibo({
      url: shareUrl,
      text: wishText
    });
    
    showToast = true;
    toastMessage = result.message;
    
    // 3秒后隐藏 toast
    setTimeout(() => {
      showToast = false;
    }, 3000);
    
    // [CRITICAL] 微博分享页面已打开，延迟关闭弹窗
    setTimeout(() => {
      onClose();
    }, 1500);
  }
  
  /**
   * 微信分享（显示链接）
   */
  function handleWechatShare() {
    const result = shareToWechat(shareUrl);
    
    // [CRITICAL] 微信分享需要用户手动复制，不自动关闭弹窗
    showToast = true;
    toastMessage = result.message;
    
    // 5秒后隐藏 toast（给用户足够时间复制链接）
    setTimeout(() => {
      showToast = false;
    }, 5000);
  }
  
  /**
   * 点击遮罩层关闭
   */
  function handleOverlayClick(event: Event) {
    // [CRITICAL] 仅点击遮罩层关闭（不点击内容区域）
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

<!-- [CRITICAL] 遮罩层 + 底部弹出设计 -->
<div 
  class="share-overlay" 
  onclick={handleOverlayClick}
  role="dialog"
  aria-modal="true"
  aria-label="分享选项"
>
  <div class="share-modal">
    <div class="share-header">
      <h2 class="share-title">分享心愿</h2>
      <button 
        class="close-btn" 
        onclick={onClose}
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
    
    <!-- [CRITICAL] 分享链接显示 -->
    <div class="share-url-container">
      <input 
        type="text" 
        class="share-url-input" 
        value={shareUrl}
        readonly
        aria-label="分享链接"
      />
    </div>
    
    <!-- [CRITICAL] 分享选项按钮 -->
    <div class="share-options">
      <button 
        class="share-option-btn weibo-btn"
        onclick={handleWeiboShare}
        aria-label="分享到微博"
      >
        <span class="share-icon"><Icon name="at" size={24} /></span>
        <span class="share-label">微博分享</span>
      </button>
      
      <button 
        class="share-option-btn wechat-btn"
        onclick={handleWechatShare}
        aria-label="微信分享"
      >
        <span class="share-icon"><Icon name="message" size={24} /></span>
        <span class="share-label">微信分享</span>
      </button>
      
      <button 
        class="share-option-btn copy-btn"
        onclick={handleCopyLink}
        aria-label="复制链接"
      >
        <span class="share-icon"><Icon name="link" size={24} /></span>
        <span class="share-label">复制链接</span>
      </button>
    </div>
    
    <!-- [CRITICAL] Toast 提示 -->
    {#if showToast}
      <div class="toast" role="alert" aria-live="polite">
        {toastMessage}
      </div>
    {/if}
  </div>
</div>

<style>
  /* ========================================
     遮罩层样式 - 使用 Design Tokens
     ======================================== */
  
  .share-overlay {
    /* [CRITICAL] 固定定位 + 全屏覆盖 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    /* 使用 tokens */
    background: var(--color-bg-overlay);
    
    /* z-index */
    z-index: 999;
    
    /* Flexbox 布局（底部弹出） */
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    
    /* 动画 */
    animation: fadeIn var(--duration-fast) var(--ease-out);
  }
  
  /* ========================================
     弹窗样式 - 使用 Design Tokens
     ======================================== */
  
  .share-modal {
    /* 使用 tokens */
    background: var(--color-bg-card);
    
    /* 圆角（仅顶部） */
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    
    /* 阴影 */
    box-shadow: var(--shadow-lg);
    
    /* 内边距 */
    padding: var(--space-4);
    
    /* 边框 */
    border: 1px solid var(--color-border-light);
    border-bottom: none;
    
    /* 动画 */
    animation: slideUp var(--duration-base) var(--ease-out);
  }
  
  /* ========================================
     弹窗头部样式
     ======================================== */
  
  .share-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    margin-bottom: var(--space-4);
  }
  
  .share-title {
    /* 使用 tokens */
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    
    margin: 0;
  }
  
  .close-btn {
    /* 使用 tokens */
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
    
    /* 布局 */
    padding: var(--space-2);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: transparent;
    border: none;
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 触摸目标优化 */
    min-height: 44px;
    min-width: 44px;
    cursor: pointer;
  }
  
  .close-btn:hover {
    /* hover 效果 */
    color: var(--color-text-primary);
    background: rgba(255, 255, 255, 0.1);
  }
  
  /* ========================================
     分享链接显示区域
     ======================================== */
  
  .share-url-container {
    margin-bottom: var(--space-4);
  }
  
  .share-url-input {
    /* 使用 tokens */
    font-size: var(--font-size-sm);
    color: var(--color-secondary-400);
    
    /* 布局 */
    width: 100%;
    padding: var(--space-2) var(--space-3);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: rgba(0, 180, 219, 0.1);
    border: 1px solid var(--color-secondary-400);
    
    /* 文本样式 */
    text-align: center;
    
    /* 不可编辑 */
    outline: none;
  }
  
  /* ========================================
     分享选项按钮容器
     ======================================== */
  
  .share-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  
  /* ========================================
     分享选项按钮样式
     ======================================== */
  
  .share-option-btn {
    /* 使用 tokens */
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    
    /* 布局 */
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--color-border-default);
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 触摸目标优化 */
    min-height: 44px;
    cursor: pointer;
  }
  
  .share-option-btn:hover {
    /* hover 效果 */
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--color-border-light);
  }
  
  .share-icon {
    font-size: var(--font-size-xl);
  }
  
  .share-label {
    font-weight: var(--font-weight-medium);
  }
  
  /* ========================================
     Toast 提示样式
     ======================================== */
  
  .toast {
    /* 定位 */
    position: fixed;
    bottom: var(--space-8);
    left: 50%;
    transform: translateX(-50%);
    
    /* 使用 tokens */
    background: var(--color-bg-overlay);
    color: var(--color-text-primary);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-base);
    
    /* 阴影和边框 */
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border-light);
    
    /* z-index */
    z-index: 1000;
    
    /* 动画 */
    animation: fadeIn var(--duration-base) var(--ease-out);
    
    /* [CRITICAL] 限制最大宽度 */
    max-width: 90vw;
    text-align: center;
  }
  
  /* ========================================
     动画定义
     ======================================== */
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  /* ========================================
     响应式设计 - Desktop
     ======================================== */
  
  @media (min-width: 768px) {
    .share-modal {
      /* [CRITICAL] 桌面端居中显示（而非底部弹出） */
      margin: auto;
      max-width: 400px;
      
      /* 全圆角 */
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
    }
    
    .share-overlay {
      /* 桌面端居中布局 */
      justify-content: center;
      align-items: center;
    }
  }
</style>