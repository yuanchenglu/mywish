import { test, expect } from '@playwright/test';

test('homepage has title and links to intro page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/星辰大海 My Wish/);
});