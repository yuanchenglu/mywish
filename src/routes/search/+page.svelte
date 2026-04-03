<script lang="ts">
  import WishCard from '../../components/WishCard.svelte';
  import { page } from '$app/stores';
  import type { Wish } from '../../../workers/lib/kv-schema';
  
  let query = $state('');
  let wishes = $state<Wish[]>([]);
  let loading = $state(false);
  let searched = $state(false);
  
  async function handleSearch() {
    if (!query.trim()) return;
    
    loading = true;
    searched = true;
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      wishes = json.data.wishes || [];
    } catch (e) {
      console.error('搜索失败', e);
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
  <title>搜索心愿 - 星辰大海</title>
</svelte:head>

<main>
  <div class="search-box">
    <input 
      type="text" 
      bind:value={query}
      placeholder="输入心愿关键词..."
      onkeydown={(e) => e.key === 'Enter' && handleSearch()}
    />
    <button onclick={handleSearch}>搜索</button>
  </div>
  
  <div class="results">
    {#if loading}
      <p>搜索中...</p>
    {:else if searched && wishes.length === 0}
      <p>未找到相关心愿</p>
    {:else}
      {#each wishes as wish}
        <WishCard 
          {wish}
          onLike={() => handleLike(wish)}
          onShare={() => handleShare(wish)}
        />
      {/each}
    {/if}
  </div>
</main>

<style>
  .search-box {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
  }
  
  input {
    flex: 1;
    padding: var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-base);
    background: var(--color-bg-card);
    color: var(--color-text-primary);
  }
  
  button {
    padding: var(--space-3) var(--space-6);
    background: var(--color-secondary-400);
    color: white;
    border: none;
    border-radius: var(--radius-base);
    cursor: pointer;
  }
</style>
