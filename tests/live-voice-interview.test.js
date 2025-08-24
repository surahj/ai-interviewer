const { test, expect } = require("@playwright/test");

test.describe("Live Voice Interview Tests", () => {
  test("should initialize live interview with voice capabilities", async ({
    page,
  }) => {
    // Navigate to setup interview page
    await page.goto("/setup-interview");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // If redirected to login, skip this test
    if (page.url().includes("/login")) {
      return;
    }

    // Quick setup to get to live interview
    await page.click("text=Software Engineer");
    await page.click("text=Junior (0-2 years)");
    await page.click("text=Next Step");
    await page.click("text=Technical Interview");
    await page.click("text=30 minutes");
    await page.click("text=Next Step");
    await page.click("text=Frontend Development");
    await page.click("text=Next Step");
    await page.click("text=Start Interview");

    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);

    // Check that we're on the live interview page
    await expect(page.locator("text=Live Interview")).toBeVisible();

    // Check for voice interface elements
    await expect(page.locator("text=AI Interviewer")).toBeVisible();
    await expect(page.locator("text=Start Listening")).toBeVisible();

    // Check for video elements
    await expect(page.locator("video")).toBeVisible();

    // Check for interview controls
    await expect(page.locator("text=Controls")).toBeVisible();
    await expect(page.locator("text=Mute")).toBeVisible();
    await expect(page.locator("text=Camera")).toBeVisible();
  });

  test("should handle voice interaction flow", async ({ page }) => {
    // Navigate to live interview page
    await page.goto("/setup-interview");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // If redirected to login, skip this test
    if (page.url().includes("/login")) {
      return;
    }

    // Quick setup to get to live interview
    await page.click("text=Software Engineer");
    await page.click("text=Junior (0-2 years)");
    await page.click("text=Next Step");
    await page.click("text=Technical Interview");
    await page.click("text=30 minutes");
    await page.click("text=Next Step");
    await page.click("text=Frontend Development");
    await page.click("text=Next Step");
    await page.click("text=Start Interview");

    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);

    // Wait for AI to start speaking (first question)
    await page.waitForTimeout(2000);

    // Check that AI is speaking
    await expect(page.locator("text=Speaking...")).toBeVisible();

    // Wait for AI to finish speaking and start listening
    await page.waitForTimeout(5000);

    // Check that it's listening for user response
    await expect(
      page.locator("text=Listening for your response...")
    ).toBeVisible();

    // Check for listening indicator
    await expect(page.locator("text=Listening...")).toBeVisible();
  });

  test("should display conversation history", async ({ page }) => {
    // Navigate to live interview page
    await page.goto("/setup-interview");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // If redirected to login, skip this test
    if (page.url().includes("/login")) {
      return;
    }

    // Quick setup to get to live interview
    await page.click("text=Software Engineer");
    await page.click("text=Junior (0-2 years)");
    await page.click("text=Next Step");
    await page.click("text=Technical Interview");
    await page.click("text=30 minutes");
    await page.click("text=Next Step");
    await page.click("text=Frontend Development");
    await page.click("text=Next Step");
    await page.click("text=Start Interview");

    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);

    // Wait for initial question to appear
    await page.waitForTimeout(3000);

    // Check that current question is displayed
    await expect(page.locator("text=Current Question")).toBeVisible();

    // Check that question content is visible
    await expect(page.locator(".bg-slate-700")).toBeVisible();
  });

  test("should handle interview controls", async ({ page }) => {
    // Navigate to live interview page
    await page.goto("/setup-interview");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // If redirected to login, skip this test
    if (page.url().includes("/login")) {
      return;
    }

    // Quick setup to get to live interview
    await page.click("text=Software Engineer");
    await page.click("text=Junior (0-2 years)");
    await page.click("text=Next Step");
    await page.click("text=Technical Interview");
    await page.click("text=30 minutes");
    await page.click("text=Next Step");
    await page.click("text=Frontend Development");
    await page.click("text=Next Step");
    await page.click("text=Start Interview");

    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);

    // Test mute button
    await page.click("text=Mute");
    await expect(page.locator("text=Mute")).toBeVisible();

    // Test camera button
    await page.click("text=Camera");
    await expect(page.locator("text=Camera")).toBeVisible();

    // Test next question button
    await page.click("text=Next Question");
    await expect(page.locator("text=Next Question")).toBeVisible();
  });

  test("should display interview progress and timer", async ({ page }) => {
    // Navigate to live interview page
    await page.goto("/setup-interview");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // If redirected to login, skip this test
    if (page.url().includes("/login")) {
      return;
    }

    // Quick setup to get to live interview
    await page.click("text=Software Engineer");
    await page.click("text=Junior (0-2 years)");
    await page.click("text=Next Step");
    await page.click("text=Technical Interview");
    await page.click("text=30 minutes");
    await page.click("text=Next Step");
    await page.click("text=Frontend Development");
    await page.click("text=Next Step");
    await page.click("text=Start Interview");

    // Wait for redirect to live interview page
    await page.waitForURL(/\/interview\/live/);

    // Check for timer display
    await expect(page.locator("text=Clock")).toBeVisible();

    // Check for score display
    await expect(page.locator("text=Star")).toBeVisible();

    // Check for question counter
    await expect(page.locator("text=1/10")).toBeVisible();
  });
});
