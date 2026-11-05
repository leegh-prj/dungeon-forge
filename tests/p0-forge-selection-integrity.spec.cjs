const {test,expect}=require('@playwright/test');

test('P0 locking a selected forge material clears stale selection',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const it=mkItem(recipeDefs.find(x=>x.kind==='weapon'),0,effects[0]);
  S.inventory.push(it);
  const index=S.inventory.length-1;
  forgeMode='분해';forgeSelection=[index];
  toggleItemLock(index);
  return {locked:it.locked===true,selectionCleared:forgeSelection.length===0,
   protectedFromDismantle:!forgeUsable().some(x=>x.index===index)};
 });
 expect(result).toEqual({locked:true,selectionCleared:true,protectedFromDismantle:true});
});

test('P0 moving gear from warehouse to bag clears pending forge selection',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const it=mkItem(recipeDefs.find(x=>x.kind==='shield'),0,effects[0]);
  const existing=S.inventory.length-1;
  S.warehouse.push(it);S.bagCapacity=Math.max(S.bagCapacity,S.inventory.length+1);
  forgeMode='강화';forgeSelection=[existing];
  const index=S.warehouse.length-1;
  moveToBag(index);
  return {selectionCleared:forgeSelection.length===0,
   movedToBag:S.inventory.some(x=>x.id===it.id),
   removedFromWarehouse:!S.warehouse.some(x=>x.id===it.id)};
 });
 expect(result).toEqual({selectionCleared:true,movedToBag:true,removedFromWarehouse:true});
});

test('P0 dismantle selection limit never silently replaces existing 50 selections',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='ring');
  const initial=S.inventory.length;
  S.inventory.push(...Array.from({length:51},()=>mkItem(def,0,effects[0])));
  forgeMode='분해';forgeSelection=Array.from({length:50},(_,i)=>initial+i);
  const before=forgeSelection.slice();
  selectForgeItem(initial+50);
  return {selectionPreserved:before.length===forgeSelection.length && before.every((x,i)=>forgeSelection[i]===x),newItemExcluded:!forgeSelection.includes(initial+50)};
 });
 expect(result).toEqual({selectionPreserved:true,newItemExcluded:true});
});
