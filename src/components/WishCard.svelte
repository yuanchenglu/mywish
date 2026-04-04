<script lang="ts">
  import type { Wish, HourlyTopItem } from '../../workers/lib/kv-schema';
  import Icon from '../lib/components/Icon.svelte';
  import { triggerLikeAnimation } from '../lib/LikeAction';
  
  interface WishWithRealtime extends Partial<Wish>, Partial<HourlyTopItem> {
    realtime_likes?: number;
    realtime_likes_increment?: number;
    likes_increment?: number;
    rank?: '状元' | '榜眼' | '探花';
  }
  
  interface Props {
    wish: WishWithRealtime;
    variant?: 'default' | 'top3';
    onLike?: () => void;
    onShare?: () => void;
  }
  
  let { wish, variant = 'default', onLike, onShare }: Props = $props();
  
  let showToast = $state(false);
  let toastMessage = $state('');
  let currentLikes = $state(wish.realtime_likes || wish.likes || 0);
  let likesIncrement = $state(wish.realtime_likes_increment || wish.likes_increment || 0);
  let relativeTime = $derived(formatRelativeTime(wish.created_at || ''));
  
  // Top3 模式显示总星数（currentLikes），普通模式也显示总星数
  let displayLikes = $derived(currentLikes);
  
  let isLiking = $state(false);
  let cardElement: HTMLElement | undefined;
  let likesAnimating = $state(false);
  
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    
    // ✅ 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('无效日期:', dateString);
      return '未知时间';
    }
    
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
    
    return date.toLocaleDateString('zh-CN');
  }
  
  async function handleLikeClick() {
    if (isLiking) return;
    isLiking = true;
    
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishKey: wish.key })
      });
      const json = await res.json();
      
      if (json.success) {
        currentLikes = json.data.likes;
        // API 没返回 hour_likes，所以手动 +1 作为本地显示
        likesIncrement = likesIncrement + 1;
        
        // ✅ 动画播放完整，不触发父组件更新
        likesAnimating = true;
        setTimeout(() => likesAnimating = false, 500);
        
        if (cardElement) {
          triggerLikeAnimation(cardElement);
          cardElement.classList.add('card-glow');
          const el = cardElement;
          setTimeout(() => el.classList.remove('card-glow'), 1000);
        }
        
        showToast = true;
        toastMessage = '愿星辰大海守护你';
        setTimeout(() => showToast = false, 2000);
        // ❌ 不调用 onLike?.()，避免触发父组件重新加载
      }
    } catch (e) {
      console.error('点赞失败', e);
    } finally {
      isLiking = false;
    }
  }
  
  async function handleShareClick() {
    const url = `${window.location.origin}/wish/${wish.key}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: '心愿', text: wish.text, url });
        showToast = true;
        toastMessage = '让心愿飞向更远方';
        setTimeout(() => showToast = false, 2000);
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast = true;
      toastMessage = '让心愿飞向更远方';
      setTimeout(() => showToast = false, 2000);
    }
    onShare?.();
  }
  
  async function copyKey() {
    try {
      await navigator.clipboard.writeText(wish.key || '');
      showToast = true;
      toastMessage = '心愿小钥匙已保存';
      setTimeout(() => showToast = false, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }
</script>

<article class="wish-card {variant === 'top3' ? 'top3-card' : ''}" bind:this={cardElement}>
  <div class="wish-header">
    <button class="wish-key" onclick={copyKey} title="点击复制密钥">
      <Icon name="key" size={12} class="key-icon" />
      {wish.key}
    </button>
    <span class="wish-time">{relativeTime}</span>
  </div>
  
  {#if wish.rank}
    <div class="rank-badge {wish.rank === '状元' ? 'badge-gold' : wish.rank === '榜眼' ? 'badge-silver' : 'badge-bronze'}">
      {#if wish.rank === '状元'}
        🥇 状元
      {:else if wish.rank === '榜眼'}
        🥈 榜眼
      {:else}
        🥉 探花
      {/if}
      <span class="increment-badge">星+ ({likesIncrement})</span>
    </div>
  {/if}
  
  <p class="wish-text">{wish.text}</p>
  
  <div class="wish-actions">
    <button class="action-btn like-btn" onclick={handleLikeClick} disabled={isLiking}>
      <Icon name="sparkles" size={16} class="btn-icon" />
      <span class="count {likesAnimating ? 'count-bounce' : ''}">{displayLikes}</span>
    </button>
    
    <button class="action-btn share-btn" onclick={handleShareClick}>
      <Icon name="share" size={16} class="btn-icon" />
      <span>分享</span>
    </button>
  </div>
  
  {#if showToast}
    <div class="toast" role="alert">{toastMessage}</div>
  {/if}
</article>

<style>
  .wish-card {
    background: linear-gradient(135deg, rgba(30, 60, 114, 0.95), rgba(42, 82, 152, 0.9));
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    padding: 20px;
    width: 100%;
    max-width: 600px;
    margin: 12px auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .wish-text {
    font-size: 18px;
    font-weight: 500;
    color: #fff;
    line-height: 1.7;
    text-align: center;
    margin: 0 0 16px;
    word-wrap: break-word;
    min-height: 50px;
  }
  
  .wish-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .action-btn {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
    padding: 10px 20px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.2s;
    min-width: 80px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn-icon {
    flex-shrink: 0;
  }
  
  .count {
    font-weight: 500;
  }
  
  .count-bounce {
    animation: countBounce 0.5s ease-out;
  }
  
  @keyframes countBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  .card-glow {
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(255, 215, 0, 0.3),
      0 0 60px rgba(255, 215, 0, 0.15);
    border-color: rgba(255, 215, 0, 0.3);
  }
  
  .action-btn:hover {
    background: rgba(255, 255, 255, 0.22);
    transform: scale(1.05);
  }
  
  .like-btn:hover {
    background: rgba(255, 215, 0, 0.35);
    border-color: rgba(255, 215, 0, 0.5);
  }
  
  .share-btn:hover {
    background: rgba(100, 200, 150, 0.35);
    border-color: rgba(100, 200, 150, 0.5);
  }
  
  .wish-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .wish-key {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    background: transparent;
    border: none;
    padding: 6px 12px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .wish-key:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .key-icon {
    opacity: 0.7;
  }
  
  .wish-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
  
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
  
  @media (min-width: 768px) {
    .wish-card {
      padding: 28px;
      margin: 16px auto;
    }
    
    .wish-text {
      font-size: 20px;
      margin-bottom: 20px;
    }
    
    .wish-actions {
      gap: 20px;
    }
  }
  
  .top3-card {
    padding: 28px 24px;
    margin: 16px auto;
    max-width: 500px;
  }
  
  .top3-card .wish-text {
    font-size: 20px;
    min-height: 60px;
  }
  
  .top3-card .wish-actions {
    gap: 20px;
  }
  
  .top3-card .action-btn {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  .rank-badge {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    padding: 8px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
    animation: badgeShine 2s ease-in-out infinite;
  }
  
  .badge-gold {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 193, 7, 0.2));
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
  
  .badge-silver {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(169, 169, 169, 0.2));
    color: #c0c0c0;
    border: 1px solid rgba(192, 192, 192, 0.5);
    box-shadow: 0 0 15px rgba(192, 192, 192, 0.2);
  }
  
  .badge-bronze {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.3), rgba(184, 115, 51, 0.2));
    color: #cd7f32;
    border: 1px solid rgba(205, 127, 50, 0.5);
    box-shadow: 0 0 15px rgba(205, 127, 50, 0.2);
  }
  
  @keyframes badgeShine {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
  
  .increment-badge {
    font-size: 14px;
    font-weight: 500;
    margin-left: 12px;
    opacity: 0.9;
  }
</style>