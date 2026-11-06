const {test,expect}=require('@playwright/test');

test('P0 full bag and warehouse block bulk crafting without spending resources',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.craftTab='weapon';S.focus='balanced';
  S.ore=10000;S.crystals=10000;S.autoSalvageTier=-1;
  S.bagCapacity=S.inventory.length;
  S.warehouseCapacity=S.warehouse.length;
  const before={ore:S.ore,crystals:S.crystals,bag:S.inventory.length,warehouse:S.warehouse.length};
  const previousRandom=Math.random;
  try{Math.random=()=>0;bulkCraft(10)}finally{Math.random=previousRandom}
  const after={ore:S.ore,crystals:S.crystals,bag:S.inventory.length,warehouse:S.warehouse.length};
  return {before,after,logCleared:batchCraftLog===null};
 });
 expect(result.after).toEqual(result.before);
 expect(result.logCleared).toBe(true);
});

test('P0 bulk crafting stops at storage capacity and reports partial progress',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.craftTab='weapon';S.focus='balanced';
  S.ore=10000;S.crystals=10000;S.autoSalvageTier=-1;
  S.bagCapacity=S.inventory.length+1;
  S.warehouseCapacity=S.warehouse.length;
  const def=recipeDefs.find(r=>r.kind==='weapon');
  const before={ore:S.ore,crystals:S.crystals,bag:S.inventory.length,warehouse:S.warehouse.length};
  const priorRandom=Math.random;
  try{Math.random=()=>0;bulkCraft(5)}finally{Math.random=priorRandom}
  return {
   attempts:S.inventory.length-before.bag,
   warehouseDelta:S.warehouse.length-before.warehouse,
   oreSpent:before.ore-S.ore,
   crystalSpent:before.crystals-S.crystals,
   expectedOre:def.ore,expectedCrystals:def.crystal,
   summary:document.getElementById('craftModal').textContent,
   logCleared:batchCraftLog===null
  };
 });
 expect(result.attempts).toBe(1);
 expect(result.warehouseDelta).toBe(0);
 expect(result.oreSpent).toBe(result.expectedOre);
 expect(result.crystalSpent).toBe(result.expectedCrystals);
 expect(result.summary).toContain('일괄 제작 일부 완료');
 expect(result.summary).toContain('1/5회');
 expect(result.summary).toContain('보관 공간 부족');
 expect(result.logCleared).toBe(true);
});

test('P0 auto-salvage can complete bulk crafting even with full storage',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.craftTab='weapon';S.focus='balanced';
  S.ore=10000;S.crystals=10000;S.autoSalvageTier=0;S.autoLockTier=7;S.intro=null;
  S.bagCapacity=S.inventory.length;S.warehouseCapacity=S.warehouse.length;
  const def=recipeDefs.find(r=>r.kind==='weapon');
  const before={ore:S.ore,crystals:S.crystals,bag:S.inventory.length,warehouse:S.warehouse.length,salvaged:S.salvagedCount||0};
  const priorRandom=Math.random;
  try{Math.random=()=>0;bulkCraft(5)}finally{Math.random=priorRandom}
  return {
   bagUnchanged:S.inventory.length===before.bag,
   warehouseUnchanged:S.warehouse.length===before.warehouse,
   salvaged:S.salvagedCount-before.salvaged,
   crystalsNet:before.crystals-S.crystals,
   expectedCrystalCost:def.crystal*5,
   summary:document.getElementById('craftModal').textContent,
   logCleared:batchCraftLog===null
  };
 });
 expect(result.bagUnchanged).toBe(true);
 expect(result.warehouseUnchanged).toBe(true);
 expect(result.salvaged).toBe(5);
 expect(result.crystalsNet).toBeLessThanOrEqual(result.expectedCrystalCost);
 expect(result.summary).toContain('일괄 제작 완료');
 expect(result.summary).toContain('5/5회');
 expect(result.logCleared).toBe(true);
});

test('P0 repeat controls explain full storage and permit salvage-enabled retries',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.craftTab='weapon';S.focus='balanced';S.ore=10000;S.crystals=10000;
  S.bagCapacity=S.inventory.length;S.warehouseCapacity=S.warehouse.length;
  S.autoSalvageTier=-1;
  const blocked=craftRepeatButtons();
  S.autoSalvageTier=0;
  const salvage=craftRepeatButtons();
  return {blockedButtons:(blocked.match(/disabled/g)||[]).length,reason:blocked.includes('가방과 창고가 가득 찼습니다'),
    salvageEnabled:!salvage.includes('disabled')};
 });
 expect(result).toEqual({blockedButtons:2,reason:true,salvageEnabled:true});
});
