/**
 * @description 点赞动作逻辑 - 星星飘落动画触发器
 * @version 1.0
 * @created 2026-04-03
 * @dependencies tokens.css (star-fall 动画定义)
 * 
 * 功能特性：
 * - 创建 5-10 个星星元素同时飘落
 * - 使用 tokens.css 的 star-fall 动画类
 * - 随机位置和延迟，营造自然飘落效果
 * - GPU 加速（CSS transform）
 * - 自动清理动画元素（3秒后移除）
 */

import { playBlessingVoice } from './audio/BlessingVoice';

/**
 * 星星配置
 */
interface StarConfig {
  /** 星星数量（5-10） */
  count: number;
  /** 动画持续时间（毫秒） */
  duration: number;
  /** 是否播放祝福语音 */
  enableVoice: boolean;
}

/**
 * 默认星星配置
 */
const DEFAULT_STAR_CONFIG: StarConfig = {
  count: 7, // 5-10 个星星
  duration: 3000, // 3秒
  enableVoice: true
};

/**
 * 创建单个星星元素
 * 
 * @param container 容器元素
 * @param delayIndex 延迟索引（0-4，对应 star-delay-1/2/3/4/5）
 * @returns 创建的星星元素
 */
function createStar(container: HTMLElement, delayIndex: number): HTMLElement {
  // 创建星星 div
  const star = document.createElement('div');
  
  // [CRITICAL] 应用 tokens.css 动画类
  // star-fall: 基础动画
  // star-delay-{n}: 延迟辅助类
  star.className = `star-fall star-delay-${delayIndex + 1}`;
  
  // 随机水平位置（0% - 100%）
  star.style.left = `${Math.random() * 100}%`;
  
  // [CRITICAL] 星星样式（使用 GPU 加速）
  star.style.position = 'absolute';
  star.style.top = '0';
  star.style.width = '20px';
  star.style.height = '20px';
  star.style.background = 'radial-gradient(circle, #FFD700 0%, transparent 70%)';
  star.style.borderRadius = '50%';
  star.style.pointerEvents = 'none'; // 不干扰交互
  star.style.willChange = 'transform, opacity'; // GPU 加速提示
  star.style.zIndex = '1000';
  
  // 添加到容器
  container.appendChild(star);
  
  return star;
}

/**
 * 触发星星飘落动画
 * 
 * @param container 容器元素（动画挂载点）
 * @param config 自定义配置（可选）
 * @returns Promise<void> - 动画完成
 * 
 * @example
 * ```typescript
 * // 基础用法
 * triggerLikeAnimation(containerElement);
 * 
 * // 自定义星星数量
 * triggerLikeAnimation(containerElement, { count: 10 });
 * 
 * // 关闭语音
 * triggerLikeAnimation(containerElement, { enableVoice: false });
 * ```
 */
export async function triggerLikeAnimation(
  container: HTMLElement,
  config?: Partial<StarConfig>
): Promise<void> {
  // 合并配置
  const finalConfig = { ...DEFAULT_STAR_CONFIG, ...config };
  
  // [CRITICAL] 验证星星数量范围
  const starCount = Math.max(5, Math.min(10, finalConfig.count));
  
  // 创建星星数组
  const stars: HTMLElement[] = [];
  
  // [CRITICAL] 确保容器支持定位
  if (container.style.position === '' || container.style.position === 'static') {
    container.style.position = 'relative';
  }
  
  // 创建星星
  for (let i = 0; i < starCount; i++) {
    // [CRITICAL] 延迟索引循环（只有 5 个延迟类）
    const delayIndex = i % 5;
    const star = createStar(container, delayIndex);
    stars.push(star);
  }
  
  // [CRITICAL] 播放祝福语音（如果启用）
  if (finalConfig.enableVoice) {
    // 不等待语音完成，动画和语音并行
    playBlessingVoice().catch(err => {
      console.warn('[LikeAction] 祝福语音播放失败:', err);
    });
  }
  
  // [CRITICAL] 动画完成后清理星星
  return new Promise((resolve) => {
    setTimeout(() => {
      // 移除所有星星
      stars.forEach(star => {
        star.remove();
      });
      
      console.log('[LikeAction] 星星飘落动画完成');
      resolve();
    }, finalConfig.duration);
  });
}

/**
 * 快捷触发函数（仅动画，无语音）
 * 
 * @param container 容器元素
 * @returns Promise<void>
 */
export async function triggerStarsOnly(container: HTMLElement): Promise<void> {
  return triggerLikeAnimation(container, { enableVoice: false });
}

/**
 * 快捷触发函数（仅语音，无动画）
 * 
 * @returns Promise<void>
 */
export async function triggerVoiceOnly(): Promise<void> {
  return playBlessingVoice();
}