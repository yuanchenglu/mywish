<script lang="ts">
  import WishCard from '../components/WishCard.svelte';
  import BottomNav, { type TabType } from '../components/BottomNav.svelte';
  import PublishModal from '../components/PublishModal.svelte';
  import FirstTimeIntro from '../components/FirstTimeIntro.svelte';
  import { onMount } from 'svelte';
  import type { Wish, HourlyTopItem } from '../../workers/lib/kv-schema';
  
  interface WishWithRank extends Wish {
    realtime_likes?: number;
    realtime_recommends?: number;
    rank?: '状元' | '榜眼' | '探花';
  }
  
  let activeTab = $state<TabType>('like');
  let wishes = $state<Wish[]>([]);
  let top3Wishes = $state<HourlyTopItem[]>([]);
  let loading = $state(true);
  let showPublishModal = $state(false);
  let showIntro = $state(false);
  
  const INTRO_SEEN_KEY = 'seen_wish_intro';
  
  onMount(async () => {
    checkFirstTimeIntro();
    await loadTop3();
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
    } catch (e) {
      console.error('加载 Top3 失败', e);
    } finally {
      loading = false;
    }
  }
  
  async function loadWishes() {
    loading = true;
    try {
      const res = await fetch('/api/wishes?limit=10&sort=time');
      const json = await res.json();
      wishes = json.data.wishes || [];
    } catch (e) {
      console.error('加载心愿列表失败', e);
    } finally {
      loading = false;
    }
  }
  
  function handleTabChange(tab: TabType) {
    activeTab = tab;
    
    if (tab === 'like' && top3Wishes.length === 0) {
      loadTop3();
    } else if (tab === 'square' && wishes.length === 0) {
      loadWishes();
    }
  }
  
  function handlePublishClick() {
    showPublishModal = true;
  }
  
  function handlePublishSuccess() {
    showPublishModal = false;
    loadTop3();
    loadWishes();
  }
  
  async function handleLike(wish: Wish | HourlyTopItem) {
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishKey: wish.key })
    });
    loadTop3();
  }
  
  async function handleRecommend(wish: Wish | HourlyTopItem) {
    await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishKey: wish.key })
    });
    loadTop3();
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
  <title>瓦数Top3 - 星辰大海 My Wish</title>
  <meta name="description" content="为光明添砖加瓦，愿星辰大海守护你" />
</svelte:head>

<main class="page-content">
  {#if activeTab === 'like'}
    <section class="tab-content" aria-label="瓦数Top3">
      <header class="section-header">
        <h1 class="section-title">瓦数Top3</h1>
        <p class="section-desc">为光明添砖加瓦，点亮最闪耀的心愿</p>
      </header>
      
      <div class="top3-list">
        {#if loading}
          <div class="loading-state">加载中...</div>
        {:else if top3Wishes.length === 0}
          <div class="empty-state">
            <p>暂无心愿上榜</p>
            <p class="hint">快来许个心愿，让瓦数点亮它！</p>
          </div>
        {:else}
          {#each top3Wishes as wish}
            <WishCard 
              wish={wish as WishWithRank}
              variant="top3"
              onLike={() => handleLike(wish)}
              onRecommend={() => handleRecommend(wish)}
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
              onRecommend={() => handleRecommend(wish)}
              onShare={() => handleShare(wish)}
            />
          {/each}
        {/if}
      </div>
    </section>
  {/if}
</main>

<BottomNav 
  {activeTab}
  onTabChange={handleTabChange}
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

<style>
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