<script lang="ts">
  import ShareModal from './ShareModal.svelte';
  import { triggerShare, isWebShareSupported } from '../lib/ShareAction';
  import Icon from '../lib/components/Icon.svelte';
  
  /**
   * 组件 Props 类型定义
   */
  interface Props {
    /** 心愿小钥匙（6位 nanoid） */
    wishKey: string;
    /** 心愿文本 */
    wishText: string;
    /** 可选的按钮标签 */
    label?: string;
  }
  
  // [CRITICAL] Svelte 5 runes syntax
  let { wishKey, wishText, label = '分享' }: Props = $props();
  
  // 弹窗状态管理
  let showModal = $state(false);
  
  /**
   * 点击分享按钮触发分享流程
   */
  async function handleClick() {
    // [CRITICAL] 优先使用 Web Share API（如果浏览器支持）
    if (isWebShareSupported()) {
      const result = await triggerShare(wishKey, wishText);
      
      // [CRITICAL] Web Share API 成功，无需弹出 ShareModal
      if (result.success) {
        console.log('[ShareButton] Web Share API 分享成功:', result.method);
        return;
      }
      
      // [CRITICAL] Web Share API 失败（用户取消或不支持），弹出 ShareModal
      console.log('[ShareButton] Web Share API 失败，显示 ShareModal');
      showModal = true;
    } else {
      // [CRITICAL] 浏览器不支持 Web Share API，直接弹出 ShareModal
      console.log('[ShareButton] Web Share API 不可用，显示 ShareModal');
      showModal = true;
    }
  }
  
  /**
   * 关闭弹窗
   */
  function handleCloseModal() {
    showModal = false;
  }
</script>

<button 
  class="share-button"
  onclick={handleClick}
  aria-label="分享心愿"
>
  <Icon name="share" size={20} /> {label}
</button>

{#if showModal}
  <ShareModal 
    wishKey={wishKey}
    wishText={wishText}
    onClose={handleCloseModal}
  />
{/if}

<style>
  /* ========================================
     分享按钮样式 - 使用 Design Tokens
     ======================================== */
  
  .share-button {
    /* 使用 tokens */
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    
    /* 布局 */
    padding: var(--space-2) var(--space-3);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: transparent;
    border: 1px solid var(--color-border-default);
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 触摸目标优化 */
    min-height: 44px;
    min-width: 44px;
    cursor: pointer;
  }
  
  .share-button:hover {
    /* hover 效果 */
    background: var(--color-bg-card);
    color: var(--color-text-primary);
    border-color: var(--color-border-light);
  }
</style>