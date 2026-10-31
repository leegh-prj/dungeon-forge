const {test,expect}=require('@playwright/test');
for(const [width,height] of [[390,844],[844,390]]){
 test('forge workspace and gear comparison snapshot '+width+'x'+height,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');
  await page.locator('#nav button').filter({hasText:'대장간'}).click();
  await expect(page.locator('.forgeWorkspace>.forgeTabs')).toBeVisible();
  await expect(page.locator('.forgeMainPanel')).toBeVisible();
  await page.locator('.forgeTabs button').filter({hasText:'강화'}).click();
  await expect(page.locator('.forgeSelectionSummary')).toBeVisible();
  await page.locator('#nav button').filter({hasText:'장비'}).click();
  await page.evaluate(()=>{storageTab='bag';render()});
  await expect(page.locator('.gearSnapshotSlot')).toHaveCount(4);
  await expect(page.locator('.inventoryGrid')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 });
}
test('gear snapshot does not mutate equipment state',async({page})=>{
 await page.goto('/');const r=await page.evaluate(()=>{const before=JSON.stringify(S.equip);const html=renderEquippedSnapshot();return{same:before===JSON.stringify(S.equip),html}});expect(r.same).toBe(true);expect(r.html).toContain('현재 착용');
});