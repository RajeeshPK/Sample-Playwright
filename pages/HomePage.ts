import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly getStartedButton: Locator;
  readonly searchBox: Locator;
  readonly navigationMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.getStartedButton = page.getByRole('link', { name: 'Get started' });
    this.searchBox = page.getByPlaceholder('Search docs');
    this.navigationMenu = page.getByRole('navigation');
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  async search(query: string) {
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
  }

  async verifyPageLoaded() {
    await expect(this.getStartedButton).toBeVisible();
    await expect(this.navigationMenu).toBeVisible();
  }
}
