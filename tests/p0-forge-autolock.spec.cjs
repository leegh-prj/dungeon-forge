const {test,expect}=require('@playwright/test');

test('P0 fusion reward obeys automatic high-tier lock and consumes exactly three inputs',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='weapon');
  S.autoLockTier=2;S.ore=100000;S.gold=1000000;S.crystals=100000;
  const materials=[0,1,2].map(()=>mkItem(def,1,effects[0]));
  const ids=new Set(materials.map(x=>x.id));
  S.inventory.push(...materials);
  const indexes=[S.inventory.length-3,S.inventory.length-2,S.inventory.length-1];
  forgeMode='합성';forgeSelection=indexes.slice();
  const gold=S.gold,ore=S.ore,crystals=S.crystals;
  const cost=forgePrice('합성');
  runForge();
  const reward=S.inventory.find(x=>x.kind==='weapon'&&x.tier===2&&!ids.has(x.id));
  return {rewardExists:!!reward,rewardLocked:reward?.locked===true,
   inputRemoved:materials.every(x=>!S.inventory.some(y=>y.id===x.id)),
   goldSpent:gold-S.gold,oreSpent:ore-S.ore,crystalsSpent:crystals-S.crystals,cost};
 });
 expect(result.rewardExists).toBe(true);
 expect(result.rewardLocked).toBe(true);
 expect(result.inputRemoved).toBe(true);
 expect(result.goldSpent).toBe(result.cost.gold);
 expect(result.oreSpent).toBe(result.cost.ore);
 expect(result.crystalsSpent).toBe(result.cost.crystals);
});

test('P0 forge item buttons expose pressed state when selected',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  forgeMode='강화';forgeSelection=[];
  const def=recipeDefs.find(x=>x.kind==='ring');
  const item=mkItem(def,0,effects[0]);
  S.inventory.push(item);
  const idx=S.inventory.length-1;
  const unselected=forgeItemCard({item,index:idx});
  forgeSelection=[idx];
  const selected=forgeItemCard({item,index:idx});
  return {off:unselected.includes('aria-pressed="false"'),on:selected.includes('aria-pressed="true"')};
 });
 expect(result).toEqual({off:true,on:true});
});
