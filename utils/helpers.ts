import { Page } from '@playwright/test';

export class TestHelpers {
  static async waitForApiResponse(page: Page, url: string) {
    const response = await page.waitForResponse(resp => 
      resp.url().includes(url) && resp.status() === 200
    );
    return response;
  }

  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => window.localStorage.clear());
  }

  static async mockApiResponse(page: Page, url: string, response: any) {
    await page.route(url, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  static generateTestData() {
    return {
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
  }
}
