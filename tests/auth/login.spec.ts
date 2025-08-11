import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login Tests', () => {
  test('should display login form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await loginPage.login('invalid', 'credentials');
    await loginPage.verifyLoginError('Invalid username or password');
  });
});
