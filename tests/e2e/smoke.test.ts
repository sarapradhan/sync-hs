import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { chromium, Browser, Page } from 'playwright';

describe('Smoke Tests', () => {
  let server: ChildProcess;
  let browser: Browser;
  let page: Page;
  const PORT = 5000;
  const BASE_URL = `http://localhost:${PORT}`;

  beforeAll(async () => {
    // Start the development server
    server = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Wait for server to start
    await new Promise((resolve) => {
      server.stdout?.on('data', (data) => {
        if (data.toString().includes('serving on port')) {
          resolve(true);
        }
      });
      setTimeout(resolve, 10000); // Fallback timeout
    });

    // Launch browser
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser?.close();
    server?.kill();
  });

  it('should load the dashboard page', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 10000 });
    
    expect(await page.textContent('h1')).toContain('Zoo Dashboard');
  });

  it('should display assignment statistics', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="stats-card"]', { timeout: 10000 });
    
    const statsCards = await page.locator('[data-testid="stats-card"]');
    expect(await statsCards.count()).toBeGreaterThan(0);
  });

  it('should navigate to assignments page', async () => {
    await page.goto(BASE_URL);
    await page.click('a[href="/assignments"]');
    await page.waitForSelector('[data-testid="assignments-page"]', { timeout: 5000 });
    
    expect(await page.textContent('h1')).toContain('All Assignments');
  });

  it('should open assignment form dialog', async () => {
    await page.goto(`${BASE_URL}/assignments`);
    await page.waitForSelector('[data-testid="button-add-assignment"]', { timeout: 5000 });
    
    await page.click('[data-testid="button-add-assignment"]');
    await page.waitForSelector('role=dialog', { timeout: 5000 });
    
    expect(await page.textContent('role=dialog')).toContain('Assignment');
  });

  it('should display subjects page', async () => {
    await page.goto(`${BASE_URL}/subjects`);
    await page.waitForSelector('[data-testid="subjects-page"]', { timeout: 5000 });
    
    expect(await page.textContent('h1')).toContain('Subjects');
  });

  it('should show mobile navigation on small screens', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="mobile-nav"]', { timeout: 5000 });
    
    const mobileNav = await page.locator('[data-testid="mobile-nav"]');
    expect(await mobileNav.isVisible()).toBe(true);
  });

  it('should switch users successfully', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="user-switcher"]', { timeout: 5000 });
    
    await page.click('[data-testid="user-switcher"]');
    await page.waitForSelector('role=option', { timeout: 2000 });
    
    const options = await page.locator('role=option');
    expect(await options.count()).toBeGreaterThan(1);
  });

  it('should open data management dialog', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="button-data-management"]', { timeout: 5000 });
    
    await page.click('[data-testid="button-data-management"]');
    await page.waitForSelector('role=dialog', { timeout: 5000 });
    
    expect(await page.textContent('role=dialog')).toContain('Data Management');
  });

  it('should display assignment summary table', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('table', { timeout: 10000 });
    
    const table = await page.locator('table');
    expect(await table.isVisible()).toBe(true);
    
    const headers = await page.locator('th');
    expect(await headers.count()).toBeGreaterThan(5);
  });

  it('should handle responsive design', async () => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 5000 });
    
    let sidebar = await page.locator('[data-testid="desktop-nav"]');
    expect(await sidebar.isVisible()).toBe(true);
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForSelector('[data-testid="mobile-nav"]', { timeout: 5000 });
    
    const mobileNav = await page.locator('[data-testid="mobile-nav"]');
    expect(await mobileNav.isVisible()).toBe(true);
  });

  it('should load without JavaScript errors', async () => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 10000 });
    
    expect(errors).toHaveLength(0);
  });

  it('should have proper accessibility landmarks', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 5000 });
    
    // Check for main content area
    const main = await page.locator('main');
    expect(await main.count()).toBeGreaterThan(0);
    
    // Check for navigation
    const nav = await page.locator('nav');
    expect(await nav.count()).toBeGreaterThan(0);
  });

  it('should persist data across page reloads', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 5000 });
    
    // Get initial assignment count
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    const initialRows = await page.locator('table tbody tr');
    const initialCount = await initialRows.count();
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 5000 });
    
    // Check that data persisted
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    const reloadRows = await page.locator('table tbody tr');
    const reloadCount = await reloadRows.count();
    
    expect(reloadCount).toBe(initialCount);
  });
});