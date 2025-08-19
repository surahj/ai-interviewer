const { test, expect } = require('@playwright/test');

test.describe('Interview Components Tests', () => {
  test('should load setup interview page with all form elements', async ({ page }) => {
    await page.goto('/setup-interview');
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Set Up Your Interview');
    
    // Check form elements
    await expect(page.locator('[data-testid="job-role-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="experience-level-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="duration-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="focus-technical"]')).toBeVisible();
    await expect(page.locator('[data-testid="focus-behavioral"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-interview-button"]')).toBeVisible();
  });

  test('should allow job role selection', async ({ page }) => {
    await page.goto('/setup-interview');
    
    // Click on job role select
    await page.click('[data-testid="job-role-select"]');
    
    // Check if dropdown opens and contains expected options
    await expect(page.locator('text=Software Engineer')).toBeVisible();
    await expect(page.locator('text=Frontend Developer')).toBeVisible();
    await expect(page.locator('text=Backend Developer')).toBeVisible();
  });

  test('should allow experience level selection', async ({ page }) => {
    await page.goto('/setup-interview');
    
    // Click on experience level select
    await page.click('[data-testid="experience-level-select"]');
    
    // Check if dropdown opens and contains expected options
    await expect(page.locator('text=Entry Level (0-2 years)')).toBeVisible();
    await expect(page.locator('text=Mid Level (3-5 years)')).toBeVisible();
    await expect(page.locator('text=Senior Level (6+ years)')).toBeVisible();
  });

  test('should allow duration selection', async ({ page }) => {
    await page.goto('/setup-interview');
    
    // Click on duration select
    await page.click('[data-testid="duration-select"]');
    
    // Check if dropdown opens and contains expected options
    await expect(page.locator('text=15 minutes')).toBeVisible();
    await expect(page.locator('text=30 minutes')).toBeVisible();
    await expect(page.locator('text=45 minutes')).toBeVisible();
    await expect(page.locator('text=60 minutes')).toBeVisible();
  });

  test('should allow focus area selection', async ({ page }) => {
    await page.goto('/setup-interview');
    
    // Check that focus areas are visible and can be toggled
    const technicalCheckbox = page.locator('[data-testid="focus-technical"]');
    const behavioralCheckbox = page.locator('[data-testid="focus-behavioral"]');
    
    await expect(technicalCheckbox).toBeVisible();
    await expect(behavioralCheckbox).toBeVisible();
    
    // Check that technical and behavioral are pre-selected
    await expect(technicalCheckbox).toBeChecked();
    await expect(behavioralCheckbox).toBeChecked();
  });

  test('should show interview summary', async ({ page }) => {
    await page.goto('/setup-interview');
    
    // Check that summary section is visible
    await expect(page.locator('text=Interview Summary')).toBeVisible();
    await expect(page.locator('text=Job Role')).toBeVisible();
    await expect(page.locator('text=Experience Level')).toBeVisible();
    await expect(page.locator('text=Duration')).toBeVisible();
    await expect(page.locator('text=Focus Areas')).toBeVisible();
  });
});
