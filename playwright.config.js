const path = require('path');

let defineConfig;
try {
  ({ defineConfig } = require('@playwright/test'));
} catch {
  ({ defineConfig } = require('/home/claude/.npm-global/lib/node_modules/playwright/test.js'));
}

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  retries: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
    ['html', { outputFolder: 'test-report', open: 'never' }],
  ],
  use: {
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
    baseURL: `file://${path.resolve(__dirname, 'index.html')}`,
    headless: true,
  },
});
