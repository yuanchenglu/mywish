<script lang="ts">
  /**
   * @description 发布心愿Modal弹窗组件
   * @version 1.0
   * @created 2026-04-04
   * @design 底部弹出Modal，轻量交互
   */
  
  import Icon from '$lib/components/Icon.svelte';
  import { 
    generateWishKey, 
    validateWishText, 
    countWishText, 
    validateCustomKey,
    prepareWishInput 
  } from '$lib/WishCreator';
  import WishReleaseAnimation from './WishReleaseAnimation.svelte';
  
  interface Props {
    onClose: () => void;
    onSuccess: () => void;
  }
  
  let { onClose, onSuccess }: Props = $props();
  
  // [CRITICAL] Svelte 5 runes - 状态管理
  let wishText = $state('');
  let customKey = $state('');
  let generatedKey = $derived(customKey.trim() || generateWishKey());
  let charCount = $derived(countWishText(wishText));
  let maxChars = 100;
  
  // 验证状态
  let textValidation = $derived(validateWishText(wishText));
  let keyValidation = $derived(validateCustomKey(customKey));
  let isValid = $derived(textValidation.valid && keyValidation.valid);
  
  // Toast状态
  let showToast = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');
  
  // 提交状态
  let isSubmitting = $state(false);
  let isCheckingEnergy = $state(false);
  
  // Modal动画状态
  let isVisible = $state(false);
  
  // [CRITICAL] 心愿发布动画状态
  let modalElement: HTMLElement; // DOM 元素引用，不需要 $state
  let wishReleaseAnimation: WishReleaseAnimation; // 组件实例引用，不需要 $state
  let showReleaseAnimation = $state(false);
  
  // 进入动画
  $effect(() => {
    // 组件挂载后触发进入动画
    setTimeout(() => { isVisible = true; }, 10);
  });
  
  // 处理发布
  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    
    isSubmitting = true;
    isCheckingEnergy = true;
    
    try {
      const result = prepareWishInput(wishText, customKey);
      
      if (!result.success) {
        showToast = true;
        toastMessage = result.error || '发布失败';
        toastType = 'error';
        setTimeout(() => { showToast = false; }, 3000);
        isCheckingEnergy = false;
        return;
      }
      
      // 调用API发布心愿（后端会执行正能量检测）
      const res = await fetch('/api/wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data)
      });
      
      isCheckingEnergy = false;
      
      const json = await res.json();
      
      if (json.success) {
        // [CRITICAL] 触发心愿发布动画（替换原有 Toast 逻辑）
        showReleaseAnimation = true;
        
        // 等待动画完成（3-4秒）
        // 动画完成后会自动触发 onComplete 回调
        // 清空输入
        wishText = '';
        customKey = '';
        
        // 动画完成后的回调处理（在 handleAnimationComplete 中）
      } else {
        showToast = true;
        toastMessage = json.message || json.error || '发布失败，请重试';
        toastType = 'error';
        setTimeout(() => { showToast = false; }, 5000);
      }
      
    } catch (err) {
      console.error('发布失败:', err);
      showToast = true;
      toastMessage = '发布失败，请重试';
      toastType = 'error';
      setTimeout(() => { showToast = false; }, 3000);
    } finally {
      isSubmitting = false;
    }
  }
  
  // [CRITICAL] 心愿发布动画完成回调
  function handleAnimationComplete() {
    showReleaseAnimation = false;
    
    // 显示成功 Toast
    showToast = true;
    toastMessage = '愿星辰大海守护你的心愿';
    toastType = 'success';
    
    // 关闭 Modal 并刷新列表
    setTimeout(() => {
      handleClose();
      onSuccess();
    }, 500);
  }
  
  // [CRITICAL] 心愿发布动画跳过回调
  function handleAnimationSkip() {
    showReleaseAnimation = false;
    
    // 显示简化 Toast
    showToast = true;
    toastMessage = '心愿已发布';
    toastType = 'success';
    
    // 关闭 Modal 并刷新列表
    setTimeout(() => {
      handleClose();
      onSuccess();
    }, 300);
  }
  
  // 关闭Modal（带动画）
  function handleClose() {
    isVisible = false;
    setTimeout(() => { onClose(); }, 300);
  }
  
  // 重新生成小钥匙
  function regenerateKey() {
    customKey = '';
  }
  
  // 背景点击关闭
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<!-- Modal覆盖层 -->
<div 
  class="modal-backdrop"
  class:visible={isVisible}
  bind:this={modalElement}
  onclick={handleBackdropClick}
  onkeydown={(e) => e.key === 'Escape' && handleClose()}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabindex="-1"
>
  <!-- Modal内容 -->
  <div class="modal-content" class:visible={isVisible}>
    <!-- 头部 -->
    <header class="modal-header">
      <h2 id="modal-title" class="modal-title"><Icon name="sparkles" size={24} /> 发布心愿</h2>
      <button 
        class="close-btn"
        onclick={handleClose}
        aria-label="关闭"
      >
        ✕
      </button>
    </header>
    
    <!-- 表单内容 -->
    <form class="modal-body" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      
      <!-- 心愿输入 -->
      <section class="input-section">
        <label for="wish-text" class="input-label"><Icon name="edit" size={20} /> 写下你的心愿</label>
        
        <textarea 
          id="wish-text"
          class="wish-textarea"
          bind:value={wishText}
          maxlength={maxChars}
          placeholder="愿家人平安健康，幸福美满..."
          aria-describedby="char-count"
          aria-invalid={!textValidation.valid}
        ></textarea>
        
        <div id="char-count" class="char-count" class:over-limit={charCount > maxChars}>
          已输入 {charCount}/{maxChars} 字
        </div>
        
        {#if !textValidation.valid && wishText.length > 0}
          <div class="validation-error" role="alert">
            ⚠️ {textValidation.error}
          </div>
        {/if}
      </section>
      
      <!-- 小钥匙设置 -->
      <section class="input-section">
        <label for="wish-key" class="input-label"><Icon name="key" size={20} /> 心愿小钥匙（可选）</label>
        
        <div class="key-input-group">
          <input 
            id="wish-key"
            type="text"
            class="key-input"
            bind:value={customKey}
            maxlength={6}
            placeholder="自定义6位小钥匙"
            aria-invalid={!keyValidation.valid}
          />
          
          <button type="button" class="regenerate-btn" onclick={regenerateKey}>
            <Icon name="refresh" size={20} />
          </button>
        </div>
        
        <div class="key-hint">
          当前小钥匙：<span class="key-preview">{generatedKey}</span>
        </div>
        
        {#if !keyValidation.valid && customKey.length > 0}
          <div class="validation-error" role="alert">
            ⚠️ {keyValidation.error}
          </div>
        {/if}
      </section>
      
      <!-- 发布按钮 -->
      <button 
        type="submit"
        class="submit-btn"
        disabled={!isValid || isSubmitting}
      >
        {#if isCheckingEnergy}
          <div class="energy-check-animation">
            <span class="star-icon">✨</span>
            <span class="star-icon">⭐</span>
            <span class="star-icon">🌟</span>
          </div>
          <span class="check-text">星星正在审核...</span>
        {:else if isSubmitting}
          发布中...
        {:else}
          <Icon name="sparkles" size={20} /> 发布心愿
        {/if}
      </button>
    </form>
    
    <!-- Toast提示 -->
    {#if showToast}
      <div class="toast" class:toast-success={toastType === 'success'} class:toast-error={toastType === 'error'}>
        {toastMessage}
      </div>
    {/if}
  </div>
  
  <!-- [CRITICAL] 心愿发布动画组件 -->
  {#if showReleaseAnimation && modalElement}
    <WishReleaseAnimation 
      bind:this={wishReleaseAnimation}
      container={modalElement}
      onComplete={handleAnimationComplete}
      onSkip={handleAnimationSkip}
    />
  {/if}
</div>

<style>
  /* ========================================
     Modal覆盖层
     ======================================== */
  
  .modal-backdrop {
    /* 全屏覆盖 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    /* 背景：半透明 */
    background: var(--color-bg-overlay);
    
    /* z-index */
    z-index: 200;
    
    /* Flexbox居中 */
    display: flex;
    align-items: flex-end;
    justify-content: center;
    
    /* 默认隐藏 */
    opacity: 0;
    transition: opacity 0.3s var(--ease-out);
  }
  
  .modal-backdrop.visible {
    opacity: 1;
  }
  
  /* ========================================
     Modal内容
     ======================================== */
  
  .modal-content {
    /* 底部弹出 */
    width: 100%;
    max-width: 600px;
    
    /* 背景 */
    background: var(--gradient-card);
    
    /* 圆角：只有顶部 */
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    
    /* 边框 */
    border: 1px solid var(--color-border-light);
    border-bottom: none;
    
    /* 动画：从底部滑入 */
    transform: translateY(100%);
    transition: transform 0.3s var(--ease-out);
    
    /* 阴影 */
    box-shadow: var(--shadow-lg);
    
    /* 最大高度 */
    max-height: 85vh;
    overflow-y: auto;
  }
  
  .modal-content.visible {
    transform: translateY(0);
  }
  
  /* ========================================
     Modal头部
     ======================================== */
  
  .modal-header {
    /* Flexbox布局 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    /* 间距 */
    padding: var(--space-4) var(--space-6);
    
    /* 底部边框 */
    border-bottom: 1px solid var(--color-border-default);
  }
  
  .modal-title {
    /* 使用 tokens */
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }
  
  .close-btn {
    /* 去除按钮默认样式 */
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
     Modal主体（表单）
     ======================================== */
  
  .modal-body {
    /* 间距 */
    padding: var(--space-6);
    
    /* Flexbox垂直布局 */
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  
  /* ========================================
     输入区域
     ======================================== */
  
  .input-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .input-label {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-1);
  }
  
  /* ========================================
     心愿输入框
     ======================================== */
  
  .wish-textarea {
    /* 使用 tokens */
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    line-height: var(--line-height-base);
    
    /* 布局 */
    width: 100%;
    min-height: 100px;
    padding: var(--space-3);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-border-default);
    
    /* 过渡 */
    transition: all var(--duration-fast) var(--ease-out);
    
    resize: vertical;
  }
  
  .wish-textarea:focus {
    outline: none;
    border-color: var(--color-secondary-400);
    box-shadow: var(--shadow-glow);
  }
  
  /* ========================================
     字数统计
     ======================================== */
  
  .char-count {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    text-align: right;
  }
  
  .char-count.over-limit {
    color: var(--color-error);
    font-weight: var(--font-weight-bold);
  }
  
  /* ========================================
     验证错误提示
     ======================================== */
  
  .validation-error {
    font-size: var(--font-size-sm);
    color: var(--color-error);
    margin-top: var(--space-1);
  }
  
  /* ========================================
     小钥匙输入
     ======================================== */
  
  .key-input-group {
    display: flex;
    gap: var(--space-2);
  }
  
  .key-input {
    font-size: var(--font-size-base);
    color: var(--color-secondary-400);
    
    flex: 1;
    padding: var(--space-2) var(--space-3);
    
    border-radius: var(--radius-base);
    
    background: rgba(0, 180, 219, 0.1);
    border: 1px solid var(--color-secondary-400);
    
    transition: all var(--duration-fast) var(--ease-out);
    
    min-height: 44px;
  }
  
  .key-input:focus {
    outline: none;
    background: rgba(0, 180, 219, 0.2);
    box-shadow: var(--shadow-glow);
  }
  
  .regenerate-btn {
    font-size: var(--font-size-lg);
    padding: var(--space-2) var(--space-3);
    
    border-radius: var(--radius-base);
    
    background: transparent;
    border: 1px solid var(--color-border-default);
    
    transition: all var(--duration-fast) var(--ease-out);
    
    min-height: 44px;
    min-width: 44px;
    cursor: pointer;
  }
  
  .regenerate-btn:hover {
    background: var(--color-bg-card);
    box-shadow: var(--shadow-glow);
  }
  
  /* ========================================
     小钥匙提示
     ======================================== */
  
  .key-hint {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-top: var(--space-1);
  }
  
  .key-preview {
    color: var(--color-secondary-400);
    font-weight: var(--font-weight-bold);
  }
  
  /* ========================================
     发布按钮
     ======================================== */
  
  .submit-btn {
    background: var(--gradient-accent);
    
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-inverse);
    
    padding: var(--space-3) var(--space-6);
    
    border-radius: var(--radius-base);
    
    border: none;
    
    transition: all var(--duration-fast) var(--ease-out);
    
    min-height: 44px;
    cursor: pointer;
    
    will-change: transform, opacity;
  }
  
  .submit-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  
  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* ========================================
     能量检测动画
     ======================================== */
  
  .energy-check-animation {
    display: inline-flex;
    gap: 4px;
    margin-right: 8px;
  }
  
  .star-icon {
    display: inline-block;
    animation: starPulse 1.5s ease-in-out infinite;
  }
  
  .star-icon:nth-child(1) {
    animation-delay: 0s;
  }
  
  .star-icon:nth-child(2) {
    animation-delay: 0.3s;
    transform: translateY(-2px);
  }
  
  .star-icon:nth-child(3) {
    animation-delay: 0.6s;
  }
  
  @keyframes starPulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
  
  .check-text {
    animation: textPulse 2s ease-in-out infinite;
  }
  
  @keyframes textPulse {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }
  
  /* ========================================
     Toast提示
     ======================================== */
  
  .toast {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    
    background: var(--color-bg-overlay);
    color: var(--color-text-primary);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-base);
    
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border-light);
    
    z-index: 300;
    
    min-width: 280px;
    max-width: 400px;
    width: auto;
    
    text-align: center;
    line-height: 1.5;
    
    animation: fadeIn 0.3s var(--ease-out);
  }
  
  .toast-success {
    border-color: var(--color-success);
  }
  
  .toast-error {
    border-color: var(--color-error);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  
  /* ========================================
     响应式设计
     ======================================== */
  
  @media (min-width: 768px) {
    .modal-content {
      /* 桌面端居中弹出 */
      margin: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
      
      max-height: 70vh;
    }
    
    .modal-backdrop {
      align-items: center;
    }
    
    .wish-textarea {
      min-height: 120px;
    }
  }
</style>