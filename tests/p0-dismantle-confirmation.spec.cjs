const {test,expect}=require('@playwright/test');

test('P0 dismantle confirmation rejects a replaced item at the same index',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const original=mkItem(recipeDefs.find(x=>x.kind==='weapon'),0,effects[0]);
  S.inventory.push(original);const idx=S.inventory.length-1;
  forgeMode='분해';forgeSelection=[idx];
  confirmDismantle();
  const replacement=mkItem(recipeDefs.find(x=>x.kind==='shield'),1,effects[0]);
  S.inventory[idx]=replacement;
  const ore=S.ore,crystals=S.crystals;
  applyDismantle();
  return {replacementPreserved:S.inventory[idx]===replacement,oreUnchanged:S.ore===ore,
   crystalsUnchanged:S.crystals===crystals,pendingCleared:pendingDismantle===null};
 });
 expect(result).toEqual({replacementPreserved:true,oreUnchanged:true,crystalsUnchanged:true,pendingCleared:true});
});

test('P0 locking a confirmed material aborts dismantle without paying salvage',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const item=mkItem(recipeDefs.find(x=>x.kind==='armor'),2,effects[0]);
  S.inventory.push(item);const idx=S.inventory.length-1;
  forgeMode='분해';forgeSelection=[idx];confirmDismantle();
  item.locked=true;const ore=S.ore,crystals=S.crystals;
  applyDismantle();
  return {itemPreserved:S.inventory[idx]===item,oreUnchanged:S.ore===ore,
   crystalsUnchanged:S.crystals===crystals,pendingCleared:pendingDismantle===null};
 });
 expect(result).toEqual({itemPreserved:true,oreUnchanged:true,crystalsUnchanged:true,pendingCleared:true});
});

test('P0 cancelling confirmation prevents subsequent dismantle',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const item=mkItem(recipeDefs.find(x=>x.kind==='ring'),0,effects[0]);
  S.inventory.push(item);const idx=S.inventory.length-1;
  forgeMode='분해';forgeSelection=[idx];confirmDismantle();
  closeCraft();const ore=S.ore,crystals=S.crystals;
  applyDismantle();
  return {itemPreserved:S.inventory[idx]===item,oreUnchanged:S.ore===ore,
   crystalsUnchanged:S.crystals===crystals,pendingCleared:pendingDismantle===null};
 });
 expect(result).toEqual({itemPreserved:true,oreUnchanged:true,crystalsUnchanged:true,pendingCleared:true});
});

test('P0 confirmed dismantle pays salvage once even if confirm is triggered again',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const item=mkItem(recipeDefs.find(x=>x.kind==='shield'),2,effects[0]);
  S.inventory.push(item);const idx=S.inventory.length-1;
  forgeMode='분해';forgeSelection=[idx];const expected=dismantleReturns([idx]);
  const ore=S.ore,crystals=S.crystals;
  confirmDismantle();applyDismantle();applyDismantle();
  return {removed:!S.inventory.includes(item),oreGain:S.ore-ore,
   crystalGain:S.crystals-crystals,expected,pendingCleared:pendingDismantle===null};
 });
 expect(result.removed).toBe(true);
 expect(result.oreGain).toBe(result.expected.ore);
 expect(result.crystalGain).toBe(result.expected.crystals);
 expect(result.pendingCleared).toBe(true);
});
