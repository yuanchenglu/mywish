<script lang="ts">
  export type TabType = 'like' | 'publish' | 'square';
  
  interface Props {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    onPublishClick: () => void;
  }
  
  let { activeTab, onTabChange, onPublishClick }: Props = $props();
  
  const tabs: { id: TabType; label: string }[] = [
    { id: 'square', label: '星愿广场' },
    { id: 'publish', label: '许个心愿' },
    { id: 'like', label: '星+Top3' }
  ];
  
  function handleTabClick(tabId: TabType) {
    if (tabId === 'publish') {
      onPublishClick();
    } else {
      onTabChange(tabId);
    }
  }
</script>

<nav class="bottom-nav" aria-label="主导航">
  {#each tabs as tab}
    <button 
      class="nav-tab"
      class:active={activeTab === tab.id}
      onclick={() => handleTabClick(tab.id)}
      aria-current={activeTab === tab.id ? 'page' : undefined}
    >
      {tab.label}
    </button>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: var(--color-bg-dark);
    border-top: 1px solid var(--color-border-default);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-bottom: env(safe-area-inset-bottom, 0);
    z-index: 100;
  }
  
  .nav-tab {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .nav-tab.active {
    color: var(--color-accent-gold);
    font-weight: 600;
  }
  
  .nav-tab:active {
    opacity: 0.7;
  }
  
  @media (min-width: 1025px) {
    .bottom-nav {
      display: none;
    }
  }
</style>