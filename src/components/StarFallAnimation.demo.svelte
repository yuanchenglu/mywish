/**
 * @description StarFallAnimation 集成示例 - 展示如何在 WishCard 中使用点赞动画
 * @version 1.0
 * @created 2026-04-03
 * 
 * 集成方式：
 * 1. 在 WishCard 中导入 StarFallAnimation 组件
 * 2. 通过 bind:this 获取组件实例
 * 3. 在 onLike 回调中调用 animation.trigger()
 */

<script lang="ts">
  import StarFallAnimation from './StarFallAnimation.svelte';
  import type { Wish } from '../../workers/lib/kv-schema';
  
  // Mock 心愿数据
  const mockWish: Wish = {
    id: 'demo123',
    key: 'ABC123',
    text: '这是一个演示心愿',
    likes: 42,
    recommends: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hour_bucket: '2026-04-03T19'
  };
  
  // 容器元素引用
  let containerElement: HTMLElement;
  
  // StarFallAnimation 组件实例
  let animation: StarFallAnimation;
  
  /**
   * 点赞回调函数
   * 触发星星飘落动画和祝福语音
   */
  async function handleLike() {
    console.log('[Demo] 点赞触发');
    
    // [CRITICAL] 调用动画组件的 trigger() 方法
    if (animation) {
      await animation.trigger();
    }
    
    // TODO: Task 14 - 调用 POST /api/like/{wishId} 更新点赞计数
    console.log('[Demo] 点赞完成，计数 +1');
  }
  
  /**
   * 推荐回调函数
   */
  function handleRecommend() {
    console.log('[Demo] 推荐触发');
    // TODO: Task 14 - 调用 POST /api/recommend/{wishId}
  }
  
  /**
   * 分享回调函数
   */
  function handleShare() {
    console.log('[Demo] 分享触发');
    // TODO: 实现分享逻辑
  }
</script>

<div class="demo-container" bind:this={containerElement}>
  <!-- [CRITICAL] StarFallAnimation 组件绑定 -->
  <StarFallAnimation 
    bind:this={animation}
    container={containerElement}
    enableVoice={true}
    starCount={7}
  />
  
  <!-- 心愿卡片 -->
  <article class="wish-card">
    <p class="wish-text">{mockWish.text}</p>
    
    <button class="wish-key">
      🔑 {mockWish.key}
    </button>
    
    <div class="wish-actions">
      <!-- [CRITICAL] 点击触发动画 -->
      <button 
        class="action-btn like-btn" 
        onclick={handleLike}
      >
        ⭐ {mockWish.likes + 1}
      </button>
      
      <button 
        class="action-btn recommend-btn" 
        onclick={handleRecommend}
      >
        👍 {mockWish.recommends}
      </button>
      
      <button 
        class="action-btn share-btn" 
        onclick={handleShare}
      >
        📤 分享
      </button>
    </div>
    
    <time class="wish-time" datetime={mockWish.created_at}>
      刚刚
    </time>
  </article>
</div>

<style>
  /* 使用 tokens.css 的 Design Tokens */
  .demo-container {
    position: relative; /* [CRITICAL] 星星动画需要定位容器 */
    max-width: 600px;
    margin: var(--space-8) auto;
    padding: var(--space-4);
  }
  
  .wish-card {
    background: var(--gradient-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    border: 1px solid var(--color-border-light);
  }
  
  .wish-text {
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    text-align: center;
    margin: var(--space-2) 0;
  }
  
  .wish-key {
    font-size: var(--font-size-sm);
    color: var(--color-secondary-400);
    padding: var(--space-2) var(--space-3);
    margin: 0 auto;
    border-radius: var(--radius-base);
    background: rgba(0, 180, 219, 0.1);
    border: 1px solid var(--color-secondary-400);
  }
  
  .wish-actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-2);
  }
  
  .action-btn {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-base);
    background: transparent;
    border: 1px solid var(--color-border-default);
    min-height: 44px;
    min-width: 44px;
    cursor: pointer;
  }
  
  .like-btn:hover {
    color: var(--color-accent-gold);
  }
  
  .wish-time {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    text-align: right;
    margin-top: var(--space-2);
  }
</style>