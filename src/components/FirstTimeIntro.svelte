<script lang="ts">
  /**
   * @description 首次引导浮窗组件 - 展示社区文化和价值承诺
   * @version 1.0
   * @created 2026-04-04
   * @design docs/10_Design/11_Feat_FirstTimeIntro.md
   */
  
  import Icon from '$lib/components/Icon.svelte';
  
  interface Props {
    /** 关闭浮窗回调 */
    onClose: () => void;
  }
  
  let { onClose }: Props = $props();
  
  // [CRITICAL] Svelte 5 runes - 动画状态
  let isVisible = $state(false);
  
  // 组件挂载后触发进入动画
  $effect(() => {
    setTimeout(() => { isVisible = true; }, 10);
  });
  
  /**
   * 关闭浮窗（带动画）
   */
  function handleClose() {
    isVisible = false;
    setTimeout(() => {
      onClose();
    }, 300);
  }
  
  /**
   * 点击遮罩层关闭
   */
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
  
  /**
   * ESC键关闭
   */
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- 遮罩层 + 浮窗 -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div 
  class="intro-backdrop"
  class:visible={isVisible}
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  role="dialog"
  aria-modal="true"
  aria-labelledby="intro-title"
  tabindex="-1"
>
  <!-- 浮窗内容 -->
  <div class="intro-modal" class:visible={isVisible}>
    <!-- 关闭按钮 -->
    <button 
      class="close-btn"
      onclick={handleClose}
      aria-label="关闭"
    >
      ✕
    </button>
    
    <!-- 内容区域 -->
    <div class="intro-content">
      <!-- 开场问句 -->
      <p class="intro-opening">
        你相信光吗？<Icon name="sparkles" size={24} /><br>
        你相信吸引力法则吗？<Icon name="star" size={24} />
      </p>
      
      <!-- 技术价值承诺 -->
      <p class="intro-tech">
        心愿不会石沉大海——<br>
        极致SEO优化，让心愿被全网收录，<br>
        冲向星辰，被更多人看见。
      </p>
      
      <!-- 社区灵魂 -->
      <p class="intro-soul">
        想许愿就许愿，想点赞就点赞。<br>
        不防爬，不限赞，全凭缘分。<br>
        这里没有规则，只有善意。
      </p>
      
      <!-- 确认按钮 -->
      <button 
        class="confirm-btn"
        onclick={handleClose}
      >
        我懂了
      </button>
    </div>
  </div>
</div>

<style>
  /* ========================================
     遮罩层样式
     ======================================== */
  
  .intro-backdrop {
    /* 固定定位 + 全屏覆盖 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    /* 背景：半透明 */
    background: var(--color-bg-overlay);
    
    /* z-index：高于普通Modal */
    z-index: 250;
    
    /* Flexbox布局：移动端底部，桌面端居中 */
    display: flex;
    align-items: flex-end;
    justify-content: center;
    
    /* 默认隐藏 */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s var(--ease-out), visibility 0.3s;
  }
  
  .intro-backdrop.visible {
    opacity: 1;
    visibility: visible;
  }
  
  /* 桌面端：居中弹出 */
  @media (min-width: 768px) {
    .intro-backdrop {
      align-items: center;
    }
  }
  
  /* ========================================
     浮窗容器样式
     ======================================== */
  
  .intro-modal {
    /* 宽度 */
    width: 100%;
    max-width: 600px;
    
    /* 背景：深空紫渐变 */
    background: var(--gradient-card);
    
    /* 圆角：移动端仅顶部 */
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    
    /* 边框 */
    border: 1px solid var(--color-border-light);
    border-bottom: none;
    
    /* 阴影 */
    box-shadow: var(--shadow-lg);
    
    /* 动画：从底部滑入 */
    transform: translateY(100%);
    transition: transform 0.3s var(--ease-out);
    
    /* 最大高度 */
    max-height: 85vh;
    overflow-y: auto;
    
    /* 相对定位（用于关闭按钮） */
    position: relative;
  }
  
  .intro-modal.visible {
    transform: translateY(0);
  }
  
  /* 桌面端：全圆角 */
  @media (min-width: 768px) {
    .intro-modal {
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
      max-width: 500px;
    }
  }
  
  /* ========================================
     关闭按钮
     ======================================== */
  
  .close-btn {
    /* 绝对定位 */
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    
    /* 去除默认样式 */
    background: transparent;
    border: none;
    
    /* 颜色 */
    color: var(--color-text-muted);
    font-size: 20px;
    
    /* 触摸目标优化 */
    min-width: 44px;
    min-height: 44px;
    
    /* Flexbox居中 */
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 过渡 */
    transition: all var(--duration-fast) var(--ease-out);
    
    cursor: pointer;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text-primary);
  }
  
  /* ========================================
     内容区域
     ======================================== */
  
  .intro-content {
    /* 间距 */
    padding: var(--space-8) var(--space-6);
    
    /* 居中对齐 */
    text-align: center;
  }
  
  /* ========================================
     开场问句
     ======================================== */
  
  .intro-opening {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: var(--line-height-loose);
    margin-bottom: var(--space-6);
  }
  
  /* ========================================
     技术价值承诺
     ======================================== */
  
  .intro-tech {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: var(--line-height-base);
    margin-bottom: var(--space-6);
  }
  
  /* ========================================
     社区灵魂
     ======================================== */
  
  .intro-soul {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: var(--line-height-base);
    margin-bottom: var(--space-8);
  }
  
  /* ========================================
     确认按钮
     ======================================== */
  
  .confirm-btn {
    /* 背景：星空蓝渐变 */
    background: var(--gradient-accent);
    
    /* 文字 */
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-inverse);
    
    /* 宽度和间距 */
    width: 100%;
    padding: var(--space-3) var(--space-6);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 去除默认样式 */
    border: none;
    
    /* 触摸目标优化 */
    min-height: 44px;
    
    cursor: pointer;
    
    /* 过渡 */
    transition: all var(--duration-fast) var(--ease-out);
    will-change: transform, opacity;
  }
  
  .confirm-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  
  /* ========================================
     响应式调整
     ======================================== */
  
  @media (min-width: 768px) {
    .intro-content {
      padding: var(--space-10) var(--space-8);
    }
    
    .intro-opening {
      font-size: var(--font-size-xl);
    }
  }
</style>