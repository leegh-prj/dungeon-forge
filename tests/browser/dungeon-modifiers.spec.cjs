const {test,expect}=require('@playwright/test');

test('encounter modifiers are deterministic and cycle between three regular fights',async({page})=>{
 await page.goto('/');
 const data=await page.evaluate(()=>{
  const first=dungeonModifier(1,0,false);
  const keys=[0,1,2].map(k=>dungeonModifier(2,k,false)?.key);
  const replay=[0,1,2].map(k=>dungeonModifier(2,k,false)?.key);
  const boss=dungeonModifier(2,2,true);
  return {first,keys,replay,boss};
 });
 expect(data.first).toBeNull();
 expect(new Set(data.keys).size).toBe(3);
 expect(data.replay).toEqual(data.keys);
 expect(data.boss).toBeNull();
});

test('reward modifier increases gold and ore only for the active non-boss encounter',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const before={stage:S.stage,kills:S.stageKills,boss:S.boss,gold:S.gold,ore:S.ore,crystals:S.crystals,materials:{...S.materials}};
  const originalRoll=rollBattleRewards;
  try{
    rollBattleRewards=()=>({gold:100,ore:100,crystals:0,type:'water',quantity:1});
    const cases=[];
    for(const kills of [0,1,2]){
      S.stage=2;S.stageKills=kills;S.boss=false;
      const mod=dungeonModifier();
      const gold=S.gold,ore=S.ore;
      awardBattleRewards(false);
      cases.push({key:mod.key,gold:S.gold-gold,ore:S.ore-ore,
       expectedGold:Math.round(100*mod.gold),expectedOre:Math.round(100*mod.ore)});
    }
    S.boss=true;const gold=S.gold,ore=S.ore;
    awardBattleRewards(true);
    return {cases,bossGold:S.gold-gold,bossOre:S.ore-ore};
  }finally{
    rollBattleRewards=originalRoll;
    S.stage=before.stage;S.stageKills=before.kills;S.boss=before.boss;
    S.gold=before.gold;S.ore=before.ore;S.crystals=before.crystals;S.materials=before.materials;
  }
 });
 for(const item of outcome.cases){
  expect(item.gold).toBe(item.expectedGold);
  expect(item.ore).toBe(item.expectedOre);
 }
 expect(outcome.bossGold).toBe(100);
 expect(outcome.bossOre).toBe(100);
});

test('dungeon modifier is shown on stage view but not in boss battle',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
   const prior={stage:S.stage,kills:S.stageKills,boss:S.boss};
   S.stage=2;S.stageKills=1;S.boss=false;
   const regular=renderDungeonModifier();
   const stageInfo=renderDungeon();
   S.boss=true;const boss=renderDungeonModifier();
   S.stage=prior.stage;S.stageKills=prior.kills;S.boss=prior.boss;
   return {regular,stageInfo,boss};
 });
 expect(result.regular).toContain('dungeonModifier');
 expect(result.stageInfo).toContain('dungeonModifier');
 expect(result.boss).toBe('');
});

test('modifier damage multipliers do not affect boss encounters or starter combat',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>({
  starter:dungeonModifier(1,0,false),
  boss:dungeonModifier(1,2,true),
  variants:[0,1,2].map(i=>{
    const d=dungeonModifier(3,i,false);
    return {key:d.key,incoming:d.incoming,outgoing:d.outgoing};
  })
 }));
 expect(result.starter).toBeNull();
 expect(result.boss).toBeNull();
 expect(result.variants.map(x=>x.key).sort()).toEqual(['bounty','hardened','surge']);
 expect(result.variants.every(x=>x.incoming>=1&&x.incoming<=1.15&&x.outgoing>=.88&&x.outgoing<=1)).toBe(true);
});
