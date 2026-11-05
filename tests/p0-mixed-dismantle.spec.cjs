const {test,expect}=require('@playwright/test');

test('P0 dismantle can select mixed equipment kinds and tiers',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const sword=mkItem(recipeDefs.find(x=>x.kind==='weapon'),0,effects[0]);
  const shield=mkItem(recipeDefs.find(x=>x.kind==='shield'),2,effects[0]);
  S.inventory.push(sword,shield);
  const a=S.inventory.length-2,b=S.inventory.length-1;
  forgeMode='분해';forgeSelection=[];
  selectForgeItem(a);selectForgeItem(b);
  return {selectedBoth:forgeSelection.includes(a)&&forgeSelection.includes(b),
    count:forgeSelection.length,ids:[S.inventory[a].id,S.inventory[b].id],
    candidates:forgeUsable().filter(x=>x.index===a||x.index===b).length};
 });
 expect(result.selectedBoth).toBe(true);
 expect(result.count).toBe(2);
 expect(result.candidates).toBe(2);
});

test('P0 bulk dismantle includes mixed tier candidates but excludes protected gear',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const sword=mkItem(recipeDefs.find(x=>x.kind==='weapon'),0,effects[0]);
  const ring=mkItem(recipeDefs.find(x=>x.kind==='ring'),2,effects[0]);
  const shield=mkItem(recipeDefs.find(x=>x.kind==='shield'),1,effects[0]);
  shield.locked=true;
  S.inventory.push(sword,ring,shield);
  const a=S.inventory.length-3,b=S.inventory.length-2,c=S.inventory.length-1;
  forgeMode='분해';forgeSelection=[];
  dismantleTierFilter='all';
  selectDismantleAll();
  return {sword:forgeSelection.includes(a),ring:forgeSelection.includes(b),locked:forgeSelection.includes(c)};
 });
 expect(result).toEqual({sword:true,ring:true,locked:false});
});

test('P0 fusion still requires same kind and tier',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const sword=mkItem(recipeDefs.find(x=>x.kind==='weapon'),0,effects[0]);
  const shield=mkItem(recipeDefs.find(x=>x.kind==='shield'),1,effects[0]);
  S.inventory.push(sword,shield);
  const a=S.inventory.length-2,b=S.inventory.length-1;
  forgeMode='합성';forgeSelection=[];
  selectForgeItem(a);selectForgeItem(b);
  return {selection:forgeSelection.slice(),expected:b};
 });
 expect(result.selection).toEqual([result.expected]);
});
