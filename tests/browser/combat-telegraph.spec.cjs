const {test,expect}=require('@playwright/test');
for(const [width,height] of [[390,844],[844,390]]){
 test('combat telegraph remains readable '+width+'x'+height,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');
  await page.locator('#nav button').filter({hasText:'던전'}).click();
  await expect(page.locator('.combatTelegraph')).toBeVisible();
  await expect(page.locator('.combatTelegraphBody strong')).not.toBeEmpty();
  await expect(page.locator('.combatSkill')).toHaveCount(3);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
 });
}
test('boss telegraph indicates upcoming pattern without save changes',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{const prior=JSON.stringify(S.equip);S.boss=true;TAB='던전';dungeonPanel='fight';render();return {label:document.querySelector('.combatTelegraphBody strong')?.textContent,same:prior===JSON.stringify(S.equip)}});
 expect(result.label).toContain('보스 패턴');expect(result.same).toBe(true);
});
