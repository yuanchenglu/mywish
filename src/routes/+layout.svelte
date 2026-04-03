<script lang="ts">
  import '../styles/tokens.css';
  import '../styles/layout.css';
</script>

<svelte:head>
  <title>星辰大海 My Wish - 心愿祝福平台</title>
  <meta name="description" content="发布你的小心愿，传递正能量，获得祝福" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
</svelte:head>

<!-- 主内容区域：底部留出Tab导航空间 -->
<div class="app-container">
  <slot />
</div>

<style>
  /* ========================================
     应用容器布局
     ======================================== */
  
  .app-container {
    /* 全屏高度 */
    min-height: 100vh;
    
    /* 使用 tokens 渐变背景 */
    background: var(--gradient-bg);
    
    /* 底部预留空间：Tab导航高度(56px) + 安全区(8px) */
    padding-bottom: 64px;
    
    /* 响应式：桌面端不需要底部padding */
  }
  
  @media (min-width: 1025px) {
    .app-container {
      padding-bottom: 0;
    }
  }
</style>