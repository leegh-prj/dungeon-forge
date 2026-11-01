const {test,expect}=require('@playwright/test');

test('P0 boss reward: one kill advances one stage and grants one trophy',async({page})=>{
 await page.goto('/');
 const actual=await page.evaluate(()=>{
   const region=regionInfo().key,stage=S.stage;
   S.boss=true;S.enemyHp=0;S.bossTrophies[region]=S.bossTrophies[region]||0;
   const old=S.bossTrophies[region],kills=S.kills;
   enemyDown();
   // An asynchronous duplicate callback must not award twice after the enemy resets.
   enemyDown();
   return {stageDelta:S.stage-stage,trophyDelta:S.bossTrophies[region]-old,killDelta:S.kills-kills,notBoss:!S.boss,enemyReset:S.enemyHp===getEnemyMax()};
 });
 expect(actual).toEqual({stageDelta:1,trophyDelta:1,killDelta:1,notBoss:true,enemyReset:true});
});

test('P0 bulk crafting: ten attempts preserve costs and item identities',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='weapon');
  S.craftTab='weapon';S.focus='balanced';S.ore=100000;S.crystals=100000;
  S.bagCapacity=Math.max(S.bagCapacity,S.inventory.length+20);
  S.autoSalvageTier=-1;
  const idsBefore=new Set([...S.inventory,...S.warehouse].map(x=>x.id));
  const ore=S.ore,crystals=S.crystals;
  bulkCraft(10);
  const all=[...S.inventory,...S.warehouse];
  const added=all.filter(x=>!idsBefore.has(x.id));
  return {added:added.length,distinct:new Set(added.map(x=>x.id)).size,oreSpent:ore-S.ore,crystalSpent:crystals-S.crystals,expectedOre:10*def.ore,expectedCrystals:10*def.crystal};
 });
 expect(result.added).toBe(10);
 expect(result.distinct).toBe(10);
 expect(result.oreSpent).toBe(result.expectedOre);
 expect(result.crystalSpent).toBe(result.expectedCrystals);
});

test('P0 failed save does not advance last timestamp or overwrite primary',async({page})=>{
 await page.goto('/');
 const out=await page.evaluate(()=>{
   S.gold=4422;save();
   const raw=localStorage.getItem(K),oldLast=S.last;
   const original=Storage.prototype.setItem;
   try {
     Storage.prototype.setItem=function(key,value){if(key===K)throw new Error('simulated quota error');return original.call(this,key,value)};
     S.gold=9988;
     const result=save();
     return {failed:result===false,lastUnchanged:S.last===oldLast,primaryUnchanged:localStorage.getItem(K)===raw};
   }finally{Storage.prototype.setItem=original}
 });
 expect(out).toEqual({failed:true,lastUnchanged:true,primaryUnchanged:true});
});
