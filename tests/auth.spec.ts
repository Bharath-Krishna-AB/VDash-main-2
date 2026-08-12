import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {

  test('Invalid login fails', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid username and PIN
    await page.fill('#username-input', 'invaliduser');
    const pinInput = page.locator('input[maxLength="6"], input[inputmode="numeric"]');
    await pinInput.fill('111111');

    // Submit form
    await page.click('button[type="submit"]');

    // Expect to remain on /login page with error query parameter or error message visible
    await expect(page).toHaveURL(/\/login(\?error=invalid)?$/);
    
    // Expect error alert box
    const errorBox = page.locator('text=Invalid credentials');
    await expect(errorBox).toBeVisible({ timeout: 5000 });
  });

  test('Admin login succeeds', async ({ page }) => {
    await page.goto('/login');

    // Fill valid admin username and PIN
    await page.fill('#username-input', 'admin');
    const pinInput = page.locator('input[maxLength="6"], input[inputmode="numeric"]');
    await pinInput.fill('122456');

    // Submit form
    await page.click('button[type="submit"]');

    // Expect successful redirect to /admin or /admin/routes
    await page.waitForURL('**/admin**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  test('Session persists after refresh', async ({ page }) => {
    // Perform admin login first
    await page.goto('/login');
    await page.fill('#username-input', 'admin');
    const pinInput = page.locator('input[maxLength="6"], input[inputmode="numeric"]');
    await pinInput.fill('122456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Refresh the page
    await page.reload();

    // Verify session persisted and user remains on /admin or /admin/routes
    await expect(page).toHaveURL(/\/admin/);
  });

  test('Logout works', async ({ page }) => {
    // Perform admin login first
    await page.goto('/login');
    await page.fill('#username-input', 'admin');
    const pinInput = page.locator('input[maxLength="6"], input[inputmode="numeric"]');
    await pinInput.fill('122456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**', { timeout: 10000 });

    // Click logout button on /admin dashboard
    const logoutBtn = page.locator('button[title="Logout"]');
    await logoutBtn.click();

    // Expect redirect back to /login
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);

    // Attempt direct navigation back to protected route /admin
    await page.goto('/admin');

    // Verify middleware redirects back to /login because session was cleared
    await expect(page).toHaveURL(/\/login/);
  });

});
