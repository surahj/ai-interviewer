// @ts-check

/**
 * Global teardown for Playwright tests
 * This runs once after all tests complete
 */
async function globalTeardown(config) {
  // Clean up test data if needed
  console.log('Cleaning up test environment...');
  
  // You can add cleanup logic here such as:
  // - Removing test users from database
  // - Cleaning up test files
  // - Resetting test state
  
  console.log('Test environment cleanup completed');
}

module.exports = globalTeardown;
