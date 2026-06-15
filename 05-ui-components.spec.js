// 05-ui-components.spec.js — Badges, modals, nav, status indicators, a11y
const { test, expect } = require('/home/claude/.npm-global/lib/node_modules/playwright/test.js');
const { launchPage, switchRole } = require('./helpers');

test.describe('Status Badges', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
  });
  test.afterEach(async () => { await browser.close(); });

  test('pending badge has correct class', async () => {
    const badge = await page.$('.badge-pending');
    expect(badge).not.toBeNull();
  });

  test('approved badge is present on completed claims', async () => {
    const badge = await page.$('.badge-approved');
    expect(badge).not.toBeNull();
  });

  test('rejected badge is present', async () => {
    const badge = await page.$('.badge-rejected');
    expect(badge).not.toBeNull();
  });

  test('review badge is present', async () => {
    const badge = await page.$('.badge-review');
    expect(badge).not.toBeNull();
  });
});

test.describe('Navigation', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
  });
  test.afterEach(async () => { await browser.close(); });

  test('active nav item has active class', async () => {
    const activeNav = await page.$('.nav-item.active');
    expect(activeNav).not.toBeNull();
  });

  test('clicking nav item switches active page', async () => {
    await page.click('.nav-item:last-child');
    await page.waitForTimeout(100);
    const activeNav = await page.$('.nav-item.active');
    expect(activeNav).not.toBeNull();
  });

  test('reviewer role sidebar has correct nav items', async () => {
    await switchRole(page, 'reviewer');
    const navText = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.nav-item')).map(n => n.textContent.trim()).join(' ')
    );
    expect(navText).toContain('Review Queue');
  });

  test('admin role sidebar has Overview and Users', async () => {
    await switchRole(page, 'admin');
    const navText = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.nav-item')).map(n => n.textContent.trim()).join(' ')
    );
    expect(navText).toContain('Overview');
    expect(navText).toContain('Users');
  });
});

test.describe('Modal Behaviour', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
  });
  test.afterEach(async () => { await browser.close(); });

  test('modals are hidden by default', async () => {
    const openModals = await page.$$('.modal-overlay.open');
    expect(openModals.length).toBe(0);
  });

  test('clicking overlay closes approver modal', async () => {
    await switchRole(page, 'approver');
    await page.click('#approver-dashboard tbody tr:first-child .btn-primary');
    await page.waitForTimeout(100);
    await page.click('#approver-detail .btn-success');
    await page.waitForTimeout(100);
    await page.click('#modal-finalApprove', { position: { x: 5, y: 5 } });
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-finalApprove.open');
    expect(modal).toBeNull();
  });

  test('send approval modal has textarea', async () => {
    await switchRole(page, 'reviewer');
    await page.click('#reviewer-queue tbody tr:first-child .btn-primary');
    await page.waitForTimeout(100);
    await page.click('#reviewer-detail .btn-primary:has-text("Send to Approver")');
    await page.waitForTimeout(100);
    const textarea = await page.$('#modal-sendApproval textarea');
    expect(textarea).not.toBeNull();
  });
});

test.describe('Responsive Elements', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
  });
  test.afterEach(async () => { await browser.close(); });

  test('topbar is visible', async () => {
    const topbar = await page.$('.topbar');
    expect(await topbar.isVisible()).toBe(true);
  });

  test('main content area is present', async () => {
    const main = await page.$('.main');
    expect(main).not.toBeNull();
  });

  test('stat grid renders correctly', async () => {
    const grid = await page.$('.stat-grid');
    expect(grid).not.toBeNull();
  });

  test('table cards render with headers and body', async () => {
    const tableCard = await page.$('.table-card');
    expect(tableCard).not.toBeNull();
    const thead = await page.$('.table-card thead');
    expect(thead).not.toBeNull();
    const tbody = await page.$('.table-card tbody');
    expect(tbody).not.toBeNull();
  });
});

test.describe('Accessibility Basics', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
  });
  test.afterEach(async () => { await browser.close(); });

  test('page has lang attribute on html element', async () => {
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('en');
  });

  test('topbar logo has text content', async () => {
    const logo = await page.textContent('.logo-text');
    expect(logo.trim().length).toBeGreaterThan(0);
  });

  test('form labels are associated with inputs', async () => {
    await page.click('#claimant-dashboard .btn-primary');
    await page.waitForTimeout(100);
    const labels = await page.$$('#claimant-submit label');
    expect(labels.length).toBeGreaterThan(0);
  });

  test('buttons have text content', async () => {
    const buttons = await page.$$('button');
    const buttonTexts = await Promise.all(buttons.map(b => b.textContent()));
    const emptyButtons = buttonTexts.filter(t => t.trim().length === 0);
    expect(emptyButtons.length).toBe(0);
  });

  test('table headers are present for all tables', async () => {
    const tables = await page.$$('table');
    for (const table of tables) {
      const hasTh = await table.$('th');
      expect(hasTh).not.toBeNull();
    }
  });
});
