<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { 
    generateWishKey, 
    validateWishText, 
    countWishText, 
    validateCustomKey,
    prepareWishInput 
  } from '$lib/WishCreator';
  
  // [CRITICAL] Svelte 5 runes - 状态管理
  let wishText = $state('');
  let customKey = $state('');
  let generatedKey = $derived(customKey.trim() || generateWishKey());
  let charCount = $derived(countWishText(wishText));
  let maxChars = 100;
  
  // [CRITICAL] 验证状态 - 派生状态
  let textValidation = $derived(validateWishText(wishText));
  let keyValidation = $derived(validateCustomKey(customKey));
  let isValid = $derived(textValidation.valid && keyValidation.valid);
  
  // Toast 状态管理
  let showToast = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');
  
  // [CRITICAL] 提交状态
  let isSubmitting = $state(false);
  
  /**
   * 处理发布心愿
   * 验证 -> XSS防护 -> 准备数据（后续调用 API）
   */
  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    
    isSubmitting = true;
    
    try {
      // [CRITICAL] 准备心愿数据（验证 + XSS防护）
      const result = prepareWishInput(wishText, customKey);
      
      if (!result.success) {
        showToast = true;
        toastMessage = result.error || '发布失败';
        toastType = 'error';
        setTimeout(() => { showToast = false; }, 3000);
        return;
      }
      
      // [TODO] Task 13 - 调用 POST /api/wish API
      console.log('心愿数据:', result.data);
      
      // 模拟成功响应（Task 13 实现后替换）
      showToast = true;
      toastMessage = '心愿发布成功！小钥匙：' + result.data?.key;
      toastType = 'success';
      
      // [TODO] Task 14 - 跳转到心愿详情页
      // setTimeout(() => { goto(`/wish/${result.data?.key}`); }, 1500);
      
      // 3秒后隐藏 toast
      setTimeout(() => { showToast = false; }, 3000);
      
      // 清空输入（发布成功后）
      wishText = '';
      customKey = '';
      
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
  
  /**
   * 重新生成小钥匙
   */
  function regenerateKey() {
    customKey = ''; // 清空自定义，触发自动生成
  }
</script>

<svelte:head>
  <title>发布心愿 - 星辰大海 My Wish</title>
</svelte:head>

<main class="create-page">
  <form class="wish-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    
    <!-- 心愿输入区域 -->
    <section class="wish-input-section">
      <label for="wish-text" class="section-label">
        写下你的心愿
      </label>
      
      <textarea 
        id="wish-text"
        class="wish-textarea"
        bind:value={wishText}
        maxlength={maxChars}
        placeholder="愿家人平安健康，幸福美满..."
        aria-describedby="char-count"
        aria-invalid={!textValidation.valid}
      ></textarea>
      
      <!-- 字数统计 -->
      <div 
        id="char-count" 
        class="char-count"
        class:over-limit={charCount > maxChars}
      >
        已输入 {charCount}/{maxChars} 字
      </div>
      
      <!-- 验证错误提示 -->
      {#if !textValidation.valid && wishText.length > 0}
<div class="validation-error" role="alert">
           {textValidation.error}
         </div>
      {/if}
    </section>
    
    <!-- 小钥匙设置区域 -->
    <section class="wish-key-section">
<label for="wish-key" class="section-label">
         心愿小钥匙（可选）
       </label>
      
      <div class="key-input-group">
        <input 
          id="wish-key"
          type="text"
          class="key-input"
          bind:value={customKey}
          maxlength={6}
          placeholder="自定义6位小钥匙"
          aria-describedby="key-hint"
          aria-invalid={!keyValidation.valid}
        />
        
        <!-- 重新生成按钮 -->
        <button 
          type="button"
          class="regenerate-btn"
          onclick={regenerateKey}
          aria-label="重新生成小钥匙"
          title="重新生成小钥匙"
        >
<Icon name="refresh" size={20} />
         </button>
      </div>
      
      <!-- 小钥匙提示 -->
      <div id="key-hint" class="key-hint">
        当前小钥匙：<span class="key-preview">{generatedKey}</span>
      </div>
      
      <!-- 验证错误提示 -->
      {#if !keyValidation.valid && customKey.length > 0}
<div class="validation-error" role="alert">
           {keyValidation.error}
         </div>
      {/if}
    </section>
    
    <!-- 发布按钮 -->
    <button 
      type="submit"
      class="submit-btn"
      disabled={!isValid || isSubmitting}
      aria-busy={isSubmitting}
    >
      {#if isSubmitting}
        发布中...
{:else}
         <Icon name="sparkles" size={20} /> 发布心愿
       {/if}
    </button>
    
  </form>
  
  <!-- Toast 提示 -->
  {#if showToast}
    <div 
      class="toast" 
      class:toast-success={toastType === 'success'}
      class:toast-error={toastType === 'error'}
      role="alert" 
      aria-live="polite"
    >
      {toastMessage}
    </div>
  {/if}
</main>

<style>
  /* ========================================
     发布页面样式 - 使用 Design Tokens
     ======================================== */
  
  .create-page {
    /* [CRITICAL] 使用 tokens 渐变背景 */
    background: var(--gradient-bg);
    
    /* 响应式布局 */
    min-height: 100vh;
    padding: var(--space-4);
    
    /* Flexbox 垂直居中 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
  
  /* ========================================
     心愿表单样式
     ======================================== */
  
  .wish-form {
    /* 使用 tokens 渐变背景 */
    background: var(--gradient-card);
    
    /* 圆角和阴影 */
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
    
    /* 内边距使用 tokens */
    padding: var(--space-6);
    
    /* 响应式布局 */
    width: 100%;
    max-width: 600px;
    
    /* Flexbox 垂直布局 */
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    
    /* 边框 */
    border: 1px solid var(--color-border-light);
  }
  
  /* ========================================
     输入区域样式
     ======================================== */
  
  .wish-input-section,
  .wish-key-section {
    /* Flexbox 垂直布局 */
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .section-label {
    /* 使用 tokens 字体 */
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    
    /* 间距 */
    margin-bottom: var(--space-2);
  }
  
  /* ========================================
     心愿输入框样式
     ======================================== */
  
  .wish-textarea {
    /* 使用 tokens */
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: var(--line-height-base);
    
    /* 布局 */
    width: 100%;
    min-height: 120px;
    padding: var(--space-3);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-border-default);
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* resize */
    resize: vertical;
  }
  
  .wish-textarea:focus {
    /* focus 效果 */
    outline: none;
    border-color: var(--color-secondary-400);
    box-shadow: var(--shadow-glow);
  }
  
  .wish-textarea:invalid {
    /* invalid 效果 */
    border-color: var(--color-error);
  }
  
  /* ========================================
     字数统计样式
     ======================================== */
  
  .char-count {
    /* 使用 tokens */
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    
    /* 居右 */
    text-align: right;
  }
  
  .char-count.over-limit {
    /* 超出限制提示 */
    color: var(--color-error);
    font-weight: var(--font-weight-bold);
  }
  
  /* ========================================
     验证错误提示样式
     ======================================== */
  
  .validation-error {
    /* 使用 tokens */
    font-size: var(--font-size-sm);
    color: var(--color-error);
    
    /* 间距 */
    margin-top: var(--space-1);
  }
  
  /* ========================================
     小钥匙输入样式
     ======================================== */
  
  .key-input-group {
    /* Flexbox 水平布局 */
    display: flex;
    gap: var(--space-2);
  }
  
  .key-input {
    /* 使用 tokens */
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-secondary-400);
    
    /* 布局 */
    flex: 1;
    padding: var(--space-2) var(--space-3);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: rgba(0, 180, 219, 0.1);
    border: 1px solid var(--color-secondary-400);
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 触摸目标优化 */
    min-height: 44px;
  }
  
  .key-input:focus {
    /* focus 效果 */
    outline: none;
    background: rgba(0, 180, 219, 0.2);
    box-shadow: var(--shadow-glow);
  }
  
  .key-input:invalid {
    /* invalid 效果 */
    border-color: var(--color-error);
  }
  
  .regenerate-btn {
    /* 使用 tokens */
    font-size: var(--font-size-lg);
    
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
  
  .regenerate-btn:hover {
    /* hover 效果 */
    background: var(--color-bg-card);
    box-shadow: var(--shadow-glow);
  }
  
  /* ========================================
     小钥匙提示样式
     ======================================== */
  
  .key-hint {
    /* 使用 tokens */
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    
    /* 间距 */
    margin-top: var(--space-1);
  }
  
  .key-preview {
    /* 星空蓝配色 */
    color: var(--color-secondary-400);
    font-weight: var(--font-weight-bold);
  }
  
  /* ========================================
     发布按钮样式
     ======================================== */
  
  .submit-btn {
    /* 使用 tokens 渐变 */
    background: var(--gradient-accent);
    
    /* 字体 */
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-inverse);
    
    /* 布局 */
    padding: var(--space-3) var(--space-6);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框 */
    border: none;
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 触摸目标优化 */
    min-height: 44px;
    cursor: pointer;
    
    /* GPU 加速 */
    will-change: transform, opacity;
  }
  
  .submit-btn:not(:disabled):hover {
    /* hover 效果 */
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  
  .submit-btn:disabled {
    /* disabled 效果 */
    opacity: 0.5;
    cursor: not-allowed;
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
  }
  
  .toast-success {
    /* 成功样式 */
    border-color: var(--color-success);
  }
  
  .toast-error {
    /* 错误样式 */
    border-color: var(--color-error);
  }
  
  /* ========================================
     响应式设计 - Desktop
     ======================================== */
  
  @media (min-width: 768px) {
    .create-page {
      padding: var(--space-8);
      justify-content: center;
    }
    
    .wish-form {
      max-width: 600px;
      padding: var(--space-8);
    }
    
    .wish-textarea {
      min-height: 150px;
      font-size: var(--font-size-xl);
    }
    
    .section-label {
      font-size: var(--font-size-xl);
    }
  }
  
  @media (min-width: 1025px) {
    .wish-form {
      max-width: 800px;
      padding: var(--space-12);
    }
  }
</style>