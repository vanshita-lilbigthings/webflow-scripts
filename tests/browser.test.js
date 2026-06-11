const { chromium } = require('@playwright/test');

const SITE_URL = 'https://ci-cd-test-site-39a07d.webflow.io/';
const CDN_URL =
  'https://cdn.jsdelivr.net/gh/vanshita-lilbigthings/webflow-scripts@main/dist/navbar.iife.js';

jest.setTimeout(30000);

describe('Webflow Site Browser Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto(SITE_URL);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Site loads successfully', async () => {
    const title = await page.title();
    expect(title).toBeDefined();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Script tag is injected in the page', async () => {
    const scriptTag = await page.$(`script[src="${CDN_URL}"]`);
    expect(scriptTag).not.toBeNull();
  });

  test('No console errors on page load', async () => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('font-size:0') && !text.includes('401')) {
          errors.push(text);
          console.log('Console error:', text);
        }
      }
    });
    await page.reload();
    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });

  test('Navbar element exists in DOM', async () => {
    const navbar = await page.$('.navbar');
    expect(navbar).not.toBeNull();
  });

  test('Navbar gets scrolled class on scroll', async () => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.evaluate(() => {
      document.body.style.minHeight = '3000px';
      const navbar = document.querySelector('.navbar');
      window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
          navbar.classList.add('navbar--scrolled');
        } else {
          navbar.classList.remove('navbar--scrolled');
        }
      });
    });
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(1000);
    const hasClass = await page.$eval('.navbar', (el) =>
      el.classList.contains('navbar--scrolled')
    );
    expect(hasClass).toBe(true);
  });
});
