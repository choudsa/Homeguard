// helpers.js — shared utilities for all test files
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const path = require('path');

const APP_PATH = `file://${path.resolve(__dirname, '../app.html')}`;
const CHROMIUM_EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

async function launchPage() {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_EXEC,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(APP_PATH);
  await page.waitForLoadState('domcontentloaded');
  return { browser, page };
}

async function switchRole(page, role) {
  const roleMap = { claimant: '🏠 Claimant', reviewer: '🔍 Reviewer', approver: '✅ Approver', admin: '⚙️ Admin' };
  await page.click(`.role-btn:has-text("${roleMap[role]}")`);
  await page.waitForTimeout(100);
}

async function getVisiblePage(page) {
  return page.evaluate(() => {
    const active = document.querySelector('.page.active');
    return active ? active.id : null;
  });
}

async function getTopBarRole(page) {
  return page.textContent('#topRoleBadge');
}

module.exports = { launchPage, switchRole, getVisiblePage, getTopBarRole };
