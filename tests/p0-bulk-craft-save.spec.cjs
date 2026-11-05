const {test,expect}=require('@playwright/test');

test('P0 bulk crafting stops after first failed save checkpoint',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.craftTab='weapon';S.focus='balanced';
  S.ore=100000;S.crystals=100000;
  S.bagCapacity=S.inventory.length+20;
  S.warehouseCapacity=S.warehouse.length+20;
  S.autoSalvageTier=-1;
  const countBefore=S.inventory.length,oreBefore=S.ore,cryBefore=S.crystals;
  const previousSave=save;
  let saveCalls=0;
  try{
   save=()=>{saveCalls++;return false};
   bulkCraft(10);
  }finally{save=previousSave}
  return {crafted:S.inventory.length-countBefore,saveCalls,
   oreSpent:oreBefore-S.ore,crystalSpent:cryBefore-S.crystals,
   recipe:recipeDefs.find(x=>x.kind==='weapon'),
   batchCleared:batchCraftLog===null,
   warning:document.getElementById('craftModal').textContent.includes('저장 실패')};
 });
 expect(result.crafted).toBe(1);
 expect(result.saveCalls).toBe(1);
 expect(result.oreSpent).toBe(result.recipe.ore);
 expect(result.crystalSpent).toBe(result.recipe.crystal);
 expect(result.batchCleared).toBe(true);
 expect(result.warning).toBe(true);
});

test('P0 successful bulk craft persists a checkpoint for each attempt',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.craftTab='weapon';S.focus='balanced';
  S.ore=100000;S.crystals=100000;
  S.bagCapacity=S.inventory.length+20;
  S.warehouseCapacity=S.warehouse.length+20;
  S.autoSalvageTier=-1;
  const countBefore=S.inventory.length;
  const previousSave=save;
  let saveCalls=0;
  try{
   save=()=>{saveCalls++;return true};
   bulkCraft(5);
  }finally{save=previousSave}
  return {crafted:S.inventory.length-countBefore,saveCalls,
   batchCleared:batchCraftLog===null,
   success:document.getElementById('craftModal').textContent.includes('일괄 제작 완료')};
 });
 expect(result.crafted).toBe(5);
 expect(result.saveCalls).toBe(6);
 expect(result.batchCleared).toBe(true);
 expect(result.success).toBe(true);
});

test('P0 goal crafting halts on checkpoint failure without claiming persistent success',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.craftTab='weapon';S.focus='balanced';S.autoCraftGoal=6;
  S.ore=100000;S.crystals=100000;
  S.bagCapacity=S.inventory.length+30;
  S.warehouseCapacity=S.warehouse.length+30;
  S.autoSalvageTier=-1;
  const before=S.inventory.length,previousSave=save;
  let saveCalls=0;
  try{
   save=()=>{saveCalls++;return false};
   craftToGoal();
  }finally{save=previousSave}
  return {crafted:S.inventory.length-before,saveCalls,
   warning:document.getElementById('craftModal').textContent.includes('저장 실패'),
   notSuccess:!document.getElementById('craftModal').textContent.includes('목표 제작 성공')};
 });
 expect(result.crafted).toBe(1);
 expect(result.saveCalls).toBe(1);
 expect(result.warning).toBe(true);
 expect(result.notSuccess).toBe(true);
});
