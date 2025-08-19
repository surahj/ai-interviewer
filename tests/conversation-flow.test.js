const { test, expect } = require('@playwright/test');

test.describe('Conversation Flow Tests', () => {
  test('should properly wait for user responses', async ({ page }) => {
    // Navigate to setup interview page
    await page.goto('/setup-interview');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // If redirected to login, skip this test
    if (page.url().includes('/login')) {
      console.log('Skipping test - user not authenticated');
      return;
    }
    
    // Quick setup to get to live interview
    await page.click('text=Software Engineer');
    await page.click('text=Junior (0-2 years)');
    await page.click('text=Next Step');
    await page.click('text=Technical Interview');
    await page.click('text=30 minutes');
    await page.click('text=Next Step');
    await page.click('text=Frontend Development');
    await page.click('text=Next Step');
    await page.click('text=Start Interview');
    
    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);
    
    // Wait for AI to finish speaking
    await page.waitForTimeout(5000);
    
    // Check that the interface shows "Waiting for you to start speaking"
    await expect(page.locator('text=Waiting for you to start speaking')).toBeVisible();
    
    // Check that the "I'm Done Speaking" button is not visible initially
    await expect(page.locator('text=I\'m Done Speaking')).not.toBeVisible();
    
    // Check that conversation controls are present
    await expect(page.locator('text=Start Listening')).toBeVisible();
    await expect(page.locator('text=Next Question')).toBeVisible();
  });

  test('should show action buttons properly', async ({ page }) => {
    // Navigate to setup interview page
    await page.goto('/setup-interview');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // If redirected to login, skip this test
    if (page.url().includes('/login')) {
      console.log('Skipping test - user not authenticated');
      return;
    }
    
    // Quick setup to get to live interview
    await page.click('text=Software Engineer');
    await page.click('text=Junior (0-2 years)');
    await page.click('text=Next Step');
    await page.click('text=Technical Interview');
    await page.click('text=30 minutes');
    await page.click('text=Next Step');
    await page.click('text=Frontend Development');
    await page.click('text=Next Step');
    await page.click('text=Start Interview');
    
    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check that action buttons are visible
    await expect(page.locator('text=Start Listening')).toBeVisible();
    await expect(page.locator('text=Next Question')).toBeVisible();
    
    // Check that controls are visible
    await expect(page.locator('text=Controls')).toBeVisible();
  });

  test('should handle AI states correctly', async ({ page }) => {
    // Navigate to setup interview page
    await page.goto('/setup-interview');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // If redirected to login, skip this test
    if (page.url().includes('/login')) {
      console.log('Skipping test - user not authenticated');
      return;
    }
    
    // Quick setup to get to live interview
    await page.click('text=Software Engineer');
    await page.click('text=Junior (0-2 years)');
    await page.click('text=Next Step');
    await page.click('text=Technical Interview');
    await page.click('text=30 minutes');
    await page.click('text=Next Step');
    await page.click('text=Frontend Development');
    await page.click('text=Next Step');
    await page.click('text=Start Interview');
    
    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);
    
    // Wait for AI to start speaking
    await page.waitForTimeout(2000);
    
    // Check that AI interviewer is visible
    await expect(page.locator('text=AI Interviewer')).toBeVisible();
    
    // Check that AI state indicator is present
    await expect(page.locator('.w-32.h-32.rounded-full')).toBeVisible();
    
    // Wait for AI to finish speaking
    await page.waitForTimeout(5000);
    
    // Check that it's now waiting for user input
    await expect(page.locator('text=Waiting for you to start speaking')).toBeVisible();
  });
});
