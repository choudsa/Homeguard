# HomeGuard Insurance Claims — Test Suite

Automated end-to-end test suite for the HomeGuard property insurance claims application,
built with **Playwright** and **Chromium**.

## 122 tests across 5 spec files

| File | Coverage |
|---|---|
| `01-page-load.spec.js` | App load, branding, defaults, role switching (17 tests) |
| `02-claimant.spec.js` | Dashboard, claim submission, success flow, detail view (27 tests) |
| `03-reviewer.spec.js` | Review queue, claim detail, send-to-approver flow (22 tests) |
| `04-approver-admin.spec.js` | Approve/reject decisions, admin dashboard, user management (36 tests) |
| `05-ui-components.spec.js` | Status badges, navigation, modals, accessibility basics (20 tests) |

---

## Setup

No npm install needed — the suite uses the globally installed Playwright.

Make sure your `app.html` is in this directory (it's copied automatically when you
run the tests from Claude).

---

## Running Tests

### Single run
```bash
node run-tests.js
```

### Watch mode — re-runs whenever app.html changes
```bash
node run-tests.js --watch
```

### Via npm scripts
```bash
npm test           # single run
npm run test:watch # watch mode
```

---

## File Structure

```
insurance-tests/
├── app.html                  ← your application (copy here to test)
├── playwright.config.js      ← Playwright configuration
├── run-tests.js              ← main runner + watch mode
├── package.json
├── README.md
└── tests/
    ├── helpers.js            ← shared utilities (launchPage, switchRole, etc.)
    ├── 01-page-load.spec.js  ← load & role switching tests
    ├── 02-claimant.spec.js   ← claimant flow tests
    ├── 03-reviewer.spec.js   ← reviewer flow tests
    ├── 04-approver-admin.spec.js ← approver & admin tests
    └── 05-ui-components.spec.js  ← UI components & accessibility
```

---

## What's Tested

**Application Load**
- Loads without JS errors
- Correct branding (HomeGuard logo)
- Defaults to Claimant role and dashboard

**Role Switching**
- All 4 roles: Claimant, Reviewer, Approver, Admin
- Topbar badge, user name, avatar initials update
- Correct default page per role
- Sidebar nav items update per role

**Claimant Flows**
- Claim history table with status badges
- New claim form (all fields, dropdowns, upload zone, checkbox)
- Form submission → success screen → back to dashboard
- Claim detail: timeline, progress bar, reviewer info, documents

**Reviewer Flows**
- Queue with SLA warning, filters, badge count
- Claim detail: coverage check, risk flags, assessment form
- Send to Approver modal (open, cancel, confirm)

**Approver Flows**
- Dashboard with pending claims and recommendations
- Approve modal (shows payout, cancel, confirm → return to dashboard)
- Reject modal (reason textarea, confirm → return to dashboard)
- Financial impact and risk summary sidebars

**Admin Flows**
- System-wide metrics dashboard
- Reviewer workload and claims-by-type tables
- User management table with all four roles
- Add User modal (fields, role dropdown, cancel)

**UI Components**
- Status badge classes (pending, review, approved, rejected)
- Active nav state, sidebar updates on role switch
- Modal open/close behaviour (button and overlay click)
- Table structure (thead/tbody present)
- Basic accessibility (lang attr, label associations, button text)

---

## Adding New Tests

1. Create a new file in `tests/` named `NN-description.spec.js`
2. Import helpers: `const { launchPage, switchRole, getVisiblePage } = require('./helpers');`
3. Use `const { test, expect } = require('/home/claude/.npm-global/lib/node_modules/playwright/test.js');`
4. Write `test.describe` blocks with `beforeEach`/`afterEach` to open/close the browser

The test runner picks up all `*.spec.js` files automatically.
