const { test, expect } = require('@playwright/test');

test.describe('Basic Functionality Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Interviewer/);
    await expect(page.locator('h1')).toContainText('Master Your Interviews');
  });

  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h3')).toContainText('Welcome back');
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should load register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h3')).toContainText('Create an account');
    await expect(page.locator('[data-testid="name"]')).toBeVisible();
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
  });

  test('should load setup interview page', async ({ page }) => {
    await page.goto('/setup-interview');
    await expect(page.locator('h1')).toContainText('Set Up Your Interview');
    await expect(page.locator('[data-testid="job-role-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="experience-level-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="duration-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-interview-button"]')).toBeVisible();
  });

  test('should have proper navigation between pages', async ({ page }) => {
    // Test homepage navigation
    await page.goto('/');
    await page.click('text=Start Free Practice');
    await expect(page).toHaveURL('/register');

    // Test register to login navigation
    await page.goto('/register');
    await page.click('text=Sign in');
    await expect(page).toHaveURL('/login');
  });
});
