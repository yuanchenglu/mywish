<script lang="ts">
  import WishCard from '../../../components/WishCard.svelte';
  import { page } from '$app/stores';
  import type { Wish } from '../../../../workers/lib/kv-schema';
  import { isWechatBrowser, copyWishWithLink } from '../../../lib/ShareAction';
  
  let key = $derived($page.params.key);
  let wish = $state<Wish | null>(null);
  let loading = $state(true);
  let showToast = $state(false);
  let toastMessage = $state('');
  
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
  
  async function handleShare() {
    if (!wish) return;
    
    // [CRITICAL] 微信环境：复制心愿内容+链接
    if (isWechatBrowser()) {
      const result = await copyWishWithLink(wish.text, wish.key);
      showToast = true;
      toastMessage = '此心愿已复制，可直接打开与好友的对话进行分享';
      setTimeout(() => showToast = false, 3000);
      return;
    }
    
    // [CRITICAL] 浏览器环境：保持原有逻辑
    if (navigator.share) {
      navigator.share({
        title: '我的心愿',
        text: wish.text,
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
    <WishCard {wish} onLike={handleLike} onShare={handleShare} />
  {:else}
    <p>心愿不存在</p>
  {/if}
  
  {#if showToast}
    <div class="toast" role="alert">{toastMessage}</div>
  {/if}
</main>

<style>
  .toast {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>
