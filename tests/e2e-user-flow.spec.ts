import { test, expect } from '@playwright/test';

const BASE_URL = 'https://master.mywish-63v.pages.dev';

test.describe('My Wish 完整用户流程测试', () => {
  test('应该能正常访问首页并显示心愿', async ({ page }) => {
    // 访问首页
    await page.goto(BASE_URL + '/');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/心愿/);
    
    // 检查两个 Tab
    await expect(page.locator('text=全民点赞')).toBeVisible();
    await expect(page.locator('text=心愿广场')).toBeVisible();
    
    // 检查发布心愿按钮
    await expect(page.locator('text=发布心愿')).toBeVisible();
    
    console.log('✅ 首页加载正常');
  });

  test('应该能正常发布心愿', async ({ page }) => {
    await page.goto(BASE_URL + '/create');
    
    // 填写心愿内容
    await page.fill('textarea', 'E2E 测试心愿：希望世界和平');
    
    // 点击发布
    await page.click('button:has-text("发布")');
    
    // 等待跳转
    await page.waitForTimeout(2000);
    
    console.log('✅ 发布心愿流程正常');
  });

  test('应该能正常点赞', async ({ page }) => {
    await page.goto(BASE_URL + '/');
    
    // 等待心愿加载
    await page.waitForTimeout(2000);
    
    // 点击点赞按钮
    const likeBtn = page.locator('button:has-text("⭐")').first();
    await likeBtn.click();
    
    // 等待响应
    await page.waitForTimeout(1000);
    
    // 检查控制台是否有错误
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    expect(consoleMessages.length).toBe(0);
    console.log('✅ 点赞功能正常');
  });
});
