<script lang="ts">
  /**
   * @description 心愿发布仪式动画 - "信纸折叠成纸飞机飞向星辰大海"
   * @version 1.0
   * @created 2026-04-05
   * @dependencies 
   *   - LikeAction.ts (星星创建逻辑)
   *   - tokens.css (动画类定义)
   *   - Icon.svelte (Sparkles 图标)
   * 
   * 功能特性：
   * - 四阶段动画：信纸折叠 → 纸飞机诞生 → 纸飞机飞行 → 星辰爆发
   * - 总时长：3-4 秒
   * - 降级方案：低端设备静态图片序列
   * - UX 防焦虑：跳过按钮 + 进度文案
   * - GPU 加速：CSS transform + will-change
   * - 复用现有动画系统
   */
  
  import { triggerLikeAnimation } from '../lib/LikeAction';
  import Icon from '../lib/components/Icon.svelte';
  
  /**
   * 组件 Props 类型定义
   */
  interface Props {
    /** 动画完成回调 */
    onComplete?: () => void;
    /** 跳过回调 */
    onSkip?: () => void;
    /** 容器元素（动画挂载点） */
    container: HTMLElement;
  }
  
  // [CRITICAL] Svelte 5 runes syntax
  let { onComplete, onSkip, container }: Props = $props();
  
  // ========================================
  // 动画状态管理
  // ========================================
  
  /** 当前动画阶段（1-4） */
  let currentPhase = $state(1);
  
  /** 动画是否正在运行 */
  let isAnimating = $state(false);
  
  /** 是否被跳过 */
  let isSkipped = $state(false);
  
  /** 进度文案 */
  let progressText = $state('心愿正在启程...');
  
  /** 是否显示跳过按钮 */
  let showSkipButton = $state(true);
  
  /** 是否需要降级（低端设备） */
  let needsDegraded = $state(false);
  
  // ========================================
  // 性能检测与降级逻辑
  // ========================================
  
  /**
   * 检测设备性能
   * 
   * @returns 是否需要降级
   */
  function detectPerformance(): boolean {
    // [CRITICAL] 检测 CPU 核心数
    const cpuCores = navigator.hardwareConcurrency || 2;
    
    // [CRITICAL] 低端设备：核心数 < 4
    if (cpuCores < 4) {
      console.log('[WishReleaseAnimation] 低端设备检测，启用降级方案');
      return true;
    }
    
    // [CRITICAL] 检测内存（如果可用）
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory < 4) {
      console.log('[WishReleaseAnimation] 低内存设备检测，启用降级方案');
      return true;
    }
    
    return false;
  }
  
  // ========================================
  // 星星创建逻辑（复用 LikeAction.ts）
  // ========================================
  
  /**
   * 创建单个星星元素（复用 LikeAction.ts 的 createStar）
   * 
   * @param parentContainer 容器元素
   * @param delayIndex 延迟索引（0-4）
   * @param animationType 动画类型（'rise' | 'fall'）
   * @returns 创建的星星元素
   */
  function createFlyingStar(
    parentContainer: HTMLElement, 
    delayIndex: number,
    animationType: 'rise' | 'fall' = 'rise'
  ): HTMLElement {
    const star = document.createElement('div');
    
    // [CRITICAL] 应用 tokens.css 动画类
    star.className = `star-${animationType} star-delay-${delayIndex + 1}`;
    
    // 随机水平位置
    star.style.left = `${Math.random() * 100}%`;
    
    // [CRITICAL] 星星样式（GPU 加速）
    star.style.position = 'absolute';
    star.style.top = '0';
    star.style.width = '20px';
    star.style.height = '20px';
    star.style.background = 'radial-gradient(circle, var(--color-accent-gold) 0%, transparent 70%)';
    star.style.borderRadius = '50%';
    star.style.pointerEvents = 'none';
    star.style.willChange = 'transform, opacity';
    star.style.zIndex = '1000';
    
    parentContainer.appendChild(star);
    
    return star;
  }
  
  // ========================================
  // 核心动画实现
  // ========================================
  
  /**
   * 触发完整动画流程
   * 
   * @returns Promise<void> - 动画完成
   * 
   * @example
   * ```typescript
   * // 在 PublishModal 中调用
   * const animation = new WishReleaseAnimation({ container: modalElement });
   * await animation.trigger();
   * ```
   */
  export async function trigger(): Promise<void> {
    // [CRITICAL] 防止重复触发
    if (isAnimating) {
      console.warn('[WishReleaseAnimation] 动画正在运行，忽略重复触发');
      return;
    }
    
    // 初始化状态
    isAnimating = true;
    isSkipped = false;
    currentPhase = 1;
    showSkipButton = true;
    
    // [CRITICAL] 检测设备性能
    needsDegraded = detectPerformance();
    
    // [CRITICAL] 3秒后自动隐藏跳过按钮
    setTimeout(() => {
      if (!isSkipped) {
        showSkipButton = false;
      }
    }, 3000);
    
    try {
      if (needsDegraded) {
        // [CRITICAL] 降级方案：静态图片序列
        await triggerDegradedAnimation();
      } else {
        // [CRITICAL] 完整动画流程
        await triggerFullAnimation();
      }
      
      // 动画完成回调
      if (!isSkipped && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('[WishReleaseAnimation] 动画执行失败:', error);
      
      // 失败时直接触发星星飘落作为兜底
      await triggerLikeAnimation(container, { count: 7, enableVoice: false });
      
      if (onComplete) {
        onComplete();
      }
    } finally {
      isAnimating = false;
    }
  }
  
  /**
   * 完整动画流程（四阶段）
   * 
   * 总时长：3.3 秒
   */
  async function triggerFullAnimation(): Promise<void> {
    // 阶段1：信纸折叠（0.8s）
    progressText = '心愿正在启程...';
    currentPhase = 1;
    await phase1LetterFold();
    
    if (isSkipped) return;
    
    // 阶段2：纸飞机诞生（0.5s）
    currentPhase = 2;
    await phase2PaperPlaneBirth();
    
    if (isSkipped) return;
    
    // 阶段3：纸飞机飞行（1.5s）
    progressText = '飞向星辰大海...';
    currentPhase = 3;
    await phase3PaperPlaneFly();
    
    if (isSkipped) return;
    
    // 阶段4：星辰爆发（0.5s）
    currentPhase = 4;
    await phase4StarExplosion();
  }
  
  /**
   * 阶段1：信纸折叠
   * 
   * 动画时长：0.8s
   * 效果：信纸做 2-3 次翻转，颜色渐变为金色
   */
  async function phase1LetterFold(): Promise<void> {
    return new Promise((resolve) => {
      // 创建信纸元素
      const letter = document.createElement('div');
      letter.className = 'wish-release-letter';
      
      // [CRITICAL] 应用 tokens.css 样式
      letter.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 140px;
        background: linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-primary-700) 100%);
        border: 2px solid var(--color-border-light);
        border-radius: var(--radius-base);
        box-shadow: var(--shadow-lg);
        will-change: transform, background;
        z-index: 1001;
        animation: letter-fold 0.8s var(--ease-in-out) forwards;
      `;
      
      container.appendChild(letter);
      
      // [CRITICAL] 0.8s 后清理
      setTimeout(() => {
        letter.remove();
        resolve();
      }, 800);
    });
  }
  
  /**
   * 阶段2：纸飞机诞生
   * 
   * 动画时长：0.5s
   * 效果：纸飞机图标从信纸中心"诞生"，触发金色闪烁
   */
  async function phase2PaperPlaneBirth(): Promise<void> {
    return new Promise((resolve) => {
      // 创建纸飞机容器
      const planeContainer = document.createElement('div');
      planeContainer.className = 'wish-release-plane';
      
      // [CRITICAL] 应用 tokens.css 样式
      planeContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle, var(--color-accent-gold) 0%, transparent 70%);
        border-radius: 50%;
        will-change: transform, opacity;
        z-index: 1002;
        animation: plane-birth 0.5s var(--ease-in-out) forwards;
      `;
      
      // 创建 Sparkles 图标（SVG）
      const sparkleIcon = document.createElement('div');
      sparkleIcon.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          <path d="M5 3v4"/>
          <path d="M19 17v4"/>
          <path d="M3 5h4"/>
          <path d="M17 19h4"/>
        </svg>
      `;
      sparkleIcon.style.cssText = `
        animation: star-glow 2s var(--ease-in-out) infinite;
      `;
      
      planeContainer.appendChild(sparkleIcon);
      container.appendChild(planeContainer);
      
      // [CRITICAL] 0.5s 后进入下一阶段（不立即清理）
      setTimeout(resolve, 500);
    });
  }
  
  /**
   * 阶段3：纸飞机飞行
   * 
   * 动画时长：1.5s
   * 效果：纸飞机沿曲线飞向右上角，星星粒子跟随
   */
  async function phase3PaperPlaneFly(): Promise<void> {
    return new Promise((resolve) => {
      // 获取或创建纸飞机元素（从阶段2继承）
      const plane = container.querySelector('.wish-release-plane') as HTMLElement;
      
      if (plane) {
        // [CRITICAL] 应用飞行动画
        plane.style.animation = 'plane-fly 1.5s var(--ease-in-out) forwards';
      }
      
      // [CRITICAL] 创建跟随星星（5-7颗）
      const flyingStars: HTMLElement[] = [];
      for (let i = 0; i < 7; i++) {
        const star = createFlyingStar(container, i % 5, 'rise');
        flyingStars.push(star);
        
        // [CRITICAL] 添加跟随动画
        star.style.animation = `star-follow-plane 1.5s var(--ease-in-out) forwards`;
        star.style.animationDelay = `${i * 0.15}s`;
      }
      
      // [CRITICAL] 1.5s 后清理
      setTimeout(() => {
        if (plane) {
          plane.remove();
        }
        flyingStars.forEach(star => star.remove());
        resolve();
      }, 1500);
    });
  }
  
  /**
   * 阶段4：星辰爆发
   * 
   * 动画时长：0.5s
   * 效果：星辰粒子爆发，触发星星飘落效果
   */
  async function phase4StarExplosion(): Promise<void> {
    return new Promise(async (resolve) => {
      // [CRITICAL] 创建爆发效果
      const explosion = document.createElement('div');
      explosion.className = 'wish-release-explosion';
      
      explosion.style.cssText = `
        position: absolute;
        top: 20%;
        right: 20%;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, var(--color-accent-gold) 0%, transparent 80%);
        border-radius: 50%;
        opacity: 0;
        will-change: transform, opacity;
        z-index: 1003;
        animation: star-explosion 0.5s var(--ease-in-out) forwards;
      `;
      
      container.appendChild(explosion);
      
      // [CRITICAL] 触发星星飘落效果（复用 LikeAction.ts）
      await triggerLikeAnimation(container, { 
        count: 10, 
        enableVoice: false 
      });
      
      // [CRITICAL] 0.5s 后清理
      setTimeout(() => {
        explosion.remove();
        resolve();
      }, 500);
    });
  }
  
  /**
   * 降级动画流程（静态图片序列）
   * 
   * 总时长：2.5s
   */
  async function triggerDegradedAnimation(): Promise<void> {
    return new Promise((resolve) => {
      console.log('[WishReleaseAnimation] 执行降级动画');
      
      progressText = '心愿正在启程...';
      
      // 创建简化动画容器
      const degradedContainer = document.createElement('div');
      degradedContainer.className = 'wish-release-degraded';
      
      degradedContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        will-change: transform, opacity;
        z-index: 1004;
        animation: degraded-fade-in 0.3s var(--ease-in-out) forwards;
      `;
      
      // 创建纸飞机图标
      const planeIcon = document.createElement('div');
      planeIcon.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
      `;
      planeIcon.style.cssText = `
        animation: degraded-fly 2s var(--ease-in-out) forwards;
      `;
      
      degradedContainer.appendChild(planeIcon);
      container.appendChild(degradedContainer);
      
      // [CRITICAL] 2s 后触发星星飘落
      setTimeout(async () => {
        progressText = '飞向星辰大海...';
        
        await triggerLikeAnimation(container, { 
          count: 5, 
          enableVoice: false 
        });
        
        degradedContainer.remove();
        resolve();
      }, 2500);
    });
  }
  
  /**
   * 跳过动画
   */
  function skipAnimation(): void {
    if (!isAnimating) return;
    
    isSkipped = true;
    showSkipButton = false;
    progressText = '心愿已发布';
    
    // [CRITICAL] 清理所有动画元素
    const animationElements = container.querySelectorAll('.wish-release-letter, .wish-release-plane, .wish-release-explosion, .wish-release-degraded');
    animationElements.forEach(el => el.remove());
    
    // [CRITICAL] 触发简化星星效果作为兜底
    triggerLikeAnimation(container, { count: 3, enableVoice: false });
    
    // 触发跳过回调
    if (onSkip) {
      onSkip();
    }
    
    // 触发完成回调
    if (onComplete) {
      onComplete();
    }
    
    isAnimating = false;
  }
</script>

<!-- 
  [CRITICAL] 动画覆盖层
  
  全屏覆盖，显示进度文案和跳过按钮
-->

{#if isAnimating}
  <div class="wish-release-overlay">
    <!-- 进度文案 -->
    <div class="wish-release-progress">
      <p class="progress-text">{progressText}</p>
      
      <!-- 阶段指示器 -->
      <div class="phase-indicator">
        {#each [1, 2, 3, 4] as phase}
          <span 
            class="phase-dot"
            class:active={phase <= currentPhase}
          ></span>
        {/each}
      </div>
    </div>
    
    <!-- 跳过按钮（3秒后自动消失） -->
    {#if showSkipButton}
      <button 
        class="skip-button"
        onclick={skipAnimation}
        aria-label="跳过动画"
      >
        ✕
      </button>
    {/if}
  </div>
{/if}

<style>
  /* ========================================
     动画覆盖层样式
     ======================================== */
  
  .wish-release-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: overlay-fade-in 0.3s var(--ease-in-out);
  }
  
  .wish-release-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }
  
  .progress-text {
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    animation: text-pulse 2s var(--ease-in-out) infinite;
  }
  
  .phase-indicator {
    display: flex;
    gap: var(--space-2);
  }
  
  .phase-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-border-default);
    transition: background 0.3s var(--ease-in-out);
  }
  
  .phase-dot.active {
    background: var(--color-accent-gold);
  }
  
  .skip-button {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: 32px;
    height: 32px;
    border: 1px solid var(--color-border-light);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: var(--color-text-muted);
    font-size: var(--font-size-base);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s var(--ease-in-out);
  }
  
  .skip-button:hover {
    background: rgba(0, 0, 0, 0.8);
    color: var(--color-text-primary);
    border-color: var(--color-accent-gold);
  }
  
  .skip-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent-gold);
  }
  
  /* ========================================
     关键帧动画定义
     ======================================== */
  
  /* 覆盖层淡入 */
  @keyframes overlay-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  /* 文案脉动 */
  @keyframes text-pulse {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }
  
  /* 阶段1：信纸折叠 */
  @keyframes letter-fold {
    0% {
      transform: translate(-50%, -50%) rotateX(0deg) rotateY(0deg) scale(1);
      background: linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-primary-700) 100%);
    }
    
    30% {
      transform: translate(-50%, -50%) rotateX(30deg) rotateY(15deg) scale(0.9);
    }
    
    50% {
      transform: translate(-50%, -50%) rotateX(20deg) rotateY(45deg) scale(0.7);
      background: linear-gradient(135deg, var(--color-secondary-400) 0%, var(--color-accent-gold) 100%);
    }
    
    80% {
      transform: translate(-50%, -50%) rotateX(10deg) rotateY(30deg) scale(0.6);
      background: radial-gradient(circle, var(--color-accent-gold) 0%, transparent 70%);
    }
    
    100% {
      transform: translate(-50%, -50%) rotateX(0deg) rotateY(0deg) scale(0);
      opacity: 0;
    }
  }
  
  /* 阶段2：纸飞机诞生 */
  @keyframes plane-birth {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    
    60% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.8;
    }
    
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }
  
  /* 阶段3：纸飞机飞行 */
  @keyframes plane-fly {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
      top: 50%;
      left: 50%;
    }
    
    30% {
      transform: translate(-60%, -40%) scale(1.1) rotate(15deg);
      opacity: 0.9;
      top: 40%;
      left: 40%;
    }
    
    50% {
      transform: translate(-70%, -30%) scale(1.2) rotate(30deg);
      opacity: 0.7;
      top: 30%;
      left: 30%;
    }
    
    70% {
      transform: translate(-80%, -20%) scale(0.9) rotate(45deg);
      opacity: 0.5;
      top: 20%;
      left: 20%;
    }
    
    100% {
      transform: translate(-90%, -10%) scale(0.6) rotate(60deg);
      opacity: 0.3;
      top: 10%;
      left: 10%;
    }
  }
  
  /* 星星跟随纸飞机 */
  @keyframes star-follow-plane {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.8;
    }
    
    30% {
      transform: translateY(-15px) translateX(-10px) scale(1.2);
      opacity: 1;
    }
    
    50% {
      transform: translateY(-30px) translateX(-20px) scale(1);
      opacity: 0.9;
    }
    
    70% {
      transform: translateY(-45px) translateX(-30px) scale(0.8);
      opacity: 0.6;
    }
    
    100% {
      transform: translateY(-60px) translateX(-40px) scale(0.5);
      opacity: 0;
    }
  }
  
  /* 阶段4：星辰爆发 */
  @keyframes star-explosion {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    
    50% {
      transform: scale(1.5);
      opacity: 0.8;
    }
    
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }
  
  /* ========================================
     降级动画关键帧
     ======================================== */
  
  @keyframes degraded-fade-in {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  @keyframes degraded-fly {
    0% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    
    50% {
      transform: scale(1.3) translateY(-20px);
      opacity: 0.8;
    }
    
    100% {
      transform: scale(0.8) translateY(-40px);
      opacity: 0;
    }
  }
</style>