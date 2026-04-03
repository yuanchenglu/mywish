<script lang="ts">
  import type { Wish } from '../../workers/lib/kv-schema';
  import Icon from '../lib/components/Icon.svelte';
  import { triggerLikeAnimation } from '../lib/LikeAction';
  import { triggerRecommend } from '../lib/RecommendAction';
  
  interface WishWithRealtime extends Wish {
    realtime_likes?: number;
    realtime_recommends?: number;
  }
  
  interface Props {
    wish: WishWithRealtime;
    onLike?: () => void;
    onRecommend?: () => void;
    onShare?: () => void;
  }
  
  let { wish, onLike, onRecommend, onShare }: Props = $props();
  
  let showToast = $state(false);
  let toastMessage = $state('');
  let currentLikes = $state(wish.realtime_likes || wish.likes);
  let currentRecommends = $state(wish.realtime_recommends || wish.recommends);
  let relativeTime = $derived(formatRelativeTime(wish.created_at));
  
  // [CRITICAL] DOM 引用用于触发动画
  let cardElement: HTMLElement | undefined;
  let recommendButton: HTMLButtonElement | undefined;
  
  // 数字跳动动画类名
  let likesAnimating = $state(false);
  let recommendsAnimating = $state(false);
  
  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
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
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishKey: wish.key })
      });
      const json = await res.json();
      
      if (json.success) {
        currentLikes = json.data.likes;
        
        // [CRITICAL] 触发数字跳动动画
        likesAnimating = true;
        setTimeout(() => likesAnimating = false, 500);
        
        // [CRITICAL] 触发星星飘落动画 + 卡片发光
        if (cardElement) {
          triggerLikeAnimation(cardElement);
          cardElement.classList.add('card-glow');
          const el = cardElement;
          setTimeout(() => el.classList.remove('card-glow'), 1000);
        }
        
        // [CRITICAL] Toast 文案升级
        showToast = true;
        toastMessage = '愿星辰大海守护你';
        setTimeout(() => showToast = false, 2000);
        onLike?.();
      }
    } catch (e) {
      console.error('点赞失败', e);
    }
  }
  
  async function handleRecommendClick() {
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishKey: wish.key })
      });
      const json = await res.json();
      
      if (json.success) {
        currentRecommends = json.data.recommends;
        
        // [CRITICAL] 触发数字跳动动画
        recommendsAnimating = true;
        setTimeout(() => recommendsAnimating = false, 500);
        
        // [CRITICAL] 触发推荐按钮缩放动画
        if (recommendButton) {
          triggerRecommend(recommendButton);
        }
        
        // [CRITICAL] Toast 文案升级
        showToast = true;
        toastMessage = '为光明添砖加瓦';
        setTimeout(() => showToast = false, 2000);
        onRecommend?.();
      }
    } catch (e) {
      console.error('推荐失败', e);
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
      await navigator.clipboard.writeText(wish.key);
      showToast = true;
      toastMessage = '心愿小钥匙已保存';
      setTimeout(() => showToast = false, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }
</script>

<article class="wish-card" bind:this={cardElement}>
  <!-- 心愿文本 - 核心内容 -->
  <p class="wish-text">{wish.text}</p>
  
  <!-- 操作按钮 -->
  <div class="wish-actions">
    <button class="action-btn like-btn" onclick={handleLikeClick}>
      <Icon name="heart" size={16} class="btn-icon" />
      <span class="count {likesAnimating ? 'count-bounce' : ''}">{currentLikes}</span>
    </button>
    
    <button class="action-btn recommend-btn" bind:this={recommendButton} onclick={handleRecommendClick}>
      <Icon name="star" size={16} class="btn-icon" />
      <span class="count {recommendsAnimating ? 'count-bounce' : ''}">{currentRecommends}</span>
    </button>
    
    <button class="action-btn share-btn" onclick={handleShareClick}>
      <Icon name="share" size={16} class="btn-icon" />
      <span>分享</span>
    </button>
  </div>
  
  <!-- 底部信息栏：左下角密钥，右下角时间 -->
  <div class="wish-footer">
    <button class="wish-key" onclick={copyKey} title="点击复制密钥">
      <Icon name="key" size={12} class="key-icon" />
      {wish.key}
    </button>
    <time class="wish-time" datetime={wish.created_at}>
      {relativeTime}
    </time>
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
  
  /* 心愿文本 - 核心内容 */
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
  
  /* 操作按钮 */
  .wish-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .action-btn {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
    padding: 10px 18px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.2s;
    min-width: 75px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .btn-icon {
    flex-shrink: 0;
  }
  
  .count {
    font-weight: 500;
  }
  
  /* [CRITICAL] 数字跳动动画 */
  .count-bounce {
    animation: countBounce 0.5s ease-out;
  }
  
  @keyframes countBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  /* [CRITICAL] 卡片发光效果 */
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
    background: rgba(255, 100, 100, 0.35);
    border-color: rgba(255, 100, 100, 0.5);
  }
  
  .recommend-btn:hover {
    background: rgba(255, 200, 50, 0.35);
    border-color: rgba(255, 200, 50, 0.5);
  }
  
  .share-btn:hover {
    background: rgba(100, 200, 150, 0.35);
    border-color: rgba(100, 200, 150, 0.5);
  }
  
  /* 底部信息栏 */
  .wish-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  /* 密钥 - 左下角 */
  .wish-key {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    background: transparent;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .wish-key:hover {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .key-icon {
    opacity: 0.6;
  }
  
  /* 时间 - 右下角 */
  .wish-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
  }
  
  /* Toast */
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
      gap: 16px;
    }
  }
</style>