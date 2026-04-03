<script lang="ts">
  /**
   * @description 底部Tab导航组件 - 移动端主导航
   * @version 1.0
   * @created 2026-04-04
   * @design 底部固定，三Tab布局，拇指热区优化
   */
  
  import Icon from '../lib/components/Icon.svelte';
  
  // Tab类型定义
  export type TabType = 'like' | 'publish' | 'square';
  
  interface Props {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    onPublishClick: () => void;
  }
  
  let { activeTab, onTabChange, onPublishClick }: Props = $props();
  
  // Tab配置
  const tabs: { id: TabType; icon: 'flame' | 'sparkles' | 'grid'; label: string }[] = [
    { id: 'like', icon: 'flame' as const, label: '点亮心愿' },
    { id: 'publish', icon: 'sparkles' as const, label: '许个心愿' },
    { id: 'square', icon: 'grid' as const, label: '星空广场' }
  ];
  
  function handleTabClick(tabId: TabType) {
    if (tabId === 'publish') {
      // 发布心愿Tab触发Modal弹窗，不切换Tab
      onPublishClick();
    } else {
      onTabChange(tabId);
    }
  }
</script>

<nav class="bottom-nav" aria-label="主导航">
  {#each tabs as tab}
    <button 
      class="nav-tab"
      class:active={activeTab === tab.id}
      class:publish-tab={tab.id === 'publish'}
      onclick={() => handleTabClick(tab.id)}
      aria-current={activeTab === tab.id ? 'page' : undefined}
      aria-label={tab.label}
    >
      <span class="tab-icon" aria-hidden="true"><Icon name={tab.icon} size={28} /></span>
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  /* ========================================
     底部导航栏 - 固定布局
     ======================================== */
  
  .bottom-nav {
    /* 固定底部 */
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    
    /* 高度规范：56px (iOS标准) */
    height: 56px;
    
    /* 背景：深色卡片背景 */
    background: var(--color-bg-dark);
    
    /* 顶部边框 */
    border-top: 1px solid var(--color-border-default);
    
    /* Flexbox三等分布局 */
    display: flex;
    justify-content: space-around;
    align-items: center;
    
    /* 安全区padding (iOS Home Indicator) */
    padding-bottom: 8px;
    
    /* z-index层级 */
    z-index: 100;
    
    /* 阴影效果 */
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  }
  
  /* ========================================
     Tab按钮样式
     ======================================== */
  
  .nav-tab {
    /* Flexbox垂直布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    /* 触摸目标优化：最小44px */
    min-width: 44px;
    min-height: 44px;
    padding: 4px 12px;
    
    /* 去除按钮默认样式 */
    background: transparent;
    border: none;
    cursor: pointer;
    
    /* 文字颜色：中性灰 (Inactive状态) */
    color: var(--color-text-muted);
    
    /* 过渡动画 */
    transition: all var(--duration-fast) var(--ease-out);
    
    /* 圆角 */
    border-radius: var(--radius-base);
  }
  
  /* ========================================
     Active状态 - 主题色填充
     ======================================== */
  
  .nav-tab.active {
    color: var(--color-accent-gold);
  }
  
  .nav-tab.active .tab-icon {
    transform: scale(1.1);
  }
  
  .nav-tab.active .tab-label {
    font-weight: var(--font-weight-bold);
  }
  
  /* ========================================
     发布心愿Tab特殊样式
     ======================================== */
  
  .publish-tab {
    /* 发布按钮：金色强调色 */
    color: var(--color-accent-gold);
  }
  
  .publish-tab .tab-icon {
    /* 图标稍大 */
    font-size: 26px;
    transform: scale(1.15);
    
    /* 星光闪烁动画 */
    animation: star-glow 2s ease-in-out infinite;
  }
  
  .publish-tab:hover {
    /* hover效果：背景高亮 */
    background: rgba(255, 215, 0, 0.1);
  }
  
  /* ========================================
     图标和文字样式
     ======================================== */
  
  .tab-icon {
    font-size: 24px;
    margin-bottom: 2px;
    transition: transform var(--duration-fast) var(--ease-out);
  }
  
  .tab-label {
    font-size: 12px;
    font-weight: var(--font-weight-normal);
    line-height: 1.2;
  }
  
  /* ========================================
     Hover效果
     ======================================== */
  
  .nav-tab:hover:not(.publish-tab) {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-secondary);
  }
  
  /* ========================================
     响应式设计 - Desktop隐藏底部导航
     ======================================== */
  
  @media (min-width: 1025px) {
    .bottom-nav {
      /* 桌面端隐藏底部导航 */
      display: none;
    }
  }
</style>