const {test,expect}=require('@playwright/test');
for(const [width,height] of [[390,844],[844,390]]){
 test('readable primary controls on '+width+'x'+height,async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');
  for(const tab of ['던전','대장간','장비']){
   await page.locator('#nav button').filter({hasText:tab}).click();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
   expect(await page.locator('#screen').evaluate(el=>getComputedStyle(el).lineHeight)).not.toBe('normal');
  }
  await page.locator('#nav button').filter({hasText:'던전'}).click();
  const font=await page.locator('.combatSkill').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(font).toBeGreaterThanOrEqual(12);
  await expect(page.locator('.combatTelegraph')).toBeVisible();
 });
}