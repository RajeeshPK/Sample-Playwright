import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Basic Playwright Example', () => {
  test('should navigate to Playwright homepage', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate('/');
    await homePage.verifyPageLoaded();
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('should search for documentation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate('/');
    await homePage.search('getting started');
    await expect(page).toHaveURL(/.*search.*/);
  });
});
