const { test, expect } = require('@playwright/test');

test.describe('Video Call Interview Tests', () => {
  test('should start with greeting and tell me about yourself', async ({ page }) => {
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
    await page.waitForTimeout(3000);
    
    // Check that the question progress indicator shows question 1
    await expect(page.locator('text=Question 1 of 10')).toBeVisible();
    
    // Check that AI interviewer is visible
    await expect(page.locator('text=AI Interviewer')).toBeVisible();
    
    // Wait for AI to finish speaking and show listening state
    await page.waitForTimeout(5000);
    
    // Check that it's now listening for user response
    await expect(page.locator('text=Listening for your response...')).toBeVisible();
  });

  test('should show video call interface elements', async ({ page }) => {
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
    
    // Check video call interface elements
    await expect(page.locator('text=Live Interview')).toBeVisible();
    await expect(page.locator('text=Connected')).toBeVisible();
    await expect(page.locator('.w-32.h-32.rounded-full')).toBeVisible(); // AI interviewer circle
    
    // Check controls
    await expect(page.locator('text=Controls')).toBeVisible();
    await expect(page.locator('text=Start Listening')).toBeVisible();
    await expect(page.locator('text=Next Question')).toBeVisible();
  });

  test('should handle conversation flow like video call', async ({ page }) => {
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
    
    // Wait for AI to finish initial greeting
    await page.waitForTimeout(8000);
    
    // Check that the interface shows waiting for user to start speaking
    await expect(page.locator('text=Waiting for you to start speaking...')).toBeVisible();
    
    // Check that the "I'm Done Speaking" button is not visible initially
    await expect(page.locator('text=I\'m Done Speaking')).not.toBeVisible();
    
    // Check that conversation controls are present
    await expect(page.locator('text=Start Listening')).toBeVisible();
    await expect(page.locator('text=Next Question')).toBeVisible();
  });
});
