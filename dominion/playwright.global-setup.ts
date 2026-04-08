// playwright-extra is a drop-in replacement for playwright,
// it augments the installed playwright with plugin functionality
import { chromium } from 'playwright-extra';
// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import * as path from 'path';

import { baseURL } from './playwright.config';
import { player1, player2 } from './playwright.test-users';

const setupVideoDirectory = './test-results/global-setup';
const setupTracesArchivePath = './test-results/global-setup/traces.zip';

// Add the plugin to playwright
chromium.use(StealthPlugin());

async function loginUser(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  user: { login: string; password: string },
  storageStatePath: string,
): Promise<void> {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: { dir: setupVideoDirectory },
  });
  const page = await context.newPage();

  try {
    await context.tracing.start({
      sources: true,
      snapshots: true,
      screenshots: true,
    });

    // Open log in page on tested site
    await page.goto(`${baseURL}`);

    await page.getByRole('button', { name: 'ลงชื่อเข้าใช้ด้วย Google' }).click();

    // @react-oauth/google renders the button inside an iframe from accounts.google.com
    // Wait for that iframe to appear, then click it
    await page.waitForSelector('iframe[src*="accounts.google.com"]');

    // debug: print all iframe attributes to verify selector
    const iframes = await page.locator('iframe').all();
    for (const iframe of iframes) {
      const src = await iframe.getAttribute('src');
      const title = await iframe.getAttribute('title');
      console.log(`[debug] iframe src=${src} title=${title}`);await page.goto('http://localhost:5173/');
    }

    await page.frameLocator('iframe[src*="accounts.google.com"]')
      .getByRole('button')
      .click();

    // Click redirects page to Google auth form,
    // parse https://accounts.google.com/ page
    const html = await page.locator('body').innerHTML();

    // Determine type of Google sign in form
    if (html.includes('aria-label="Google"')) {
      // Old Google sign in form
      await page.fill('#Email', user.login);
      await page.locator('#next').click();
      await page.fill('#password', user.password);
      await page.locator('#submit').click();
    } else {
      // New Google sign in form
      await page.fill('input[type="email"]', user.login);
      await page.locator('#identifierNext >> button').click();
      await page.fill('#password >> input[type="password"]', user.password);
      await page.locator('button >> nth=1').click();
    }

    // Wait for redirect back to home page after authentication
    await page.waitForURL(`${baseURL}/?check_logged_in=1`);

    // Ensure directory exists before saving
    fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

    // Save signed in state for this user
    await page.context().storageState({ path: storageStatePath });
  } catch (error) {
    await context.tracing.stop({ path: setupTracesArchivePath });
    throw error;
  } finally {
    await context.close();
  }
}

// Global setup
// https://playwright.dev/docs/test-advanced#global-setup-and-teardown
async function globalSetup(): Promise<void> {
  const browser = await chromium.launch({ headless: true });

  try {
    await loginUser(browser, player1, './setup/player1-storage-state.json');
    await loginUser(browser, player2, './setup/player2-storage-state.json');
  } finally {
    await browser.close();
  }
}

export default globalSetup;
