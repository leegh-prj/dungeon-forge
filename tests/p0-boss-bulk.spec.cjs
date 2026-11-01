const {test,expect}=require('@playwright/test');

test('P0 boss defeat restarts telegraph timer and clears temporary states',async({page})=>{
 await page.goto('/');
 const data=await page.evaluate(()=>{
  S.boss=true;S.hp=1;S.enemyHp=getEnemyMax();S.ore=9000;
  const oldOre=S.ore;
  bossPatternStep=2;enemyBurnUntil=Date.now()+2000;enemyPoisonUntil=Date.now()+2000;
  battleStunUntil=Date.now()+2000;guardActiveUntil=Date.now()+2000;
  const previousStage=S.stage;
  takeDamage(1e8);
  return {
   hpRestored:S.hp>0,
   stagePreserved:S.stage===previousStage,
   bossRemains:S.boss===true,
   enemyRestored:S.enemyHp===getEnemyMax(),
   statusesReset:enemyBurnUntil===0&&enemyPoisonUntil===0&&battleStunUntil===0&&guardActiveUntil===0,
   patternReset:bossPatternStep===0,
   scheduled:pendingBossAttack===enemyAttackAt&&enemyAttackAt>Date.now(),
   bossWarningWindow:enemyAttackAt-Date.now()>=4500,
   orePreserved:S.ore===oldOre
  };
 });
 expect(data).toEqual(Object.fromEntries(Object.keys(data).map(x=>[x,true])));
});

test('P0 bulk dismantle skips locked and equipped gear',async({page})=>{
 await page.goto('/');
 const data=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='armor');
  S.inventory.push(mkItem(def,0,effects[0]),mkItem(def,0,effects[0]),mkItem(def,0,effects[0]));
  const indexes=[S.inventory.length-3,S.inventory.length-2,S.inventory.length-1];
  S.inventory[indexes[1]].locked=true; S.equip.armor=indexes[2];forgeMode='분해';forgeSelection=[];
  selectDismantleAll();
  return {normal:forgeSelection.includes(indexes[0]),lockedExcluded:!forgeSelection.includes(indexes[1]),equippedExcluded:!forgeSelection.includes(indexes[2])};
 });
 expect(data).toEqual({normal:true,lockedExcluded:true,equippedExcluded:true});
});

test('P0 warehouse bulk move obeys grade, kind, free capacity',async({page})=>{
 await page.goto('/');
 const data=await page.evaluate(()=>{
  const sword=recipeDefs.find(x=>x.kind==='weapon');
  const armor=recipeDefs.find(x=>x.kind==='armor');
  const a=mkItem(sword,1,effects[0]),b=mkItem(sword,1,effects[0]),c=mkItem(armor,1,effects[0]);
  S.warehouse=[a,b,c];S.bagCapacity=S.inventory.length+1;
  document.getElementById('screen').innerHTML='<select id="warehouseBulkGrade"><option value="1" selected>1</option></select><select id="warehouseBulkKind"><option value="weapon" selected>weapon</option></select>';
  const eqBefore=JSON.stringify(S.equip);
  bulkWarehouseToBag();
  return {movedOne:[a,b].filter(x=>S.inventory.some(i=>i.id===x.id)).length===1,remainingTwo:S.warehouse.length===2,armorRemains:S.warehouse.some(x=>x.id===c.id),equipUnchanged:eqBefore===JSON.stringify(S.equip)};
 });
 expect(data).toEqual({movedOne:true,remainingTwo:true,armorRemains:true,equipUnchanged:true});
});
