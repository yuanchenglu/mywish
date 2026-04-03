/**
 * @description 心愿卡片组件 - 展示单个心愿内容
 * @version 1.0
 * @created 2026-04-03
 * @dependencies tokens.css (设计系统), kv-schema.ts (Wish 类型)
 * 
 * 功能特性：
 * - 显示心愿文本（最大100字）
 * - 显示心愿小钥匙（6位，可点击复制）
 * - 显示点赞数和推荐数
 * - 显示创建时间（相对时间格式）
 * - 响应式设计（移动端全宽，桌面端居中）
 * - 星空蓝/深空紫主题
 */

<script lang="ts">
  import type { Wish } from '../../workers/lib/kv-schema';
  
  /**
   * 组件 Props 类型定义
   */
  interface Props {
    /** 心愿数据对象 */
    wish: Wish;
    /** 点赞回调函数 */
    onLike?: () => void;
    /** 推荐回调函数 */
    onRecommend?: () => void;
    /** 分享回调函数 */
    onShare?: () => void;
  }
  
  // [CRITICAL] Svelte 5 runes syntax
  let { wish, onLike, onRecommend, onShare }: Props = $props();
  
  // Toast 状态管理
  let showToast = $state(false);
  let toastMessage = $state('');
  
  // [CRITICAL] 相对时间计算 - 派生状态
  let relativeTime = $derived(formatRelativeTime(wish.created_at));
  
  /**
   * 格式化相对时间
   * @param dateString ISO 8601 时间字符串
   * @returns 相对时间文本（如 "刚刚", "3分钟前", "1小时前"）
   */
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffSeconds < 60) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffHours < 48) return '昨天';
    if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}天前`;
    
    // [CRITICAL] 超过一周显示日期
    return date.toLocaleDateString('zh-CN');
  }
  
  /**
   * 复制小钥匙到剪贴板
   * 显示 toast 提示用户
   */
  async function copyKey() {
    try {
      await navigator.clipboard.writeText(wish.key);
      showToast = true;
      toastMessage = '小钥匙已复制';
      
      // 3秒后隐藏 toast
      setTimeout(() => {
        showToast = false;
      }, 3000);
    } catch (err) {
      // [CRITICAL] 复制失败处理
      console.error('复制失败:', err);
      showToast = true;
      toastMessage = '复制失败，请手动复制';
    }
  }
</script>

<article class="wish-card" aria-label="心愿卡片">
  <p class="wish-text">{wish.text}</p>
  
  <button 
    class="wish-key" 
    onclick={copyKey}
    aria-label="点击复制小钥匙"
    title="点击复制小钥匙"
  >
    🔑 {wish.key}
  </button>
  
  <div class="wish-actions">
    <button 
      class="action-btn like-btn" 
      onclick={onLike}
      aria-label="点赞"
    >
      ⭐ {wish.likes}
    </button>
    
    <button 
      class="action-btn recommend-btn" 
      onclick={onRecommend}
      aria-label="推荐"
    >
      👍 {wish.recommends}
    </button>
    
    <button 
      class="action-btn share-btn" 
      onclick={onShare}
      aria-label="分享"
    >
      📤 分享
    </button>
  </div>
  
  <time class="wish-time" datetime={wish.created_at}>
    {relativeTime}
  </time>
  
  {#if showToast}
    <div class="toast" role="alert" aria-live="polite">
      {toastMessage}
    </div>
  {/if}
</article>

<style>
  /* ========================================
     心愿卡片样式 - 使用 Design Tokens
     ======================================== */
  
  .wish-card {
    /* [CRITICAL] 使用 tokens.css 渐变背景 */
    background: var(--gradient-card);
    
    /* 圆角和阴影 */
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
    
    /* 内边距使用 tokens */
    padding: var(--space-4);
    
    /* 响应式布局 */
    width: 100%;
    max-width: 600px;
    margin: var(--space-6) auto;
    
    /* Flexbox 布局 */
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    
    /* 边框 */
    border: 1px solid var(--color-border-light);
    
    /* 过渡动画 */
    transition: box-shadow var(--duration-base) var(--ease-out);
  }
  
  .wish-card:hover {
    /* hover 增强阴影 */
    box-shadow: var(--shadow-lg);
  }
  
  /* ========================================
     心愿文本样式
     ======================================== */
  
  .wish-text {
    /* [CRITICAL] 使用 tokens 字体系统 */
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: var(--line-height-base);
    
    /* 文本居中 */
    text-align: center;
    margin: var(--space-2) 0;
    
    /* 防止溢出 */
    word-wrap: break-word;
  }
  
  /* ========================================
     小钥匙按钮样式
     ======================================== */
  
  .wish-key {
    /* 使用 tokens 间距和字体 */
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-secondary-400); /* 星空蓝 */
    
    /* 布局 */
    padding: var(--space-2) var(--space-3);
    margin: 0 auto;
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: rgba(0, 180, 219, 0.1);
    border: 1px solid var(--color-secondary-400);
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 触摸目标优化 */
    min-height: 44px;
    cursor: pointer;
  }
  
  .wish-key:hover {
    /* hover 效果 */
    background: rgba(0, 180, 219, 0.2);
    box-shadow: var(--shadow-glow);
  }
  
  /* ========================================
     操作按钮容器
     ======================================== */
  
  .wish-actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-2);
  }
  
  /* ========================================
     操作按钮样式
     ======================================== */
  
  .action-btn {
    /* 使用 tokens 字体 */
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
  
  .action-btn:hover {
    /* hover 效果 */
    background: var(--color-bg-card);
    color: var(--color-text-primary);
    border-color: var(--color-border-light);
  }
  
  .like-btn:hover {
    /* 点赞按钮特殊颜色 */
    color: var(--color-accent-gold);
  }
  
  .recommend-btn:hover {
    /* 推荐按钮特殊颜色 */
    color: var(--color-secondary-400);
  }
  
  /* ========================================
     时间戳样式
     ======================================== */
  
  .wish-time {
    /* 使用 tokens 字体 */
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    
    /* 居右 */
    text-align: right;
    margin-top: var(--space-2);
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
  
  /* ========================================
     响应式设计 - Desktop
     ======================================== */
  
  @media (min-width: 768px) {
    .wish-card {
      /* 桌面端居中 */
      max-width: 600px;
      padding: var(--space-6);
      margin: var(--space-8) auto;
    }
    
    .wish-text {
      font-size: var(--font-size-xl);
    }
    
    .wish-actions {
      gap: var(--space-6);
    }
  }
  
  @media (min-width: 1025px) {
    .wish-card {
      /* 大屏端优化 */
      max-width: 800px;
      padding: var(--space-8);
    }
  }
</style>