/**
 * @description 星星飘落动画组件 - 纯逻辑组件，无 DOM 元素
 * @version 1.0
 * @created 2026-04-03
 * @dependencies LikeAction.ts, BlessingVoice.ts
 * 
 * 功能特性：
 * - 导出 trigger() 函数供外部调用
 * - 可选祝福语音开关
 * - 集成 WishCard 的 onLike 回调
 * - Svelte 5 runes syntax
 */

<script lang="ts">
  import { triggerLikeAnimation } from '../lib/LikeAction';
  import { BlessingVoice } from '../lib/audio/BlessingVoice';
  
  /**
   * 组件 Props 类型定义
   */
  interface Props {
    /** 动画容器元素（动画挂载点） */
    container: HTMLElement;
    /** 是否播放祝福语音（默认 true，用户可在 localStorage 设置） */
    enableVoice?: boolean;
    /** 星星数量（5-10，默认 7） */
    starCount?: number;
  }
  
  // [CRITICAL] Svelte 5 runes syntax
  let { container, enableVoice = true, starCount = 7 }: Props = $props();
  
  /**
   * 触发点赞动画和祝福语音
   * 
   * @returns Promise<void> - 动画和语音完成
   * 
   * @example
   * ```typescript
   * // 在 WishCard 中调用
   * const animation = new StarFallAnimation({ container: cardElement });
   * animation.trigger();
   * ```
   */
  export async function trigger(): Promise<void> {
    // [CRITICAL] 检查用户语音偏好（localStorage）
    const userVoicePreference = BlessingVoice.isEnabled();
    
    // 合成最终语音开关
    const finalEnableVoice = enableVoice && userVoicePreference;
    
    // [CRITICAL] 触发星星飘落动画
    await triggerLikeAnimation(container, {
      count: starCount,
      enableVoice: finalEnableVoice
    });
  }
  
  /**
   * 仅触发星星飘落动画（无语音）
   * 
   * @returns Promise<void> - 动画完成
   */
  export async function triggerStarsOnly(): Promise<void> {
    await triggerLikeAnimation(container, {
      count: starCount,
      enableVoice: false
    });
  }
  
  /**
   * 仅播放祝福语音（无动画）
   * 
   * @returns Promise<void> - 语音完成
   */
  export async function triggerVoiceOnly(): Promise<void> {
    // 检查用户语音偏好
    const userVoicePreference = BlessingVoice.isEnabled();
    
    if (enableVoice && userVoicePreference) {
      await BlessingVoice.play();
    }
  }
</script>

<!-- 
  [CRITICAL] 纯逻辑组件，无 DOM 元素
  
  使用方式：
  ```svelte
  <script>
    import StarFallAnimation from './StarFallAnimation.svelte';
    
    let containerElement: HTMLElement;
    let animation: StarFallAnimation;
    
    function handleLike() {
      animation.trigger();
    }
  </script>
  
  <div bind:this={containerElement}>
    <StarFallAnimation 
      bind:this={animation}
      container={containerElement}
      enableVoice={true}
    />
    
    <button onclick={handleLike}>点赞</button>
  </div>
  ```
-->