const {test,expect}=require('@playwright/test');
for(const [w,h] of [[390,844],[844,390]]){
 test('UX action hierarchy and screen controls '+w+'x'+h,async({page})=>{
  await page.setViewportSize({width:w,height:h});await page.goto('/');
  for(const [label,control,context] of [['던전','.dungeonSwitcher','.uxActionHub'],['대장간','.forgeTabs','.uxSectionCaption'],['장비','.equipmentPages','.uxSectionCaption']]){
   await page.locator('#nav button').filter({hasText:label}).click();
   await expect(page.locator(control)).toBeVisible();
   await expect(page.locator(context)).toBeVisible();
   await expect(page.locator('#gameErrorDetail')).toHaveCount(0);
  }
 });
}
