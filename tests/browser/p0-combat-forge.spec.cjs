const {test,expect}=require('@playwright/test');
for(const [w,h] of [[390,844],[844,390]]){
 test('P0 combat and forge decision hierarchy '+w+'x'+h,async({page})=>{
  await page.setViewportSize({width:w,height:h});await page.goto('/');
  await page.locator('#nav button').filter({hasText:'던전'}).click();
  await expect(page.locator('.combatOverview')).toContainText('STAGE');
  await expect(page.locator('.combatActions .combatSkill')).toHaveCount(3);
  await page.locator('#nav button').filter({hasText:'대장간'}).click();
  await page.locator('.forgeTabs button').filter({hasText:'강화'}).click();
  await expect(page.locator('.forgeSelectionSummary')).toContainText('0/1개 선택');
  await expect(page.locator('#gameErrorDetail')).toHaveCount(0);
 });
}