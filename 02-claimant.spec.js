// 02-claimant.spec.js — Claimant role: dashboard, submission, detail view
const { test, expect } = require('/home/claude/.npm-global/lib/node_modules/playwright/test.js');
const { launchPage, switchRole, getVisiblePage } = require('./helpers');

test.describe('Claimant — Dashboard', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
  });
  test.afterEach(async () => { await browser.close(); });

  test('shows claim history table with rows', async () => {
    const rows = await page.$$('#claimant-dashboard tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });

  test('table has expected columns', async () => {
    const headers = await page.$$eval('#claimant-dashboard th', ths => ths.map(th => th.textContent.trim()));
    expect(headers).toContain('Claim ID');
    expect(headers).toContain('Status');
    expect(headers).toContain('Amount');
  });

  test('claim rows contain status badges', async () => {
    const badges = await page.$$('#claimant-dashboard .badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  test('stat cards show numeric values', async () => {
    const values = await page.$$eval('#claimant-dashboard .stat-value', els => els.map(e => e.textContent.trim()));
    expect(values.some(v => /\d/.test(v))).toBe(true);
  });

  test('"New Claim" button navigates to submit page', async () => {
    await page.click('#claimant-dashboard .btn-primary');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('claimant-submit');
  });

  test('clicking claim row navigates to detail view', async () => {
    await page.click('#claimant-dashboard td.clickable');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('claimant-detail');
  });

  test('View button on claim row navigates to detail', async () => {
    await page.click('#claimant-dashboard tbody tr:first-child .btn-ghost');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('claimant-detail');
  });
});

test.describe('Claimant — Submit Claim', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await page.click('#claimant-dashboard .btn-primary');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('submit form is visible', async () => {
    const form = await page.$('#submitFormWrap');
    const visible = await form.isVisible();
    expect(visible).toBe(true);
  });

  test('form has Incident Date field', async () => {
    const field = await page.$('input[type="date"]');
    expect(field).not.toBeNull();
  });

  test('form has Incident Type dropdown', async () => {
    const options = await page.$$eval('#claimant-submit select', sels =>
      Array.from(sels[0].options).map(o => o.text)
    );
    expect(options).toContain('Fire Damage');
    expect(options).toContain('Water / Flood Damage');
  });

  test('form has Property Address field', async () => {
    const inputs = await page.$$('#claimant-submit input[type="text"]');
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('form has Description textarea', async () => {
    const textareas = await page.$$('#claimant-submit textarea');
    expect(textareas.length).toBeGreaterThan(0);
  });

  test('form has Damage Amount number field', async () => {
    const numInput = await page.$('#claimant-submit input[type="number"]');
    expect(numInput).not.toBeNull();
  });

  test('form has upload zone', async () => {
    const zone = await page.$('.upload-zone');
    expect(zone).not.toBeNull();
  });

  test('form has declaration checkbox', async () => {
    const checkbox = await page.$('#claimant-submit input[type="checkbox"]');
    expect(checkbox).not.toBeNull();
  });

  test('Submit button triggers success screen', async () => {
    await page.click('#claimant-submit .btn-primary');
    await page.waitForTimeout(200);
    const successVisible = await page.isVisible('#submitSuccess');
    expect(successVisible).toBe(true);
  });

  test('success screen shows claim ID', async () => {
    await page.click('#claimant-submit .btn-primary');
    await page.waitForTimeout(200);
    const text = await page.textContent('#submitSuccess');
    expect(text).toContain('#HG-2025-0047');
  });

  test('success screen has back button', async () => {
    await page.click('#claimant-submit .btn-primary');
    await page.waitForTimeout(200);
    const btn = await page.$('#submitSuccess .btn-primary');
    expect(btn).not.toBeNull();
  });

  test('success "Back to Claims" returns to dashboard', async () => {
    await page.click('#claimant-submit .btn-primary');
    await page.waitForTimeout(200);
    await page.click('#submitSuccess .btn-primary');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('claimant-dashboard');
  });

  test('Cancel button returns to dashboard', async () => {
    await page.click('#claimant-submit .btn-ghost:has-text("Cancel")');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('claimant-dashboard');
  });
});

test.describe('Claimant — Claim Detail', () => {
  let browser, page;

  test.beforeEach(async () => {
    ({ browser, page } = await launchPage());
    await page.click('#claimant-dashboard td.clickable');
    await page.waitForTimeout(100);
  });
  test.afterEach(async () => { await browser.close(); });

  test('detail page shows claim ID', async () => {
    const text = await page.textContent('#claimant-detail');
    expect(text).toContain('#HG-2024-0041');
  });

  test('detail page shows claim status badge', async () => {
    const badge = await page.$('#claimant-detail .badge');
    expect(badge).not.toBeNull();
  });

  test('detail page shows timeline', async () => {
    const timeline = await page.$$('#claimant-detail .tl-item');
    expect(timeline.length).toBeGreaterThan(0);
  });

  test('detail page shows progress bar', async () => {
    const progress = await page.$('#claimant-detail .progress-bar-fill');
    expect(progress).not.toBeNull();
  });

  test('detail page shows assigned reviewer info', async () => {
    const text = await page.textContent('#claimant-detail');
    expect(text).toContain('Michael R.');
  });

  test('Back button returns to dashboard', async () => {
    await page.click('#claimant-detail .btn-ghost');
    const activePage = await getVisiblePage(page);
    expect(activePage).toBe('claimant-dashboard');
  });

  test('detail page shows documents list', async () => {
    const docs = await page.$$('#claimant-detail .badge-info');
    expect(docs.length).toBeGreaterThan(0);
  });
});
