/**
 * @description 祝福语音管理 - 使用 Web Speech API 播放祝福语音
 * @version 1.0
 * @created 2026-04-03
 * 
 * 功能特性：
 * - 使用 Web Speech API（Text-to-Speech）播放祝福语音
 * - 用户可选开关语音（localStorage 持久化）
 * - 中文语音，慢速播放，更有仪式感
 * - 无需额外音频文件
 */

/**
 * 祝福语音配置
 */
interface BlessingConfig {
  /** 祝福文本内容 */
  text: string;
  /** 语音语言 */
  lang: string;
  /** 播放速度（0.1 - 10） */
  rate: number;
  /** 音量（0 - 1） */
  volume: number;
}

/**
 * 默认祝福配置
 */
const DEFAULT_CONFIG: BlessingConfig = {
  text: '愿星辰大海守护你',
  lang: 'zh-CN',
  rate: 0.9, // 稍慢，更有仪式感
  volume: 1.0
};

/**
 * LocalStorage Key - 用户语音偏好
 */
const STORAGE_KEY = 'mywish-blessing-voice-enabled';

/**
 * BlessingVoice 管理类
 * 
 * @example
 * ```typescript
 * // 播放祝福语音
 * BlessingVoice.play();
 * 
 * // 检查用户是否启用语音
 * BlessingVoice.isEnabled(); // true/false
 * 
 * // 设置用户偏好
 * BlessingVoice.setEnabled(false);
 * ```
 */
export class BlessingVoice {
  /**
   * 检查浏览器是否支持 Web Speech API
   * @returns 是否支持语音合成
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * 获取用户语音偏好（从 localStorage）
   * @returns 是否启用语音（默认 true）
   */
  static isEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return true; // 默认启用
    
    return stored === 'true';
  }

  /**
   * 设置用户语音偏好（持久化到 localStorage）
   * @param enabled 是否启用语音
   */
  static setEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }

  /**
   * 播放祝福语音
   * 
   * @param config 自定义祝福配置（可选）
   * @returns Promise<void> - 播放完成或失败
   * 
   * @example
   * ```typescript
   * // 使用默认配置播放
   * await BlessingVoice.play();
   * 
   * // 自定义文本播放
   * await BlessingVoice.play({ text: '祝福你心想事成' });
   * ```
   */
  static async play(config?: Partial<BlessingConfig>): Promise<void> {
    // [CRITICAL] 检查浏览器支持
    if (!this.isSupported()) {
      console.warn('[BlessingVoice] 浏览器不支持 Web Speech API');
      return;
    }

    // [CRITICAL] 检查用户偏好
    if (!this.isEnabled()) {
      console.log('[BlessingVoice] 用户已关闭语音');
      return;
    }

    // 合并配置
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(finalConfig.text);
    utterance.lang = finalConfig.lang;
    utterance.rate = finalConfig.rate;
    utterance.volume = finalConfig.volume;

    // [CRITICAL] 尝试获取中文语音
    const voices = speechSynthesis.getVoices();
    const zhVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    );
    
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    // 播放语音
    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        console.log('[BlessingVoice] 祝福语音播放完成');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('[BlessingVoice] 播放失败:', event.error);
        reject(event.error);
      };

      // [CRITICAL] 停止之前可能正在播放的语音
      speechSynthesis.cancel();
      
      // 播放新语音
      speechSynthesis.speak(utterance);
    });
  }

  /**
   * 停止当前播放的语音
   */
  static stop(): void {
    if (this.isSupported()) {
      speechSynthesis.cancel();
    }
  }

  /**
   * 获取可用的中文语音列表
   * @returns 中文语音数组
   */
  static getZhVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    
    const voices = speechSynthesis.getVoices();
    return voices.filter(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    );
  }
}

/**
 * 快捷播放函数（无需实例化）
 * 
 * @param config 自定义配置（可选）
 * @returns Promise<void>
 */
export async function playBlessingVoice(config?: Partial<BlessingConfig>): Promise<void> {
  return BlessingVoice.play(config);
}