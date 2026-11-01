const {test,expect}=require('@playwright/test');
test('P0 locked or equipped gear cannot be dismantled',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='shield');
  const locked=mkItem(def,0,effects[0]),equipped=mkItem(def,0,effects[0]);
  locked.locked=true;S.inventory.push(locked,equipped);
  const a=S.inventory.length-2,b=S.inventory.length-1;
  S.equip.shield=b;forgeMode='분해';forgeSelection=[a,b];
  const before=S.inventory.map(x=>x.id).join('|');
  applyDismantle();
  return {unchanged:before===S.inventory.map(x=>x.id).join('|'),filtered:!forgeUsable().some(x=>x.index===a||x.index===b)};
 });
 expect(result).toEqual({unchanged:true,filtered:true});
});
test('P0 warehouse round trip preserves identity and never auto-equips',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='ring');
  const item=mkItem(def,0,effects[0]);S.inventory.push(item);
  const idx=S.inventory.length-1;
  S.warehouseCapacity=Math.max(S.warehouseCapacity,S.warehouse.length+2);
  S.bagCapacity=Math.max(S.bagCapacity,S.inventory.length+2);
  const equipBefore=JSON.stringify(S.equip);
  moveToWarehouse(idx);
  const stored=S.warehouse.some(x=>x.id===item.id)&&!S.inventory.some(x=>x.id===item.id);
  const location=S.warehouse.findIndex(x=>x.id===item.id);
  moveToBag(location);
  return {stored,roundTrip:S.inventory.some(x=>x.id===item.id)&&!S.warehouse.some(x=>x.id===item.id),equipSame:equipBefore===JSON.stringify(S.equip)};
 });
 expect(result).toEqual({stored:true,roundTrip:true,equipSame:true});
});
test('P0 enhancement chance respects level 20 cap',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const item=mkItem(recipeDefs[0],0,effects[0]);item.level=19;
  const before=enhancementChance(item);item.level=20;
  return {before,atMax:enhancementChance(item),preview:enhancementPreview(item).includes('최대 강화(+20)')};
 });
 expect(result.before).toBeGreaterThan(0);
 expect(result.atMax).toBe(0);
 expect(result.preview).toBe(true);
});
test('P0 boss attack timing schedules a new future warning',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.boss=true;bossPatternStep=0;
  scheduleEnemyAttack(true);
  return {future:enemyAttackAt>Date.now(),synced:pendingBossAttack===enemyAttackAt,interval:enemyAttackInterval};
 });
 expect(result.future).toBe(true);
 expect(result.synced).toBe(true);
 expect(result.interval).toBeGreaterThan(0);
});
