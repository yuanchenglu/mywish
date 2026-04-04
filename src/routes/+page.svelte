<script lang="ts">
  import WishCard from '../components/WishCard.svelte';
  import BottomNav, { type TabType } from '../components/BottomNav.svelte';
  import PublishModal from '../components/PublishModal.svelte';
  import FirstTimeIntro from '../components/FirstTimeIntro.svelte';
  import { onMount } from 'svelte';
  import type { Wish, HourlyTopItem } from '../../workers/lib/kv-schema';
  
  interface WishWithRank extends Omit<HourlyTopItem, 'rank'> {
    likes?: number;
    rank?: '状元' | '榜眼' | '探花';
  }
  
  interface WishWithRealtime extends Wish {
    realtime_likes?: number;
    realtime_likes_increment?: number;
  }
  
  let activeTab = $state<TabType>('square');
  let wishes = $state<Wish[]>([]);
  let top3Wishes = $state<HourlyTopItem[]>([]);
  let top3Hour = $state<string>(''); // 排行榜统计时间
  let loading = $state(true);
  let loadingMore = $state(false);
  let hasMore = $state(true);
  let currentPage = $state(1);
  let totalWishes = $state(0);
  let showPublishModal = $state(false);
  let showIntro = $state(false);
  
  // 下拉刷新状态
  let isRefreshing = $state(false);
  let pullDistance = $state(0);
  let isPulling = $state(false);
  let touchStartY = 0;
  const PULL_THRESHOLD = 100; // 下拉触发刷新的阈值
  const REFRESH_TOP_THRESHOLD = 20; // 允许下拉刷新的顶部范围
  
  // 继续浏览按钮状态
  let showContinueBtn = $state(false);
  let maxScrollY = 0; // 用户浏览过的最远位置
  let lastScrollY = 0; // 上一次滚动位置（用于判断方向）
  const TOP_THRESHOLD = 50; // 顶部判断阈值（scrollY <= 50 视为在顶部）
  const SCROLL_DIRECTION_THRESHOLD = 10; // 滚动方向判断阈值
  
  const INTRO_SEEN_KEY = 'seen_wish_intro';
  const PAGE_SIZE = 20;
  const PRELOAD_THRESHOLD = 10;
  
  /**
   * 格式化排行榜时间段显示
   * 将 API 返回的 hour 字段（如 "2026-04-04T22"）转换为用户友好的时间范围
   * @param hour - API 返回的时间桶字符串
   * @returns 格式化后的时间段文本，如 "北京时间 2026年4月4日 22:00至23:00"
   */
  function formatHourRange(hour: string): string {
    if (!hour) return '';
    
    // 解析时间桶格式: YYYY-MM-DDTHH
    const match = hour.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/);
    if (!match) return '';
    
    const [, year, month, day, hourStr] = match;
    const hourNum = parseInt(hourStr, 10);
    const nextHour = hourNum + 1;
    
    // 格式化为北京时间显示
    return `北京时间 ${year}年${parseInt(month)}月${parseInt(day)}日 ${hourStr}:00至${nextHour.toString().padStart(2, '0')}:00`;
  }
  
  onMount(() => {
    checkFirstTimeIntro();
    loadWishes(); // 默认加载星愿广场数据
    window.addEventListener('scroll', handleScroll);
    
    // 下拉刷新触摸事件
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  });
  
  function checkFirstTimeIntro() {
    try {
      const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);
      if (!hasSeenIntro) {
        showIntro = true;
      }
    } catch {
      showIntro = true;
    }
  }
  
  function handleIntroClose() {
    showIntro = false;
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {}
  }
  
  async function loadTop3() {
    loading = true;
    try {
      const res = await fetch('/api/top3');
      const json = await res.json();
      top3Wishes = json.data.top3 || [];
      top3Hour = json.data.hour || ''; // 提取统计时间
    } catch (e) {
      console.error('加载 Top3 失败', e);
    } finally {
      loading = false;
    }
  }
  
  async function loadWishes() {
    loading = true;
    currentPage = 1;
    hasMore = true;
    try {
      const res = await fetch(`/api/wishes?page=${currentPage}&limit=${PAGE_SIZE}`);
      const json = await res.json();
      wishes = json.data.wishes || [];
      totalWishes = json.data.total || 0;
      hasMore = wishes.length < totalWishes;
    } catch (e) {
      console.error('加载心愿列表失败', e);
    } finally {
      loading = false;
    }
  }
  
  async function loadMoreWishes() {
    if (loadingMore || !hasMore) return;
    
    loadingMore = true;
    try {
      const nextPage = currentPage + 1;
      const res = await fetch(`/api/wishes?page=${nextPage}&limit=${PAGE_SIZE}`);
      const json = await res.json();
      const newWishes = json.data.wishes || [];
      
      if (newWishes.length > 0) {
        wishes = [...wishes, ...newWishes];
        currentPage = nextPage;
        hasMore = wishes.length < totalWishes;
      } else {
        hasMore = false;
      }
    } catch (e) {
      console.error('加载更多失败', e);
    } finally {
      loadingMore = false;
    }
  }
  
  function handleScroll() {
    const currentScrollY = window.scrollY;
    
    // 继续浏览按钮逻辑
    updateContinueButton(currentScrollY);
    
    // 更新最远浏览位置（只在广场页面）
    if (activeTab === 'square' && currentScrollY > maxScrollY) {
      maxScrollY = currentScrollY;
    }
    
    // 加载更多逻辑
    if (activeTab !== 'square' || loading || loadingMore || !hasMore) return;
    
    const scrollPosition = window.innerHeight + currentScrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = documentHeight * 0.3;
    
    if (scrollPosition >= documentHeight - threshold) {
      loadMoreWishes();
    }
  }
  
  function updateContinueButton(currentScrollY: number) {
    // 只在广场页面显示
    if (activeTab !== 'square') {
      showContinueBtn = false;
      return;
    }
    
    // 判断滚动方向
    const scrollDiff = currentScrollY - lastScrollY;
    
    // 在顶部 + 之前浏览过更远处 = 显示按钮
    if (currentScrollY <= TOP_THRESHOLD && maxScrollY > TOP_THRESHOLD) {
      showContinueBtn = true;
    }
    // 向上滚动（scrollDiff < 0）+ 当前位置小于最远位置 = 显示按钮
    else if (scrollDiff < -SCROLL_DIRECTION_THRESHOLD && currentScrollY < maxScrollY - TOP_THRESHOLD) {
      showContinueBtn = true;
    }
    // 向下滚动（scrollDiff > 0）+ 当前位置接近最远位置 = 隐藏按钮
    else if (scrollDiff > SCROLL_DIRECTION_THRESHOLD && currentScrollY >= maxScrollY - TOP_THRESHOLD) {
      showContinueBtn = false;
    }
    
    lastScrollY = currentScrollY;
  }
  
  function scrollToContinuePosition() {
    window.scrollTo({
      top: maxScrollY,
      behavior: 'smooth'
    });
  }
  
  // 下拉刷新触摸事件处理
  function handleTouchStart(e: TouchEvent) {
    // 只在顶部且当前是广场或Top3页面时启用下拉刷新
    if (window.scrollY > REFRESH_TOP_THRESHOLD || loading || isRefreshing) return;
    
    touchStartY = e.touches[0].clientY;
    isPulling = true;
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (!isPulling || loading || isRefreshing) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;
    
    // 只响应向下拉（diff > 0）
    if (diff > 0 && window.scrollY <= REFRESH_TOP_THRESHOLD) {
      pullDistance = Math.min(diff, PULL_THRESHOLD * 1.5);
      
      // 阻止浏览器默认行为（如页面滚动）
      if (pullDistance > 10) {
        e.preventDefault();
      }
    }
  }
  
  function handleTouchEnd() {
    if (!isPulling) return;
    
    isPulling = false;
    
    // 下拉超过阈值，触发刷新
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      triggerRefresh();
    }
    
    pullDistance = 0;
  }
  
  // 触发刷新
  async function triggerRefresh() {
    if (isRefreshing) return;
    
    isRefreshing = true;
    
    try {
      if (activeTab === 'square') {
        await loadWishes();
      } else if (activeTab === 'like') {
        await loadTop3();
      }
    } finally {
      // 延迟结束刷新状态，让用户看到动画
      setTimeout(() => {
        isRefreshing = false;
      }, 300);
    }
  }
  
  function handleTabChange(tab: TabType, forceRefresh = false) {
    // 点击当前Tab时触发刷新
    if (tab === activeTab && forceRefresh) {
      triggerRefresh();
      return;
    }
    
    activeTab = tab;
    
    if (tab === 'like' && (top3Wishes.length === 0 || forceRefresh)) {
      loadTop3();
    } else if (tab === 'square' && (wishes.length === 0 || forceRefresh)) {
      loadWishes();
    }
  }
  
  function handlePublishClick() {
    showPublishModal = true;
  }
  
  function handlePublishSuccess() {
    showPublishModal = false;
    currentPage = 1;
    hasMore = true;
    loadTop3();
    loadWishes();
  }
  
  async function handleLike(wish: Wish | HourlyTopItem) {
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishKey: wish.key })
      });
      const json = await res.json();
      
      if (json.success) {
        // ✅ 只更新本地状态，不重新加载整个列表
        if (activeTab === 'like' && 'likes_increment' in wish) {
          // Top3 列表 - 只更新 likes_increment（虽然 API 没返回，但可以先不动）
          const index = top3Wishes.findIndex(w => w.key === wish.key);
          if (index !== -1) {
            top3Wishes[index] = { 
              ...top3Wishes[index]
            };
          }
        } else if (activeTab === 'square') {
          // 广场列表 - 更新 likes
          const index = wishes.findIndex(w => w.key === wish.key);
          if (index !== -1) {
            wishes[index] = { 
              ...wishes[index], 
              likes: json.data.likes
            };
          }
        }
      }
    } catch (e) {
      console.error('点赞失败', e);
    }
  }
  
  function handleShare(wish: Wish | HourlyTopItem) {
    const url = `${window.location.origin}/wish/${wish.key}`;
    if (navigator.share) {
      navigator.share({ title: '心愿', text: wish.text, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }
</script>

<svelte:head>
  <title>星愿广场 - 星辰大海 My Wish</title>
  <meta name="description" content="漫步星空，查看所有心愿，传递祝福" />
</svelte:head>

<!-- 下拉刷新指示器 -->
{#if isPulling || isRefreshing}
  <div class="pull-refresh-indicator" style="transform: translateX(-50%) translateY({Math.max(-80, pullDistance - 80)}px);">
    <div class="refresh-stars">
      {#if isRefreshing}
        <span class="star spinning">✨</span>
        <span class="star spinning delay-1">🌟</span>
        <span class="star spinning delay-2">⭐</span>
      {:else if pullDistance >= PULL_THRESHOLD}
        <span class="star ready">✨</span>
        <span class="star ready">🌟</span>
        <span class="star ready">⭐</span>
      {:else}
        <span class="star pulling">✨</span>
        <span class="star pulling">🌟</span>
        <span class="star pulling">⭐</span>
      {/if}
    </div>
    <p class="refresh-text">
      {#if isRefreshing}
        正在为你收集星光...
      {:else if pullDistance >= PULL_THRESHOLD}
        松开刷新 ✨
      {:else}
        下拉刷新
      {/if}
    </p>
  </div>
{/if}

<main class="page-content">
  {#if activeTab === 'like'}
    <section class="tab-content" aria-label="星+Top3">
      <header class="section-header">
        <h1 class="section-title">星+Top3</h1>
        {#if top3Hour}
          <p class="time-range">{formatHourRange(top3Hour)}</p>
        {/if}
        <p class="section-desc">每小时星星增量排行，见证心愿闪耀时刻</p>
      </header>
      
      <div class="top3-list">
        {#if loading}
          <div class="loading-state">加载中...</div>
        {:else if top3Wishes.length === 0}
          <div class="empty-state">
            <p>暂无心愿上榜</p>
            <p class="hint">快来许个心愿，让星星点亮它！</p>
          </div>
        {:else}
          {#each top3Wishes as wish}
            <WishCard 
              wish={wish as WishWithRank}
              variant="top3"
              onLike={() => handleLike(wish)}
              onShare={() => handleShare(wish)}
            />
          {/each}
        {/if}
      </div>
    </section>
  {:else if activeTab === 'square'}
    <section class="tab-content" aria-label="许愿广场">
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
              onShare={() => handleShare(wish)}
            />
          {/each}
          {#if loadingMore}
            <div class="loading-more">加载更多...</div>
          {/if}
          {#if !hasMore && wishes.length > 0}
            <div class="no-more">— 已经到底了 —</div>
          {/if}
        {/if}
      </div>
    </section>
  {/if}
</main>

<BottomNav 
  {activeTab}
  onTabChange={(tab) => handleTabChange(tab, false)}
  onTabRefresh={(tab) => handleTabChange(tab, true)}
  onPublishClick={handlePublishClick}
/>

{#if showPublishModal}
  <PublishModal 
    onClose={() => showPublishModal = false}
    onSuccess={handlePublishSuccess}
  />
{/if}

{#if showIntro}
  <FirstTimeIntro onClose={handleIntroClose} />
{/if}

<!-- 继续浏览按钮 -->
{#if showContinueBtn}
  <button 
    class="continue-reading-btn" 
    onclick={scrollToContinuePosition}
    aria-label="继续浏览"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  </button>
{/if}

<style>
  /* 下拉刷新指示器 */
  .pull-refresh-indicator {
    position: fixed;
    top: 80px;
    left: 50%;
    z-index: 99;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4);
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-glow);
    transition: transform 0.15s var(--ease-out);
  }
  
  .refresh-stars {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }
  
  .star {
    font-size: 24px;
    display: inline-block;
  }
  
  .star.pulling {
    opacity: 0.5;
    transform: translateY(0);
  }
  
  .star.ready {
    opacity: 1;
    animation: star-glow 0.5s ease-in-out infinite;
  }
  
  .star.spinning {
    animation: spin-and-glow 1s ease-in-out infinite;
  }
  
  .star.delay-1 {
    animation-delay: 0.2s;
  }
  
  .star.delay-2 {
    animation-delay: 0.4s;
  }
  
  .refresh-text {
    font-size: var(--font-size-sm);
    color: var(--color-accent-gold);
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }
  
  @keyframes spin-and-glow {
    0% {
      transform: rotate(0deg) scale(1);
      opacity: 0.7;
    }
    50% {
      transform: rotate(180deg) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: rotate(360deg) scale(1);
      opacity: 0.7;
    }
  }
  
  /* 继续浏览按钮 */
  .continue-reading-btn {
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border-accent);
    box-shadow: var(--shadow-glow);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 99;
    transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
  }
  
  .continue-reading-btn svg {
    width: 28px;
    height: 28px;
    color: var(--color-accent-gold);
  }
  
  .continue-reading-btn:active {
    transform: scale(0.95);
  }
  
  .page-content {
    width: 100%;
    min-height: calc(100vh - 64px);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
  }
  
  .tab-content {
    animation: fadeIn 0.3s ease-out;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: var(--space-6);
    padding: var(--space-4) 0;
  }
  
  .section-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  .section-desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
  
  .time-range {
    font-size: var(--font-size-base);
    color: var(--color-accent-gold);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--space-2);
    letter-spacing: 0.5px;
  }
  
  .top3-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
  }
  
  .wishes-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
  
  .loading-state,
  .empty-state {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    text-align: center;
    padding: var(--space-8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  .empty-state {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);
  }
  
  .empty-state .hint {
    font-size: var(--font-size-sm);
    margin-top: var(--space-2);
  }
  
  .loading-more,
  .no-more {
    text-align: center;
    padding: var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
  
  .loading-more {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (min-width: 768px) {
    .page-content {
      padding: var(--space-6);
    }
    
    .section-title {
      font-size: var(--font-size-2xl);
    }
    
    .top3-list {
      max-width: 550px;
    }
    
    .wishes-list {
      max-width: 720px;
    }
  }
  
  @media (min-width: 1025px) {
    .page-content {
      min-height: 100vh;
      margin-left: 280px;
    }
    
    .top3-list {
      max-width: 600px;
    }
    
    .wishes-list {
      max-width: 800px;
    }
  }
</style>