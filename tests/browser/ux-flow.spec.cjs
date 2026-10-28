const {test,expect}=require('@playwright/test');
for(const [w,h] of [[390,844],[844,390]]){
 test('UX flow text and controls at '+w+'x'+h,async({page})=>{
  await page.setViewportSize({width:w,height:h});await page.goto('/');
  for(const [label,heading,control] of [['던전','전투','.dungeonSwitcher'],['대장간','대장간','.forgeTabs'],['장비','장비 관리','.equipmentPages']]){
   await page.locator('#nav button').filter({hasText:label}).click();
   await expect(page.locator('.uxJourneyNote')).toContainText(heading);
   await expect(page.locator(control)).toBeVisible();
   const errors=await page.locator('#gameErrorDetail').count();expect(errors).toBe(0);
  }
 });
}
