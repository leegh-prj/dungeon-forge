const {test,expect}=require('@playwright/test');
for(const [width,height] of [[390,844],[844,390]]){
 test('new combat action hub navigates in one tap '+width+'x'+height,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');
  await page.locator('#nav button').filter({hasText:'던전'}).click();
  await expect(page.locator('.uxActionHub button')).toHaveCount(3);
  await page.locator('.uxActionHub button').filter({hasText:'제작'}).click();
  await expect(page.locator('.forgeTabs button.active')).toHaveText('제작');
  await page.locator('#nav button').filter({hasText:'던전'}).click();
  await page.locator('.uxActionHub button').filter({hasText:'장비 확인'}).click();
  await expect(page.locator('.equipmentPages button.active')).toContainText('가방');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 });
}
