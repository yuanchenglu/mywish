<script lang="ts">
  import WishCard from '../../../components/WishCard.svelte';
  import { page } from '$app/stores';
  import type { Wish } from '../../../../workers/lib/kv-schema';
  
  let key = $derived($page.params.key);
  let wish = $state<Wish | null>(null);
  let loading = $state(true);
  
  $effect(() => {
    if (key) {
      loadWish();
    }
  });
  
  async function loadWish() {
    loading = true;
    try {
      const res = await fetch(`/api/wish/${key}`);
      const json = await res.json();
      wish = json.success ? json.data : null;
    } catch (e) {
      console.error('加载失败', e);
    } finally {
      loading = false;
    }
  }
  
  async function handleLike() {
    if (!wish) return;
    await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishId: wish.id })
    });
  }
  
  async function handleRecommend() {
    if (!wish) return;
    await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wishId: wish.id })
    });
  }
  
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: '我的心愿',
        text: wish?.text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }
</script>

<svelte:head>
  <title>心愿详情 - 星辰大海</title>
  <meta name="description" content={wish?.text || '查看心愿详情'} />
</svelte:head>

<main>
  {#if loading}
    <p>加载中...</p>
  {:else if wish}
    <WishCard {wish} onLike={handleLike} onRecommend={handleRecommend} onShare={handleShare} />
  {:else}
    <p>心愿不存在</p>
  {/if}
</main>
