// 04-approver-admin.spec.js — Approver decisions and Admin management
const { test, expect } = require('/home/claude/.npm-global/lib/node_modules/playwright/test.js');
const { launchPage, switchRole, getVisiblePage } = require('./helpers');

test.describe('Approver — Dashboard', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await switchRole(page, 'approver');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('approver dashboard page is active', async () => {
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('approver-dashboard');
  });

  test('stat cards show approver metrics', async () => {
    const labels = await page.$$eval('#approver-dashboard .stat-label', els => els.map(e => e.textContent.trim()));
    expect(labels).toContain('Pending Approval');
    expect(labels).toContain('Avg Decision Time');
  });

  test('awaiting decision table has rows', async () => {
    const rows = await page.$$('#approver-dashboard tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  test('table shows reviewer recommendation column', async () => {
    const headers = await page.$$eval('#approver-dashboard th', ths => ths.map(th => th.textContent.trim()));
    expect(headers).toContain('Recommendation');
    expect(headers).toContain('Reviewed By');
  });

  test('Decide button navigates to approver detail', async () => {
    await page.click('#approver-dashboard tbody tr:first-child .btn-primary');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('approver-detail');
  });
});

test.describe('Approver — Decision Detail', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await switchRole(page, 'approver');
    await page.click('#approver-dashboard tbody tr:first-child .btn-primary');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('approver detail page is active', async () => {
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('approver-detail');
  });

  test('reviewer notes are shown', async () => {
    const text = await page.textContent('#approver-detail');
    expect(text).toContain('Reviewer Notes');
  });

  test('final decision dropdown is present', async () => {
    const sel = await page.$('#finalDecision');
    expect(sel).not.toBeNull();
  });

  test('final decision dropdown has approve and reject options', async () => {
    const options = await page.$$eval('#finalDecision option', opts => opts.map(o => o.text));
    expect(options.some(o => o.includes('Approve'))).toBe(true);
    expect(options.some(o => o.includes('Reject'))).toBe(true);
  });

  test('approval notes textarea has pre-filled content', async () => {
    const textareas = await page.$$('#approver-detail textarea');
    const lastVal = await textareas[textareas.length - 1].evaluate(el => el.value);
    expect(lastVal.length).toBeGreaterThan(0);
  });

  test('Approve button is present', async () => {
    const btn = await page.$('#approver-detail .btn-success');
    expect(btn).not.toBeNull();
  });

  test('Reject button is present', async () => {
    const btn = await page.$('#approver-detail .btn-danger');
    expect(btn).not.toBeNull();
  });

  test('Approve button opens confirmation modal', async () => {
    await page.click('#approver-detail .btn-success');
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-finalApprove.open');
    expect(modal).not.toBeNull();
  });

  test('approve modal shows payout amount', async () => {
    await page.click('#approver-detail .btn-success');
    await page.waitForTimeout(100);
    const text = await page.textContent('#modal-finalApprove');
    expect(text).toContain('$12,700');
  });

  test('approve modal can be cancelled', async () => {
    await page.click('#approver-detail .btn-success');
    await page.waitForTimeout(100);
    await page.click('#modal-finalApprove .btn-ghost');
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-finalApprove.open');
    expect(modal).toBeNull();
  });

  test('confirming approval returns to dashboard', async () => {
    await page.click('#approver-detail .btn-success');
    await page.waitForTimeout(100);
    await page.click('#modal-finalApprove .btn-success');
    await page.waitForTimeout(100);
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('approver-dashboard');
  });

  test('Reject button opens rejection modal', async () => {
    await page.click('#approver-detail .btn-danger');
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-finalReject.open');
    expect(modal).not.toBeNull();
  });

  test('rejection modal has reason textarea', async () => {
    await page.click('#approver-detail .btn-danger');
    await page.waitForTimeout(100);
    const textarea = await page.$('#modal-finalReject textarea');
    expect(textarea).not.toBeNull();
  });

  test('confirming rejection returns to dashboard', async () => {
    await page.click('#approver-detail .btn-danger');
    await page.waitForTimeout(100);
    await page.click('#modal-finalReject .btn-danger');
    await page.waitForTimeout(100);
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('approver-dashboard');
  });

  test('financial impact sidebar shows net payout', async () => {
    const text = await page.textContent('#approver-detail');
    expect(text).toContain('Financial Impact');
    expect(text).toContain('$12,700');
  });

  test('risk summary section is shown', async () => {
    const text = await page.textContent('#approver-detail');
    expect(text).toContain('Risk Summary');
  });

  test('Back button returns to approver dashboard', async () => {
    await page.click('#approver-detail .btn-ghost:has-text("Back")');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('approver-dashboard');
  });
});

test.describe('Admin — Dashboard', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await switchRole(page, 'admin');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('admin dashboard page is active', async () => {
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('admin-dashboard');
  });

  test('stat cards show system metrics', async () => {
    const labels = await page.$$eval('#admin-dashboard .stat-label', els => els.map(e => e.textContent.trim()));
    expect(labels).toContain('Total Active Claims');
    expect(labels).toContain('SLA Breaches');
  });

  test('SLA breach alert is shown', async () => {
    const alert = await page.$('#admin-dashboard .alert-warning');
    expect(alert).not.toBeNull();
  });

  test('reviewer workload table is shown', async () => {
    const text = await page.textContent('#admin-dashboard');
    expect(text).toContain('Reviewer Workload');
  });

  test('claims by type table is shown', async () => {
    const text = await page.textContent('#admin-dashboard');
    expect(text).toContain('Claims by Type');
  });

  test('"Manage Users" button navigates to users page', async () => {
    await page.click('#admin-dashboard .btn-primary:has-text("Manage Users")');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('admin-users');
  });
});

test.describe('Admin — User Management', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await switchRole(page, 'admin');
    await page.click('#admin-dashboard .btn-primary:has-text("Manage Users")');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('users table has rows', async () => {
    const rows = await page.$$('#admin-users tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  test('users table shows role badges', async () => {
    const badges = await page.$$('#admin-users .badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  test('users table shows all four roles', async () => {
    const text = await page.textContent('#admin-users');
    expect(text).toContain('Claimant');
    expect(text).toContain('Reviewer');
    expect(text).toContain('Approver');
    expect(text).toContain('Admin');
  });

  test('"Add User" button opens modal', async () => {
    await page.click('#admin-users .btn-primary:has-text("Add User")');
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-addUser.open');
    expect(modal).not.toBeNull();
  });

  test('add user modal has name fields', async () => {
    await page.click('#admin-users .btn-primary:has-text("Add User")');
    await page.waitForTimeout(100);
    const inputs = await page.$$('#modal-addUser input');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  test('add user modal has role dropdown', async () => {
    await page.click('#admin-users .btn-primary:has-text("Add User")');
    await page.waitForTimeout(100);
    const sel = await page.$('#modal-addUser select');
    expect(sel).not.toBeNull();
    const options = await sel.$$eval('option', opts => opts.map(o => o.text));
    expect(options).toContain('Reviewer');
    expect(options).toContain('Admin');
  });

  test('add user modal closes on Cancel', async () => {
    await page.click('#admin-users .btn-primary:has-text("Add User")');
    await page.waitForTimeout(100);
    await page.click('#modal-addUser .btn-ghost');
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-addUser.open');
    expect(modal).toBeNull();
  });

  test('search input is present', async () => {
    const searchInput = await page.$('#admin-users input[type="text"]');
    expect(searchInput).not.toBeNull();
  });
});
