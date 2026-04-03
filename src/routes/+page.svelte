<script lang="ts">
  /**
   * @description 主页面 - 心愿广场/全民点赞双Tab视图
   * @version 2.1
   * @created 2026-04-04
   * @refactor 底部Tab导航重构, 添加首次引导浮窗
   */
  
  import WishCard from '../components/WishCard.svelte';
  import BottomNav, { type TabType } from '../components/BottomNav.svelte';
  import PublishModal from '../components/PublishModal.svelte';
  import FirstTimeIntro from '../components/FirstTimeIntro.svelte';
  import { onMount } from 'svelte';
  import type { Wish } from '../../workers/lib/kv-schema';
  
  // [CRITICAL] Svelte 5 runes - 状态管理
  let activeTab = $state<TabType>('square');
  let wishes = $state<Wish[]>([]);
  let topWishes = $state<Wish[]>([]);
  let loading = $state(true);
  let showPublishModal = $state(false);
  let showIntro = $state(false);
  
  // localStorage key for first-time intro
  const INTRO_SEEN_KEY = 'seen_wish_intro';
  
  onMount(async () => {
    // 检查是否需要显示首次引导
    checkFirstTimeIntro();
    
    await loadWishes();
    await loadTopWishes();
  });
  
  /**
   * 检查是否需要显示首次引导浮窗
   */
  function checkFirstTimeIntro() {
    try {
      const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);
      if (!hasSeenIntro) {
        showIntro = true;
      }
    } catch {
      // localStorage 不可用时（隐私模式），默认显示
      showIntro = true;
    }
  }
  
  /**
   * 关闭首次引导浮窗，记录状态
   */
  function handleIntroClose() {
    showIntro = false;
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {
      // localStorage 不可用时静默失败
    }
  }
  
  // 加载心愿广场列表（按时间排序）
  async function loadWishes() {
    loading = true;
    try {
      const res = await fetch('/api/wishes?limit=10&sort=time');
      const json = await res.json();
      wishes = json.data.wishes || [];
    } catch (e) {
      console.error('加载失败', e);
    } finally {
      loading = false;
    }
  }
  
  // 加载全民点赞列表（按点赞数排序）
  async function loadTopWishes() {
    try {
      const res = await fetch('/api/wishes?limit=10&sort=likes');
      const json = await res.json();
      topWishes = json.data.wishes || [];
    } catch (e) {
      console.error('加载热门心愿失败', e);
    }
  }
  
  // Tab切换处理
  function handleTabChange(tab: TabType) {
    activeTab = tab;
    
    // 切换到对应Tab时刷新数据
    if (tab === 'square' && wishes.length === 0) {
      loadWishes();
    } else if (tab === 'like' && topWishes.length === 0) {
      loadTopWishes();
    }
  }
  
  // 发布心愿Modal打开
  function handlePublishClick() {
    showPublishModal = true;
  }
  
  // 发布成功后刷新列表
  function handlePublishSuccess() {
    showPublishModal = false;
    loadWishes();
    loadTopWishes();
  }
  
  async function handleLike(wish: Wish) {
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishId: wish.id })
    });
    loadTopWishes(); // 点赞后刷新热门列表
  }
  
  async function handleRecommend(wish: Wish) {
    await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishId: wish.id })
    });
  }
  
  function handleShare(wish: Wish) {
    const url = `${window.location.origin}/wish/${wish.key}`;
    if (navigator.share) {
      navigator.share({ title: '心愿', text: wish.text, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }
</script>

<svelte:head>
  <title>心愿广场 - 星辰大海 My Wish</title>
  <meta name="description" content="发布心愿，传递祝福，愿星辰大海守护你" />
</svelte:head>

<main class="page-content">
  <!-- 心愿广场 Tab -->
  {#if activeTab === 'square'}
    <section class="tab-content" aria-label="心愿广场">
      <header class="section-header">
        <h1 class="section-title">漫步星空</h1>
        <p class="section-desc">查看所有心愿，传递祝福</p>
      </header>
      
      <div class="wishes-list">
        {#if loading}
          <div class="loading-state">加载中...</div>
        {:else if wishes.length === 0}
          <div class="empty-state">暂无心愿，快来发布第一个吧！</div>
        {:else}
          {#each wishes as wish}
            <WishCard 
              {wish}
              onLike={() => handleLike(wish)}
              onRecommend={() => handleRecommend(wish)}
              onShare={() => handleShare(wish)}
            />
          {/each}
        {/if}
      </div>
    </section>
  {:else if activeTab === 'like'}
    <!-- 全民点赞 Tab -->
    <section class="tab-content" aria-label="全民点赞">
      <header class="section-header">
        <h1 class="section-title">热门心愿</h1>
        <p class="section-desc">为心愿送上祝福，传递温暖</p>
      </header>
      
      <div class="wishes-list">
        {#if loading}
          <div class="loading-state">加载中...</div>
        {:else if topWishes.length === 0}
          <div class="empty-state">暂无热门心愿</div>
        {:else}
          {#each topWishes as wish}
            <WishCard 
              {wish}
              onLike={() => handleLike(wish)}
              onRecommend={() => handleRecommend(wish)}
              onShare={() => handleShare(wish)}
            />
          {/each}
        {/if}
      </div>
    </section>
  {/if}
</main>

<!-- 底部Tab导航 -->
<BottomNav 
  {activeTab}
  onTabChange={handleTabChange}
  onPublishClick={handlePublishClick}
/>

<!-- 发布心愿Modal -->
{#if showPublishModal}
  <PublishModal 
    onClose={() => showPublishModal = false}
    onSuccess={handlePublishSuccess}
  />
{/if}

<!-- 首次引导浮窗 -->
{#if showIntro}
  <FirstTimeIntro onClose={handleIntroClose} />
{/if}

<style>
  /* ========================================
     页面内容布局
     ======================================== */
  
  .page-content {
    /* 响应式布局 */
    width: 100%;
    min-height: calc(100vh - 64px); /* 减去底部导航高度 */
    
    /* 内边距 */
    padding: var(--space-4);
    
    /* Flexbox垂直布局 */
    display: flex;
    flex-direction: column;
  }
  
  /* ========================================
     Tab内容区域
     ======================================== */
  
  .tab-content {
    /* 动画效果 */
    animation: fadeIn 0.3s ease-out;
  }
  
  /* ========================================
     章节头部
     ======================================== */
  
  .section-header {
    /* 居中对齐 */
    text-align: center;
    
    /* 间距 */
    margin-bottom: var(--space-6);
    padding: var(--space-4) 0;
  }
  
  .section-title {
    /* 使用 tokens */
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    
    /* 间距 */
    margin-bottom: var(--space-2);
  }
  
  .section-desc {
    /* 使用 tokens */
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
  
  /* ========================================
     心愿列表
     ======================================== */
  
  .wishes-list {
    /* Flexbox垂直布局 */
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    
    /* 最大宽度居中 */
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
  
  /* ========================================
     加载和空状态
     ======================================== */
  
  .loading-state,
  .empty-state {
    /* 使用 tokens */
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    
    /* 居中对齐 */
    text-align: center;
    padding: var(--space-8);
    
    /* Flexbox居中 */
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  .empty-state {
    /* 空状态样式 */
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);
  }
  
  /* ========================================
     动画定义
     ======================================== */
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* ========================================
     响应式设计 - Desktop
     ======================================== */
  
  @media (min-width: 768px) {
    .page-content {
      padding: var(--space-6);
    }
    
    .section-title {
      font-size: var(--font-size-2xl);
    }
    
    .wishes-list {
      max-width: 720px;
    }
  }
  
  @media (min-width: 1025px) {
    .page-content {
      /* 桌面端不需要减去底部导航高度 */
      min-height: 100vh;
      
      /* 左侧预留空间：侧边导航 */
      margin-left: 280px;
    }
    
    .wishes-list {
      max-width: 800px;
    }
  }
</style>