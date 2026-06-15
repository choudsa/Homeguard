// 01-page-load.spec.js — App loads and initial state is correct
const { test, expect } = require('/home/claude/.npm-global/lib/node_modules/playwright/test.js');
const { launchPage, switchRole, getVisiblePage, getTopBarRole } = require('./helpers');
const path = require('path');

const APP_PATH = `file://${path.resolve(__dirname, '../app.html')}`;

test.describe('Application Load', () => {
  let browser, page;

  test.beforeEach(async ({ }) => {
    ({ browser, page } = await launchPage());
  });

  test.afterEach(async () => {
    await browser.close();
  });

  test('app loads without errors', async () => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(APP_PATH);
    await page.waitForLoadState('domcontentloaded');
    expect(errors).toHaveLength(0);
  });

  test('shows HomeGuard branding in topbar', async () => {
    const logoText = await page.textContent('.logo-text');
    expect(logoText).toContain('Home');
    expect(logoText).toContain('Guard');
  });

  test('defaults to Claimant role on load', async () => {
    const roleBadge = await getTopBarRole(page);
    expect(roleBadge.trim()).toBe('Claimant');
  });

  test('defaults to claimant dashboard page on load', async () => {
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('claimant-dashboard');
  });

  test('role switcher shows all 4 roles', async () => {
    const buttons = await page.$$('.role-btn');
    expect(buttons.length).toBe(4);
    const labels = await Promise.all(buttons.map(b => b.textContent()));
    expect(labels.join(' ')).toContain('Claimant');
    expect(labels.join(' ')).toContain('Reviewer');
    expect(labels.join(' ')).toContain('Approver');
    expect(labels.join(' ')).toContain('Admin');
  });

  test('sidebar renders on load', async () => {
    const sidebar = await page.$('.sidebar');
    expect(sidebar).not.toBeNull();
    const navItems = await page.$$('.nav-item');
    expect(navItems.length).toBeGreaterThan(0);
  });

  test('stat cards are visible on claimant dashboard', async () => {
    const statCards = await page.$$('.stat-card');
    expect(statCards.length).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Role Switching', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
  });
  test.afterEach(async () => { await browser.close(); });

  test('switching to Reviewer role updates topbar badge', async () => {
    await switchRole(page, 'reviewer');
    const badge = await getTopBarRole(page);
    expect(badge.trim()).toBe('Reviewer');
  });

  test('switching to Reviewer shows reviewer queue page', async () => {
    await switchRole(page, 'reviewer');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('reviewer-queue');
  });

  test('switching to Approver role updates topbar badge', async () => {
    await switchRole(page, 'approver');
    const badge = await getTopBarRole(page);
    expect(badge.trim()).toBe('Approver');
  });

  test('switching to Approver shows approver dashboard', async () => {
    await switchRole(page, 'approver');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('approver-dashboard');
  });

  test('switching to Admin role updates topbar badge', async () => {
    await switchRole(page, 'admin');
    const badge = await getTopBarRole(page);
    expect(badge.trim()).toBe('Admin');
  });

  test('switching to Admin shows admin dashboard', async () => {
    await switchRole(page, 'admin');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('admin-dashboard');
  });

  test('switching role updates user name in topbar', async () => {
    await switchRole(page, 'reviewer');
    const name = await page.textContent('#topName');
    expect(name.trim()).toBe('Michael R.');
  });

  test('switching role updates avatar initials', async () => {
    await switchRole(page, 'approver');
    const initials = await page.textContent('#topAvatar');
    expect(initials.trim()).toBe('DP');
  });

  test('active role button is highlighted', async () => {
    await switchRole(page, 'reviewer');
    const activeClass = await page.evaluate(() => {
      const btns = document.querySelectorAll('.role-btn');
      for (const b of btns) {
        if (b.textContent.includes('Reviewer') && b.classList.contains('active')) return true;
      }
      return false;
    });
    expect(activeClass).toBe(true);
  });

  test('switching roles updates sidebar nav items', async () => {
    await switchRole(page, 'admin');
    const navText = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.nav-item')).map(n => n.textContent.trim()).join(' ')
    );
    expect(navText).toContain('Overview');
    expect(navText).toContain('Users');
  });
});
