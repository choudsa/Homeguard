#!/usr/bin/env node
/**
 * run-tests.js
 * Run the full Playwright test suite for the HomeGuard Insurance Claims App.
 *
 * Usage:
 *   node run-tests.js           # single run
 *   node run-tests.js --watch   # re-run when index.html changes
 *   node run-tests.js --file 01 # run only tests matching a pattern
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Resolve the playwright CLI — prefer a local install, fall back to global
const LOCAL_PW   = path.resolve(__dirname, 'node_modules/.bin/playwright');
const GLOBAL_PW  = '/home/claude/.npm-global/lib/node_modules/playwright/cli.js';
const playwrightCli = fs.existsSync(LOCAL_PW) ? LOCAL_PW : `node ${GLOBAL_PW}`;

const CONFIG    = path.resolve(__dirname, 'playwright.config.js');
const APP_FILE  = path.resolve(__dirname, 'index.html');
const RESULTS   = path.resolve(__dirname, 'test-results.json');

const args       = process.argv.slice(2);
const watchMode  = args.includes('--watch');
const fileFilter = (() => { const i = args.indexOf('--file'); return i !== -1 ? args[i + 1] : null; })();

function banner(label) {
  const line = '═'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  HomeGuard Insurance — Playwright Test Suite`);
  console.log(`  ${label}`);
  console.log(`${line}\n`);
}

function runTests() {
  const startMs = Date.now();
  const stamp   = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  banner(stamp);

  const grepArg = fileFilter ? ` --grep "${fileFilter}"` : '';
  const cmd     = `${playwrightCli} test --config=${CONFIG}${grepArg}`;

  let passed = false;
  try {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } });
    passed = true;
  } catch {
    // execSync throws on non-zero exit; test output already printed above
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);

  if (passed) {
    console.log(`\n✅  All tests passed  (${elapsed}s)\n`);
  } else {
    console.log(`\n❌  Some tests failed  (${elapsed}s)\n`);
    console.log(`   Review output above, or open test-report/index.html for the HTML report.\n`);
  }

  // Print quick summary from JSON results if available
  if (fs.existsSync(RESULTS)) {
    try {
      const data   = JSON.parse(fs.readFileSync(RESULTS, 'utf8'));
      const suites = data.suites || [];
      let total = 0, ok = 0, fail = 0, skip = 0;
      (function walk(suite) {
        (suite.specs || []).forEach(spec => {
          spec.tests.forEach(t => {
            total++;
            const outcome = t.results?.[0]?.status;
            if (outcome === 'passed') ok++;
            else if (outcome === 'skipped') skip++;
            else fail++;
          });
        });
        (suite.suites || []).forEach(walk);
      })(data);
      console.log(`  Summary: ${ok} passed, ${fail} failed, ${skip} skipped out of ${total} tests\n`);
    } catch { /* ignore parse errors */ }
  }
}

// ── Single run ────────────────────────────────────────────
runTests();

// ── Watch mode ────────────────────────────────────────────
if (watchMode) {
  if (!fs.existsSync(APP_FILE)) {
    console.warn(`⚠  Watch target not found: ${APP_FILE}`);
  } else {
    console.log(`👀  Watching index.html for changes…\n`);
    let debounce;
    fs.watch(APP_FILE, () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        console.log('🔄  index.html changed — re-running tests…');
        runTests();
      }, 500);
    });
  }
}
