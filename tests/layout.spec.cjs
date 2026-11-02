const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'portrait-small', width: 360, height: 740 },
  { name: 'portrait-standard', width: 390, height: 844 },
  { name: 'landscape-mobile', width: 844, height: 390 },
  { name: 'landscape-tablet', width: 1024, height: 600 },
  { name: 'desktop', width: 1280, height: 800 }
];
const screens = ['던전', '대장간', '장비', '도감', '상점'];
for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    test('first render: visible content, no horizontal overflow', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#screen')).not.toBeEmpty();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 3)).toBe(true);
      await expect(page.locator('.screenheader')).toBeVisible();
      expect(pageErrors).toEqual([]);
      const nav = page.locator('#nav button');
      await expect.poll(() => nav.count()).toBeGreaterThanOrEqual(5);
    });
    for (const screen of screens) {
      test(screen + ': controls remain inside viewport', async ({ page }) => {
        const pageErrors = [];
        page.on('pageerror', error => pageErrors.push(error.message));
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.locator('#nav button').filter({ hasText: screen }).click();
        await expect(page.locator('#nav button.active')).toContainText(screen);
        await expect(page.locator('#screen')).not.toBeEmpty();
        expect(pageErrors, 'navigation must not throw JS errors').toEqual([]);
        await page.locator('#screen img').evaluateAll(async images => { await Promise.all(images.filter(img => img.getClientRects().length && !img.closest('[hidden]')).map(img => img.decode().catch(() => {}))); });
        const bad = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          return [...document.querySelectorAll('#screen button')].filter(el => {
            if (!el.getClientRects().length || el.closest('[hidden]')) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.left < -3 || r.right > width + 3);
          }).slice(0, 5).map(el => ({ text: el.textContent.trim().slice(0, 40), x: Math.round(el.getBoundingClientRect().x), right:Math.round(el.getBoundingClientRect().right), width:Math.round(el.getBoundingClientRect().width), viewport:width, className:el.className, parent:el.parentElement?.className }));
        });
        expect(bad).toEqual([]);
        const missingImages = await page.evaluate(() => [...document.querySelectorAll('#screen img')].filter(img => img.complete && img.naturalWidth === 0 && img.getClientRects().length && !img.closest('[hidden]')).slice(0, 8).map(img => img.getAttribute('src')));
        expect(missingImages, 'visible broken image URLs').toEqual([]);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 3)).toBe(true);
      });
    }
  });
}
