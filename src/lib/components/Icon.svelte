<script lang="ts">
  /**
   * @description 图标组件封装 - 基于 Lucide Icons
   * @version 1.0
   * @created 2026-04-04
   * @design 统一图标系统，替换 emoji
   */
  
  import { 
    Heart, 
    Star, 
    Share2, 
    Key, 
    Sparkles, 
    Flame, 
    LayoutGrid, 
    Search, 
    X, 
    RefreshCw, 
    AtSign, 
    MessageCircle, 
    Link,
    Edit3,
    Copy,
    ExternalLink
  } from 'lucide-svelte';
  
  // 图标名称映射
  const iconMap = {
    heart: Heart,
    star: Star,
    share: Share2,
    key: Key,
    sparkles: Sparkles,
    flame: Flame,
    grid: LayoutGrid,
    search: Search,
    x: X,
    refresh: RefreshCw,
    at: AtSign,
    message: MessageCircle,
    link: Link,
    edit: Edit3,
    copy: Copy,
    'external-link': ExternalLink
  } as const;
  
  export type IconName = keyof typeof iconMap;
  
  interface Props {
    /** 图标名称 */
    name: IconName;
    /** 图标尺寸（像素） */
    size?: number;
    /** 自定义 CSS 类 */
    class?: string;
    /** 颜色（继承 currentColor 或指定颜色） */
    color?: string;
    /** 线条粗细 */
    strokeWidth?: number;
  }
  
  let { 
    name, 
    size = 24, 
    class: className = '', 
    color,
    strokeWidth = 2 
  }: Props = $props();
  
  // 获取图标组件
  const IconComponent = $derived(iconMap[name]);
</script>

{#if IconComponent}
  <IconComponent 
    {size} 
    class={className}
    {color}
    {strokeWidth}
  />
{/if}