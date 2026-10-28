const {test,expect}=require('@playwright/test');
const sizes=[[320,720],[360,780],[390,844],[430,932],[667,375],[844,390],[915,412]];
for(const [width,height] of sizes){
 test('layout '+width+'x'+height+' all tabs have bounded controls',async({page})=>{
  await page.setViewportSize({width,height});
  await page.goto('/');
  for(const tab of ['던전','대장간','장비','도감','상점']){
   await page.locator('#nav button').filter({hasText:tab}).click();
   await expect(page.locator('#screen')).not.toBeEmpty();
   const layout=await page.evaluate(()=>{
    const root=document.documentElement,screen=document.querySelector('#screen');
    const controls=[...screen.querySelectorAll('button')].filter(el=>el.getBoundingClientRect().width>0);
    const bad=controls.filter(el=>{
     const box=el.getBoundingClientRect();
     return !Number.isFinite(box.left)||!Number.isFinite(box.right)||box.width>innerWidth+2;
    });
    return {overflow:root.scrollWidth-innerWidth,bad:bad.length,screenWidth:screen.getBoundingClientRect().width};
   });
   expect(layout.overflow).toBeLessThanOrEqual(2);
   expect(layout.bad).toBe(0);
   expect(layout.screenWidth).toBeGreaterThan(0);
  }
 });
}
