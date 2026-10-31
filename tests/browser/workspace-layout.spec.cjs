const {test,expect}=require('@playwright/test');
test.use({hasTouch:true,isMobile:true});
test('landscape combat battlefield and controls occupy adjacent columns',async({page})=>{
 await page.setViewportSize({width:844,height:390});await page.goto('/');
 await page.locator('#nav button').filter({hasText:'던전'}).click();
 const result=await page.evaluate(()=>{
  const field=document.querySelector('.dungeonCombatPage>.battlefield').getBoundingClientRect();
  const actions=document.querySelector('.dungeonCombatPage>.combatActions').getBoundingClientRect();
  return {fieldX:field.x,fieldRight:field.right,actionsX:actions.x,actionsWidth:actions.width,overflow:document.documentElement.scrollWidth-innerWidth};
 });
 expect(result.actionsX).toBeGreaterThanOrEqual(result.fieldRight-2);
 expect(result.actionsWidth).toBeGreaterThan(130);
 expect(result.overflow).toBeLessThanOrEqual(2);
});
test('portrait remains stacked with visible combat skills',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const result=await page.evaluate(()=>{
  const field=document.querySelector('.dungeonCombatPage>.battlefield').getBoundingClientRect();
  const actions=document.querySelector('.dungeonCombatPage>.combatActions').getBoundingClientRect();
  return {fieldBottom:field.bottom,actionsTop:actions.top};
 });
 expect(result.actionsTop).toBeGreaterThanOrEqual(result.fieldBottom-2);
 await expect(page.locator('.combatSkill')).toHaveCount(3);
});
