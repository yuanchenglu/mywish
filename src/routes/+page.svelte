<script lang="ts">
  import WishCard from '../components/WishCard.svelte';
  import { onMount } from 'svelte';
  import type { Wish } from '../../workers/lib/kv-schema';
  
  let activeTab = $state<'top' | 'square'>('square');
  let wishes = $state<Wish[]>([]);
  let loading = $state(true);
  
  onMount(async () => {
    await loadWishes();
  });
  
  async function loadWishes() {
    loading = true;
    try {
      const res = await fetch('/api/wishes?limit=10');
      const json = await res.json();
      wishes = json.data.wishes || [];
    } catch (e) {
      console.error('加载失败', e);
    } finally {
      loading = false;
    }
  }
  
  async function handleLike(wish: Wish) {
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishId: wish.id })
    });
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

<main>
  <!-- Tab 切换 -->
  <div class="tabs">
    <button 
      class:active={activeTab === 'top'}
      onclick={() => activeTab = 'top'}
    >
      全民点赞
    </button>
    <button 
      class:active={activeTab === 'square'}
      onclick={() => activeTab = 'square'}
    >
      心愿广场
    </button>
  </div>
  
  <!-- 心愿列表 -->
  <div class="wishes">
    {#if loading}
      <p>加载中...</p>
    {:else if wishes.length === 0}
      <p>暂无心愿</p>
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
  
  <!-- 发布按钮 -->
  <a href="/create" class="create-btn">
    发布心愿
  </a>
</main>

<style>
  .tabs {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }
  
  .tabs button {
    flex: 1;
    padding: var(--space-3);
    border: 1px solid var(--color-border-default);
    background: transparent;
    color: var(--color-text-secondary);
    border-radius: var(--radius-base);
    cursor: pointer;
  }
  
  .tabs button.active {
    background: var(--color-primary-700);
    color: white;
    border-color: var(--color-primary-700);
  }
  
  .wishes {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .create-btn {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    padding: var(--space-3) var(--space-6);
    background: var(--color-secondary-400);
    color: white;
    border-radius: var(--radius-full);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
  }
</style>
