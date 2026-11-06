const {test,expect}=require('@playwright/test');

test('reward comparison is displayed without changing the active loadout',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='weapon');
  const item=mkItem(def,1,effects[0]);
  S.inventory.push(item);
  const before=JSON.stringify(S.equip);
  showTierReward(item,'새로운 장비 제작','제작 완료');
  const modal=document.getElementById('craftModal');
  return {
    compare:modal.querySelector('.tierRewardCompare')?.textContent||'',
    repeatButtons:modal.querySelectorAll('.craftRepeatActions button').length,
    loadoutUnchanged:JSON.stringify(S.equip)===before,
    visible:document.getElementById('craftOverlay').classList.contains('show')
  };
 });
 expect(result.compare).toMatch(/장착 대비|현재 장착 없음/);
 expect(result.repeatButtons).toBe(2);
 expect(result.loadoutUnchanged).toBe(true);
 expect(result.visible).toBe(true);
});

test('legendary result includes a non-mutating comparison',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='shield');
  const item=mkItem(def,MAX_TIER,effects[0]);
  S.inventory.push(item);
  const equippedBefore=JSON.stringify(S.equip);
  showTierReward(item,'최고 등급 장비 획득');
  const modal=document.getElementById('craftModal');
  return {
    compare:modal.querySelector('.tierRewardCompare')?.textContent||'',
    loadoutUnchanged:JSON.stringify(S.equip)===equippedBefore
  };
 });
 expect(result.compare).toMatch(/장착 대비|현재 장착 없음/);
 expect(result.loadoutUnchanged).toBe(true);
});

for(const viewport of [{width:844,height:390},{width:390,height:844}]){
 test('reward comparison and repeat actions fit '+viewport.width+'x'+viewport.height,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('/');
  await page.evaluate(()=>{
   const def=recipeDefs.find(x=>x.kind==='ring');
   showTierReward(mkItem(def,1,effects[0]),'장비 제작');
  });
  const modal=page.locator('#craftModal');
  await expect(modal.locator('.tierRewardCompare')).toBeVisible();
  await expect(modal.locator('.craftRepeatActions button')).toHaveCount(2);
  const bounds=await modal.evaluate(el=>{
   const a=el.getBoundingClientRect();
   return {left:a.left,right:a.right,top:a.top,bottom:a.bottom,width:innerWidth,height:innerHeight};
  });
  expect(bounds.left).toBeGreaterThanOrEqual(-3);
  expect(bounds.right).toBeLessThanOrEqual(bounds.width+3);
  expect(bounds.top).toBeGreaterThanOrEqual(-3);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.height+3);
  await modal.locator('.tierResultConfirm').click();
  await expect(page.locator('#craftOverlay')).not.toHaveClass(/show/);
 });
}
