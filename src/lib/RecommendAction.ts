/**
 * @description 推荐动作逻辑 - 按钮缩放动画触发器
 * @version 1.0
 * @created 2026-04-03
 * @dependencies tokens.css (动效变量)
 * 
 * 功能特性：
 * - 按钮缩放动画（transform: scale）
 * - 禁用状态防止重复提交
 * - 推荐成功高亮反馈
 * - 简洁动画（无星星飘落，仅缩放）
 * - GPU 加速（CSS transform）
 * - 自动恢复按钮状态
 */

/**
 * 推荐配置
 */
export interface RecommendConfig {
  /** 禁用时长（毫秒） */
  disableDuration: number;
  /** 高亮时长（毫秒） */
  highlightDuration: number;
  /** 缩放比例 */
  scaleRatio: number;
}

/**
 * 默认推荐配置
 */
export const DEFAULT_RECOMMEND_CONFIG: RecommendConfig = {
  disableDuration: 1000, // 禁用 1 秒
  highlightDuration: 500, // 高亮 0.5 秒
  scaleRatio: 1.1 // 缩放 1.1 倍
};

/**
 * 触发推荐动画
 * 
 * @param button 推荐按钮元素
 * @param onSuccess 成功回调（可选）
 * @param config 自定义配置（可选）
 * @returns Promise<void> - 动画完成
 * 
 * @example
 * ```typescript
 * // 基础用法
 * triggerRecommend(buttonElement, () => {
 *   console.log('推荐成功');
 * });
 * 
 * // 自定义配置
 * triggerRecommend(buttonElement, onSuccess, { 
 *   disableDuration: 2000,
 *   highlightDuration: 800
 * });
 * ```
 */
export async function triggerRecommend(
  button: HTMLButtonElement,
  onSuccess?: () => void,
  config?: Partial<RecommendConfig>
): Promise<void> {
  // 合并配置
  const finalConfig = { ...DEFAULT_RECOMMEND_CONFIG, ...config };
  
  // [CRITICAL] 禁用按钮防止重复提交
  button.disabled = true;
  
  // [CRITICAL] 添加高亮类（CSS 样式变化）
  button.classList.add('recommend-highlight');
  
  // [CRITICAL] 触发缩放动画（GPU 加速）
  button.style.transform = `scale(${finalConfig.scaleRatio})`;
  button.style.transition = 'transform var(--duration-fast) var(--ease-out)';
  button.style.willChange = 'transform'; // GPU 加速提示
  
  // [CRITICAL] 调用成功回调
  onSuccess?.();
  
  // [CRITICAL] 高亮时长后移除高亮类和缩放
  setTimeout(() => {
    button.classList.remove('recommend-highlight');
    button.style.transform = '';
    button.style.willChange = '';
  }, finalConfig.highlightDuration);
  
  // [CRITICAL] 禁用时长后恢复按钮
  return new Promise((resolve) => {
    setTimeout(() => {
      button.disabled = false;
      console.log('[RecommendAction] 推荐动画完成');
      resolve();
    }, finalConfig.disableDuration);
  });
}