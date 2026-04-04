<script lang="ts">
  import { onMount } from 'svelte';
  import type { Wish } from '../../../kv-schema';
  
  const ADMIN_PASSWORD = 'mywish2026';
  
  let isAuthenticated = $state(false);
  let passwordInput = $state('');
  let passwordError = $state('');
  
  let searchKey = $state('');
  let searchedWish = $state<(Wish & { realtime_likes: number }) | null>(null);
  let isSearching = $state(false);
  let searchError = $state('');
  
  let addLikesAmount = $state('');
  let likesResult = $state<{ success: boolean; message: string } | null>(null);
  let isUpdatingLikes = $state(false);
  
  let deleteKey = $state('');
  let deleteResult = $state<{ success: boolean; message: string } | null>(null);
  let isDeleting = $state(false);
  
  let recentWishes = $state<Wish[]>([]);
  let isLoadingWishes = $state(false);
  
  onMount(() => {
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      isAuthenticated = true;
      loadRecentWishes();
    }
  });
  
  function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      isAuthenticated = true;
      passwordError = '';
      sessionStorage.setItem('admin_auth', 'true');
      loadRecentWishes();
    } else {
      passwordError = '密码错误';
    }
  }
  
  function handleLogout() {
    isAuthenticated = false;
    sessionStorage.removeItem('admin_auth');
    passwordInput = '';
  }
  
  async function handleSearch() {
    if (!searchKey.trim()) {
      searchError = '请输入小钥匙';
      return;
    }
    
    isSearching = true;
    searchError = '';
    searchedWish = null;
    
    try {
      const res = await fetch(`/api/wish/${searchKey.trim()}`);
      const json = await res.json();
      
      if (json.success) {
        searchedWish = json.data;
      } else {
        searchError = json.message || '未找到该心愿';
      }
    } catch (e) {
      searchError = '网络错误，请重试';
    } finally {
      isSearching = false;
    }
  }
  
  async function handleAddLikes() {
    if (!searchedWish) {
      likesResult = { success: false, message: '请先搜索心愿' };
      return;
    }
    
    const amount = Math.floor(parseInt(addLikesAmount) || 0);
    if (amount <= 0) {
      likesResult = { success: false, message: '请输入有效的点赞数（正整数）' };
      return;
    }
    
    if (amount > 10000) {
      likesResult = { success: false, message: '单次最多增加 10000 点赞' };
      return;
    }
    
    isUpdatingLikes = true;
    likesResult = null;
    
    try {
      const res = await fetch(`/api/admin/wish/${searchedWish.key}/likes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': ADMIN_PASSWORD
        },
        body: JSON.stringify({ add_likes: amount })
      });
      
      const json = await res.json();
      
      if (json.success) {
        likesResult = { success: true, message: json.message };
        if (searchedWish) {
          searchedWish = { ...searchedWish, realtime_likes: json.currentLikes };
        }
        loadRecentWishes();
      } else {
        likesResult = { success: false, message: json.message || '操作失败' };
      }
    } catch (e) {
      likesResult = { success: false, message: '网络错误，请重试' };
    } finally {
      isUpdatingLikes = false;
    }
  }
  
  async function handleDelete() {
    if (!deleteKey.trim()) {
      deleteResult = { success: false, message: '请输入小钥匙' };
      return;
    }
    
    isDeleting = true;
    deleteResult = null;
    
    try {
      const res = await fetch(`/api/admin/wish/${deleteKey.trim()}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': ADMIN_PASSWORD
        }
      });
      
      const json = await res.json();
      
      if (json.success) {
        deleteResult = { success: true, message: json.message };
        deleteKey = '';
        if (searchedWish && searchedWish.key === json.deletedKey) {
          searchedWish = null;
        }
        loadRecentWishes();
      } else {
        deleteResult = { success: false, message: json.message || '删除失败' };
      }
    } catch (e) {
      deleteResult = { success: false, message: '网络错误，请重试' };
    } finally {
      isDeleting = false;
    }
  }
  
  function handleQuickDelete(key: string) {
    deleteKey = key;
    handleDelete();
  }
  
  function handleQuickEdit(key: string) {
    searchKey = key;
    handleSearch();
  }
  
  async function loadRecentWishes() {
    isLoadingWishes = true;
    try {
      const res = await fetch('/api/wishes?page=1&limit=20');
      const json = await res.json();
      recentWishes = json.data.wishes || [];
    } catch (e) {
      console.error('加载心愿列表失败', e);
    } finally {
      isLoadingWishes = false;
    }
  }
  
  function formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)}小时前`;
    } else {
      return `${Math.floor(diffMins / (24 * 60))}天前`;
    }
  }
</script>

<svelte:head>
  <title>管理后台 - 星辰大海 My Wish</title>
</svelte:head>

<main class="admin-page">
  {#if !isAuthenticated}
    <section class="login-section">
      <div class="login-card">
        <h1 class="login-title">🔧 管理后台</h1>
        <p class="login-desc">请输入管理密码登录</p>
        
        <form class="login-form" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <input 
            type="password" 
            class="password-input"
            placeholder="管理密码"
            bind:value={passwordInput}
          />
          
          {#if passwordError}
            <p class="password-error">{passwordError}</p>
          {/if}
          
          <button type="submit" class="login-btn">登录</button>
        </form>
      </div>
    </section>
  {:else}
    <section class="admin-section">
      <header class="admin-header">
        <h1 class="admin-title">🔧 心愿管理后台</h1>
        <button class="logout-btn" onclick={handleLogout}>退出登录</button>
      </header>
      
      <div class="search-section">
        <h2 class="section-title">🔍 搜索心愿</h2>
        <p class="section-desc">输入小钥匙查看心愿详情，可编辑点赞数</p>
        
        <div class="search-form">
          <input 
            type="text" 
            class="key-input"
            placeholder="输入小钥匙（如：ABC123）"
            bind:value={searchKey}
            maxlength={6}
          />
          
          <button 
            class="search-btn" 
            onclick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? '搜索中...' : '搜索'}
          </button>
        </div>
        
        {#if searchError}
          <p class="search-error">{searchError}</p>
        {/if}
        
        {#if searchedWish}
          <div class="wish-detail">
            <div class="detail-header">
              <span class="detail-key">小钥匙: {searchedWish.key}</span>
              <span class="detail-id">ID: {searchedWish.id}</span>
            </div>
            
            <div class="detail-content">
              <p class="detail-text">{searchedWish.text}</p>
              <div class="detail-stats">
                <span class="stat-item">❤️ {searchedWish.realtime_likes} 点赞</span>
                <span class="stat-item">⭐ {searchedWish.recommends} 推荐</span>
              </div>
              <p class="detail-time">创建时间: {formatTime(searchedWish.created_at)}</p>
            </div>
            
            <div class="edit-section">
              <h3 class="edit-title">增加点赞数</h3>
              <p class="edit-desc">增加的点赞数会计入当前小时 TOP3 统计</p>
              
              <div class="edit-form">
                <input 
                  type="number" 
                  class="likes-input"
                  placeholder="增加数量（如：1000）"
                  bind:value={addLikesAmount}
                  min="1"
                  max="10000"
                />
                
                <button 
                  class="add-likes-btn" 
                  onclick={handleAddLikes}
                  disabled={isUpdatingLikes}
                >
                  {isUpdatingLikes ? '处理中...' : '增加'}
                </button>
              </div>
              
              {#if likesResult}
                <div class="result-message" class:success={likesResult.success} class:error={!likesResult.success}>
                  {likesResult.message}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      
      <div class="delete-section">
        <h2 class="section-title">🗑️ 删除心愿</h2>
        <p class="section-desc">输入小钥匙快速删除</p>
        
        <div class="delete-form">
          <input 
            type="text" 
            class="key-input"
            placeholder="输入小钥匙"
            bind:value={deleteKey}
            maxlength={6}
          />
          
          <button 
            class="delete-btn" 
            onclick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '删除中...' : '删除'}
          </button>
        </div>
        
        {#if deleteResult}
          <div class="result-message" class:success={deleteResult.success} class:error={!deleteResult.success}>
            {deleteResult.message}
          </div>
        {/if}
      </div>
      
      <div class="wishes-section">
        <h2 class="section-title">📋 最近心愿</h2>
        <p class="section-desc">点击操作按钮快速管理</p>
        
        {#if isLoadingWishes}
          <div class="loading-state">加载中...</div>
        {:else if recentWishes.length === 0}
          <div class="empty-state">暂无心愿</div>
        {:else}
          <div class="wishes-table">
            <table>
              <thead>
                <tr>
                  <th>小钥匙</th>
                  <th>内容</th>
                  <th>点赞</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {#each recentWishes as wish}
                  <tr>
                    <td class="key-cell">{wish.key}</td>
                    <td class="text-cell">{wish.text}</td>
                    <td class="likes-cell">{wish.likes}</td>
                    <td class="time-cell">{formatTime(wish.created_at)}</td>
                    <td class="action-cell">
                      <button 
                        class="quick-edit-btn" 
                        onclick={() => handleQuickEdit(wish.key)}
                        disabled={isSearching}
                      >
                        编辑
                      </button>
                      <button 
                        class="quick-delete-btn" 
                        onclick={() => handleQuickDelete(wish.key)}
                        disabled={isDeleting}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
        
        <button class="refresh-btn" onclick={loadRecentWishes} disabled={isLoadingWishes}>
          {isLoadingWishes ? '刷新中...' : '刷新列表'}
        </button>
      </div>
    </section>
  {/if}
</main>

<style>
  .admin-page {
    width: 100%;
    min-height: 100vh;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
  }
  
  .login-section {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  
  .login-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);
    padding: var(--space-6);
    width: 100%;
    max-width: 400px;
    text-align: center;
  }
  
  .login-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  .login-desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-6);
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .password-input {
    width: 100%;
    padding: var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background: var(--color-bg-base);
    color: var(--color-text-primary);
  }
  
  .password-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  .password-error {
    color: #f44336;
    font-size: var(--font-size-sm);
  }
  
  .login-btn {
    width: 100%;
    padding: var(--space-3);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
  }
  
  .login-btn:hover {
    opacity: 0.9;
  }
  
  .admin-section {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }
  
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);
  }
  
  .admin-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }
  
  .logout-btn {
    padding: var(--space-2) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    cursor: pointer;
  }
  
  .logout-btn:hover {
    background: var(--color-bg-muted);
  }
  
  .search-section,
  .delete-section,
  .wishes-section {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);
    padding: var(--space-5);
    margin-bottom: var(--space-6);
  }
  
  .section-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  .section-desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-4);
  }
  
  .search-form,
  .delete-form,
  .edit-form {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }
  
  .key-input,
  .likes-input {
    flex: 1;
    padding: var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background: var(--color-bg-base);
    color: var(--color-text-primary);
  }
  
  .key-input {
    text-transform: uppercase;
  }
  
  .key-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  .likes-input:focus {
    outline: none;
    border-color: #4caf50;
  }
  
  .search-btn {
    padding: var(--space-3) var(--space-5);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
  }
  
  .search-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .search-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .search-error {
    color: #f44336;
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-3);
  }
  
  .wish-detail {
    background: var(--color-bg-muted);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin-top: var(--space-4);
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-3);
    font-size: var(--font-size-sm);
  }
  
  .detail-key {
    font-weight: var(--font-weight-bold);
    color: var(--color-primary);
  }
  
  .detail-id {
    color: var(--color-text-muted);
  }
  
  .detail-content {
    margin-bottom: var(--space-4);
  }
  
  .detail-text {
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    margin-bottom: var(--space-3);
    line-height: 1.5;
  }
  
  .detail-stats {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-2);
  }
  
  .stat-item {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
  
  .detail-time {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }
  
  .edit-section {
    border-top: 1px solid var(--color-border-light);
    padding-top: var(--space-4);
  }
  
  .edit-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  .edit-desc {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin-bottom: var(--space-3);
  }
  
  .add-likes-btn {
    padding: var(--space-3) var(--space-5);
    background: #4caf50;
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
  }
  
  .add-likes-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .add-likes-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .delete-btn {
    padding: var(--space-3) var(--space-5);
    background: #f44336;
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
  }
  
  .delete-btn:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .result-message {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    text-align: center;
  }
  
  .result-message.success {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  .result-message.error {
    background: #ffebee;
    color: #c62828;
  }
  
  .loading-state,
  .empty-state {
    text-align: center;
    padding: var(--space-6);
    color: var(--color-text-muted);
  }
  
  .wishes-table {
    overflow-x: auto;
    margin-bottom: var(--space-4);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }
  
  th {
    text-align: left;
    padding: var(--space-3);
    background: var(--color-bg-muted);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    border-bottom: 1px solid var(--color-border-default);
  }
  
  td {
    padding: var(--space-3);
    border-bottom: 1px solid var(--color-border-light);
    color: var(--color-text-secondary);
  }
  
  .key-cell {
    font-weight: var(--font-weight-medium);
    color: var(--color-primary);
  }
  
  .text-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .likes-cell {
    color: #f44336;
    font-weight: var(--font-weight-medium);
  }
  
  .time-cell {
    color: var(--color-text-muted);
  }
  
  .action-cell {
    text-align: right;
    display: flex;
    gap: var(--space-2);
    justify-content: flex-end;
  }
  
  .quick-edit-btn {
    padding: var(--space-1) var(--space-2);
    background: transparent;
    color: #4caf50;
    border: 1px solid #4caf50;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    cursor: pointer;
  }
  
  .quick-edit-btn:hover:not(:disabled) {
    background: #e8f5e9;
  }
  
  .quick-edit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .quick-delete-btn {
    padding: var(--space-1) var(--space-2);
    background: transparent;
    color: #f44336;
    border: 1px solid #f44336;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    cursor: pointer;
  }
  
  .quick-delete-btn:hover:not(:disabled) {
    background: #ffebee;
  }
  
  .quick-delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .refresh-btn {
    width: 100%;
    padding: var(--space-3);
    background: var(--color-bg-muted);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    cursor: pointer;
  }
  
  .refresh-btn:hover:not(:disabled) {
    background: var(--color-bg-base);
  }
  
  .refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 600px) {
    .search-form,
    .delete-form,
    .edit-form {
      flex-direction: column;
    }
    
    .search-btn,
    .delete-btn,
    .add-likes-btn {
      width: 100%;
    }
    
    .text-cell {
      max-width: 100px;
    }
    
    .detail-header {
      flex-direction: column;
      gap: var(--space-2);
    }
    
    th, td {
      padding: var(--space-2);
    }
    
    .action-cell {
      flex-direction: column;
    }
  }
</style>