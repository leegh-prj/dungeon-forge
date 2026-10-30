const {test,expect}=require('@playwright/test');
for(const [width,height] of [[390,844],[844,390]]){
 test('six-priority UX smoke '+width+'x'+height,async({page})=>{
  await page.setViewportSize({width,height});
  const failed=[];page.on('pageerror',err=>failed.push(err.message));
  await page.goto('/');
  await page.locator('#nav button').filter({hasText:'던전'}).click();
  await expect(page.locator('.battleQuickStatus')).toBeVisible();
  await expect(page.locator('.combatSkill')).toHaveCount(3);
  await page.locator('#nav button').filter({hasText:'대장간'}).click();
  await expect(page.locator('.forgeSelectionSummary')).toBeVisible();
  await page.locator('#nav button').filter({hasText:'장비'}).click();
  await page.evaluate(()=>{storageTab='bag';render()});
  await expect(page.locator('.inventoryCount')).toBeVisible();
  expect(failed).toEqual([]);
 });
}
test('image manifest file coverage and image loading fallback',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const m=await (await fetch('/assets/gear/manifest.json')).json();
  return {count:m.items.length,unique:new Set(m.items.map(x=>x.file)).size};
 });
 expect(result.count).toBe(168);expect(result.unique).toBe(168);
 await page.evaluate(()=>{TAB='도감';S.codexTab='monster';render()});
 await expect(page.locator('.monsterCodexCard img').first()).toHaveJSProperty('naturalWidth',512);
});
