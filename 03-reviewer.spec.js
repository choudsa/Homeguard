// 03-reviewer.spec.js — Reviewer role: queue, detail, send to approver
const { test, expect } = require('/home/claude/.npm-global/lib/node_modules/playwright/test.js');
const { launchPage, switchRole, getVisiblePage } = require('./helpers');

test.describe('Reviewer — Queue', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await switchRole(page, 'reviewer');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('reviewer queue page is active', async () => {
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('reviewer-queue');
  });

  test('queue shows claims table', async () => {
    const rows = await page.$$('#reviewer-queue tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  test('queue table has correct columns', async () => {
    const headers = await page.$$eval('#reviewer-queue th', ths => ths.map(th => th.textContent.trim()));
    expect(headers).toContain('Claim ID');
    expect(headers).toContain('Claimant');
    expect(headers).toContain('SLA');
    expect(headers).toContain('Status');
  });

  test('SLA warning alert is shown', async () => {
    const alert = await page.$('#reviewer-queue .alert-warning');
    expect(alert).not.toBeNull();
    const text = await alert.textContent();
    expect(text).toContain('SLA');
  });

  test('stat cards show correct labels', async () => {
    const labels = await page.$$eval('#reviewer-queue .stat-label', els => els.map(e => e.textContent.trim()));
    expect(labels).toContain('Assigned to Me');
    expect(labels).toContain('Near SLA');
  });

  test('filter dropdowns are present', async () => {
    const selects = await page.$$('#reviewer-queue select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  test('Review button navigates to claim detail', async () => {
    await page.click('#reviewer-queue tbody tr:first-child .btn-primary');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('reviewer-detail');
  });

  test('sidebar shows badge count', async () => {
    const badge = await page.$('.nav-badge');
    expect(badge).not.toBeNull();
  });
});

test.describe('Reviewer — Claim Detail', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await switchRole(page, 'reviewer');
    await page.click('#reviewer-queue tbody tr:first-child .btn-primary');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('reviewer detail page is active', async () => {
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('reviewer-detail');
  });

  test('policy coverage section is shown', async () => {
    const text = await page.textContent('#reviewer-detail');
    expect(text).toContain('Policy Coverage Check');
  });

  test('coverage shows Fire Damage as covered', async () => {
    const text = await page.textContent('#reviewer-detail');
    expect(text).toContain('Fire Damage');
    expect(text).toContain('Covered');
  });

  test('risk flags section is present', async () => {
    const text = await page.textContent('#reviewer-detail');
    expect(text).toContain('Risk Flags');
  });

  test('reviewer assessment form fields exist', async () => {
    const selects = await page.$$('#reviewer-detail select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    const textareas = await page.$$('#reviewer-detail textarea');
    expect(textareas.length).toBeGreaterThan(0);
  });

  test('reviewer notes textarea has pre-filled content', async () => {
    const noteText = await page.$eval('#reviewer-detail textarea', el => el.value);
    expect(noteText.length).toBeGreaterThan(0);
  });

  test('"Send to Approver" button is present', async () => {
    const btn = await page.$('#reviewer-detail .btn-primary:has-text("Send to Approver")');
    expect(btn).not.toBeNull();
  });

  test('"Flag as Suspicious" button is present', async () => {
    const btn = await page.$('#reviewer-detail .btn-danger');
    expect(btn).not.toBeNull();
  });

  test('Send to Approver opens confirmation modal', async () => {
    await page.click('#reviewer-detail .btn-primary:has-text("Send to Approver")');
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-sendApproval.open');
    expect(modal).not.toBeNull();
  });

  test('modal can be closed with Cancel', async () => {
    await page.click('#reviewer-detail .btn-primary:has-text("Send to Approver")');
    await page.waitForTimeout(100);
    await page.click('#modal-sendApproval .btn-ghost');
    await page.waitForTimeout(100);
    const modal = await page.$('#modal-sendApproval.open');
    expect(modal).toBeNull();
  });

  test('confirming send to approver returns to queue', async () => {
    await page.click('#reviewer-detail .btn-primary:has-text("Send to Approver")');
    await page.waitForTimeout(100);
    await page.click('#modal-sendApproval .btn-primary');
    await page.waitForTimeout(100);
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('reviewer-queue');
  });

  test('SLA status card is shown', async () => {
    const text = await page.textContent('#reviewer-detail');
    expect(text).toContain('SLA Status');
  });

  test('Back button returns to reviewer queue', async () => {
    await page.click('#reviewer-detail .btn-ghost:has-text("Back")');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('reviewer-queue');
  });

  test('documents are listed in detail', async () => {
    const docs = await page.$$('#reviewer-detail .badge-info');
    expect(docs.length).toBeGreaterThan(0);
  });
});
