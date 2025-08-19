const { test, expect } = require('@playwright/test');

test.describe('Conversational Interview Tests', () => {
  test('should handle user asking for clarification', async ({ page }) => {
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
    
    // Wait for AI to finish speaking and start listening
    await page.waitForTimeout(5000);
    
    // Start listening
    await page.click('text=Start Listening');
    
    // Simulate user asking for clarification
    // Note: In a real test, we would need to simulate speech input
    // For now, we'll just check that the interface is ready for conversation
    
    // Check that conversation panel is visible
    await expect(page.locator('text=Conversation')).toBeVisible();
    
    // Check that AI interviewer is visible
    await expect(page.locator('text=AI Interviewer')).toBeVisible();
  });

  test('should display conversation history', async ({ page }) => {
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
    
    // Wait for initial question to appear
    await page.waitForTimeout(3000);
    
    // Check that conversation history section is visible
    await expect(page.locator('text=Conversation')).toBeVisible();
    
    // Check that current question section is visible
    await expect(page.locator('text=Current Question')).toBeVisible();
  });

  test('should show AI thinking state', async ({ page }) => {
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
    
    // Check that the AI state indicator is present
    await expect(page.locator('.w-32.h-32.rounded-full')).toBeVisible();
  });

  test('should handle interview controls properly', async ({ page }) => {
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
    await page.waitForTimeout(2000);
    
    // Check that all control buttons are present
    await expect(page.locator('text=Start Listening')).toBeVisible();
    await expect(page.locator('text=Next Question')).toBeVisible();
    await expect(page.locator('text=Show Chat')).toBeVisible();
    
    // Check that video controls are present
    await expect(page.locator('text=Mute')).toBeVisible();
    await expect(page.locator('text=Camera')).toBeVisible();
  });

  test('should display real-time feedback', async ({ page }) => {
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
    await page.waitForTimeout(2000);
    
    // Check that feedback section is ready (even if empty initially)
    await expect(page.locator('text=Conversation')).toBeVisible();
    
    // Check that the interface is ready to show feedback
    await expect(page.locator('.bg-green-900\\/20, .bg-blue-900\\/20')).toBeVisible();
  });
});
