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

test('portrait landscape portrait keeps save and equipped identities',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.evaluate(()=>{
  S.battleMode='manual';
  S.inventory.push({id:'rotation-qa',kind:'weapon',name:'Rotation QA',tier:0,effect:'화상',power:10,defense:0,locked:false});
  S.equip.weapon=S.inventory.length-1;
  save();render();
 });
 const first=await page.evaluate(()=>({id:S.inventory[S.equip.weapon].id,stage:S.stage,gold:S.gold}));
 for(const [width,height] of [[844,390],[390,844],[915,412],[360,800]]){
  await page.setViewportSize({width,height});
  await page.locator('#nav button').filter({hasText:'장비'}).click();
  await expect(page.locator('#screen')).not.toBeEmpty();
  const state=await page.evaluate(()=>({
   id:S.inventory[S.equip.weapon]?.id,stage:S.stage,gold:S.gold,
   overflow:document.documentElement.scrollWidth-innerWidth
  }));
  expect(state.id).toBe(first.id);
  expect(state.stage).toBe(first.stage);
  expect(state.gold).toBe(first.gold);
  expect(state.overflow).toBeLessThanOrEqual(2);
 }
 await page.reload();
 const restored=await page.evaluate(key=>{
  const s=JSON.parse(localStorage.getItem(key));
  return s.inventory[s.equip.weapon].id;
 },'dungeon-forge-ui-v2');
 expect(restored).toBe('rotation-qa');
});
test('all five tabs render across touch landscape and portrait',async({page})=>{
 await page.goto('/');
 for(const [width,height] of [[844,390],[390,844]]){
  await page.setViewportSize({width,height});
  for(const label of ['던전','대장간','장비','도감','상점']){
   await page.locator('#nav button').filter({hasText:label}).click();
   await expect(page.locator('#screen')).not.toBeEmpty();
   await expect(page.locator('#gameErrorDetail')).toHaveCount(0);
  }
 }
});
