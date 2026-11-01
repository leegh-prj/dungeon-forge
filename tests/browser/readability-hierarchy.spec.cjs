const {test,expect}=require('@playwright/test');
for(const [width,height] of [[390,844],[844,390]])test('information hierarchy '+width+'x'+height,async({page})=>{
 await page.setViewportSize({width,height});await page.goto('/');
 await page.locator('#nav button').filter({hasText:'던전'}).click();
 await expect(page.locator('.combatStateLabel')).toContainText('상태');
 await page.locator('#nav button').filter({hasText:'대장간'}).click();
 await expect(page.locator('.forgeRates summary')).toContainText('제작 확률');
 await expect(page.locator('.forgeMaterialPrice')).toBeVisible();
 await page.locator('#nav button').filter({hasText:'장비'}).click();
 await page.evaluate(()=>{storageTab='bag';render()});
 await expect(page.locator('.inventoryCountLabel')).toHaveText('가방 장비');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});
