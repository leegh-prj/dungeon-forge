const {test,expect}=require('@playwright/test');
test('nav nodes remain stable between renders and route switches',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const nav=document.querySelector('#nav');const first=[...nav.children];
  for(let i=0;i<20;i++)render();
  const stable=first.every((el,i)=>nav.children[i]===el);
  switchMainTab('대장간');const routed=first.every((el,i)=>nav.children[i]===el);
  return {stable,routed,active:nav.querySelectorAll('button.active').length};
 });
 expect(result).toEqual({stable:true,routed:true,active:1});
});
test('nav optimization keeps portrait and landscape touch routing',async({page})=>{
 await page.goto('/');
 for(const [width,height] of [[390,844],[844,390]]){
  await page.setViewportSize({width,height});
  for(const tab of ['던전','대장간','장비','도감','상점']){
   await page.locator('#nav button').filter({hasText:tab}).click();
   await expect(page.locator('#nav button.active')).toContainText(tab);
  }
 }
});
