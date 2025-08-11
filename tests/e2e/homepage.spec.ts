import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('Homepage E2E Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate('/');
  });

  test('should display main navigation elements', async ({ page }) => {
    await homePage.verifyPageLoaded();
    const title = await page.title();
    expect(title).toContain('Playwright');
  });

  test('should navigate to getting started page', async ({ page }) => {
    await homePage.clickGetStarted();
    await expect(page).toHaveURL(/.*intro/);
    await expect(page.getByRole('heading', { name: /installation/i })).toBeVisible();
  });
});
