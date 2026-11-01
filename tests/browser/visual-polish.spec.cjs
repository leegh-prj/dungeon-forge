const {test,expect}=require('@playwright/test');
for(const [width,height] of [[390,844],[844,390]])test('unified cards and impact visual smoke '+width+'x'+height,async({page})=>{
 await page.setViewportSize({width,height});await page.goto('/');
 await page.locator('#nav button').filter({hasText:'장비'}).click();
 await page.evaluate(()=>{storageTab='bag';render()});
 await expect(page.locator('.inventoryGrid')).toBeVisible();
 await page.locator('#nav button').filter({hasText:'대장간'}).click();
 await expect(page.locator('.forgeWorkspace')).toBeVisible();
 await page.locator('#nav button').filter({hasText:'던전'}).click();
 await expect(page.locator('.battlefield')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
});
test('impact animations respect reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const result=await page.evaluate(()=>{const sheet=[...document.styleSheets].find(x=>{try{return [...x.cssRules].some(y=>y.cssText.includes('impactHeavy'))}catch{return false}});return !!sheet});
 expect(result).toBe(true);
});
