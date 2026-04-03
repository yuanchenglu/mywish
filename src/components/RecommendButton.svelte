/**
 * @description 推荐按钮组件 - 显示推荐计数和动画反馈
 * @version 1.0
 * @created 2026-04-03
 * @dependencies tokens.css (设计系统), RecommendAction.ts (推荐逻辑)
 * 
 * 功能特性：
 * - 显示推荐数（👍 + 计数）
 * - 点击触发推荐动画
 * - 禁用状态防止重复提交
 * - 推荐成功高亮反馈
 * - 响应式设计
 */

<script lang="ts">
  import { triggerRecommend } from '../lib/RecommendAction';
  
  /**
   * 组件 Props 类型定义
   */
  interface Props {
    /** 推荐数 */
    recommendCount: number;
    /** 推荐回调函数 */
    onRecommend: () => void;
    /** 是否禁用按钮 */
    disabled?: boolean;
  }
  
  // [CRITICAL] Svelte 5 runes syntax
  let { recommendCount, onRecommend, disabled = false }: Props = $props();
  
  // 按钮元素引用
  let buttonElement: HTMLButtonElement;
  
  /**
   * 处理推荐点击
   * 触发缩放动画 + 调用回调
   */
  function handleClick() {
    // [CRITICAL] 调用推荐动画触发器
    triggerRecommend(buttonElement, onRecommend);
  }
</script>

<button
  bind:this={buttonElement}
  class="recommend-btn"
  onclick={handleClick}
  {disabled}
  aria-label="推荐"
  type="button"
>
  👍 {recommendCount}
</button>

<style>
  /* ========================================
     推荐按钮样式 - 使用 Design Tokens
     ======================================== */
  
  .recommend-btn {
    /* [CRITICAL] 使用 tokens 字体 */
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    color: var(--color-text-secondary);
    
    /* 布局 */
    padding: var(--space-2) var(--space-3);
    
    /* 圆角 */
    border-radius: var(--radius-base);
    
    /* 边框和背景 */
    background: transparent;
    border: 1px solid var(--color-border-default);
    
    /* 过渡动画 - 使用 tokens */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 触摸目标优化 */
    min-height: 44px;
    min-width: 44px;
    cursor: pointer;
    
    /* GPU 加速提示 */
    will-change: transform;
  }
  
  .recommend-btn:hover {
    /* hover 效果 - 使用 tokens */
    background: var(--color-bg-card);
    color: var(--color-secondary-400); /* 星空蓝 */
    border-color: var(--color-border-light);
  }
  
  .recommend-btn:disabled {
    /* 禁用状态 */
    opacity: 0.6;
    cursor: not-allowed;
    
    /* 移除 hover 效果 */
    background: transparent;
    color: var(--color-text-muted);
  }
  
  /* ========================================
     推荐高亮状态 - 成功反馈
     ======================================== */
  
  .recommend-btn.recommend-highlight {
    /* [CRITICAL] 使用星空蓝配色 */
    color: var(--color-secondary-400);
    background: rgba(0, 180, 219, 0.15);
    
    /* 星光效果 */
    box-shadow: var(--shadow-glow);
    
    /* 边框高亮 */
    border-color: var(--color-secondary-400);
  }
  
  /* ========================================
     响应式设计 - Desktop
     ======================================== */
  
  @media (min-width: 768px) {
    .recommend-btn {
      /* 桌面端更大间距 */
      padding: var(--space-2) var(--space-4);
    }
  }
</style>