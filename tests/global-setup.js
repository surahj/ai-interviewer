// @ts-check
const { chromium, FullConfig } = require("@playwright/test");

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";
  const storageState =
    config.projects[0].use.storageState || "playwright/.auth/user.json";

  // Launch browser and create authenticated state
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the application
  await page.goto(baseURL);

  // Create test user if needed
  await createTestUser(page);

  // Login and save authentication state
  await loginTestUser(page);

  // Save signed-in state
  await page.context().storageState({ path: storageState });
  await browser.close();
}

/**
 * Create a test user for testing
 */
async function createTestUser(page) {
  try {
    await page.goto("http://localhost:3000/register");

    // Check if user already exists by trying to register
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.fill('[data-testid="confirm-password"]', "password123");
    await page.fill('[data-testid="name"]', "Test User");

    await page.click('[data-testid="register-button"]');

    // Wait for either success or error (user already exists)
    await Promise.race([
      page.waitForURL("http://localhost:3000/dashboard"),
      page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 }),
    ]);
  } catch (error) {
    // User might already exist, continue
  }
}

/**
 * Login with test user credentials
 */
async function loginTestUser(page) {
  await page.goto("http://localhost:3000/login");

  await page.fill('[data-testid="email"]', "test@example.com");
  await page.fill('[data-testid="password"]', "password123");

  await page.click('[data-testid="login-button"]');

  // Wait for successful login
  await page.waitForURL("http://localhost:3000/dashboard");
}

module.exports = globalSetup;
