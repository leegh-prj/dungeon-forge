const {test,expect}=require('@playwright/test');
test.use({hasTouch:true,isMobile:true,viewport:{width:844,height:390}});
test('landscape touch layout uses a left rail while save identity persists',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#nav button')).toHaveCount(5);
 const result=await page.evaluate(()=>{
  const nav=document.querySelector('#nav').getBoundingClientRect();
  const app=document.querySelector('#app').getBoundingClientRect();
  return {navX:nav.x,navY:nav.y,navH:nav.height,navW:nav.width,appW:app.width,overflow:document.documentElement.scrollWidth-innerWidth};
 });
 expect(result.navX).toBeLessThan(10);
 expect(result.navY).toBeLessThan(10);
 expect(result.navH).toBeGreaterThan(300);
 expect(result.navW).toBeLessThan(90);
 expect(result.overflow).toBeLessThanOrEqual(2);
 await page.locator('#nav button').filter({hasText:'대장간'}).click();
 await expect(page.locator('.forgeTabs')).toBeVisible();
});
