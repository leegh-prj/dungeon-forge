const {test,expect}=require('@playwright/test');

test('boss equipment passives activate only for their forged pieces',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const old={equip:{...S.equip},stage:S.stage,boss:S.boss,hp:S.enemyHp,latched:bossEnragedStage};
  const def=kind=>recipeDefs.find(x=>x.kind===kind);
  const examples=[
   ['water','shield'],['poison','ring'],['storm','weapon'],['fire','weapon'],['earth','armor']
  ];
  const found=[];
  try{
   for(const [key,kind] of examples){
    const item=mkItem(def(kind),2,'견고함');item.bossCraft=true;item.infusion=key;
    S.inventory.push(item);S.equip[kind]=S.inventory.length-1;
    found.push({key,active:activeBossGearPassive(kind)?.key,description:activeBossGearPassive(kind)?.detail});
   }
   const plain=mkItem(def('shield'),2,'보호막');plain.infusion='water';plain.bossCraft=false;
   S.inventory.push(plain);S.equip.shield=S.inventory.length-1;
   found.push({key:'plain',active:activeBossGearPassive('shield')?.key||null});
  }finally{
   S.equip=old.equip;S.stage=old.stage;S.boss=old.boss;S.enemyHp=old.hp;bossEnragedStage=old.latched;
  }
  return found;
 });
 expect(outcome).toHaveLength(6);
 for(const row of outcome.slice(0,5)){
  expect(row.active).toBe(row.key);
  expect(row.description.length).toBeGreaterThan(4);
 }
 expect(outcome[5].active).toBe(null);
});

test('storm and fire boss weapons boost boss damage but not ordinary combat',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const orig={equip:{...S.equip},boss:S.boss};
  const def=recipeDefs.find(x=>x.kind==='weapon');
  const values={};
  for(const key of ['storm','fire']){
   const it=mkItem(def,2,key==='storm'?'번개':'화상');it.bossCraft=true;it.infusion=key;
   S.inventory.push(it);S.equip.weapon=S.inventory.length-1;
   S.boss=true;values[key]=bossGearDamageBonus();
   S.boss=false;values[key+'Normal']=bossGearDamageBonus();
  }
  S.equip=orig.equip;S.boss=orig.boss;
  return values;
 });
 expect(outcome.storm).toBeCloseTo(.14);
 expect(outcome.fire).toBeCloseTo(.10);
 expect(outcome.stormNormal).toBe(0);
 expect(outcome.fireNormal).toBe(0);
});

test('water shield, poison ring, and earth armor have distinct defensive effects',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const previous={equip:{...S.equip},boss:S.boss,stage:S.stage,hp:S.enemyHp,latched:bossEnragedStage};
  const setup=(kind,key)=>{
   const item=mkItem(recipeDefs.find(x=>x.kind===kind),2,'견고함');
   item.bossCraft=true;item.infusion=key;S.inventory.push(item);S.equip[kind]=S.inventory.length-1;
  };
  S.boss=true;S.stage=1;S.enemyHp=getEnemyMax();
  bossEnragedStage=-1;
  setup('shield','water');setup('ring','poison');setup('armor','earth');
  const normalMitigation=bossGearDamageMitigation();
  const heal=bossGearLifeSteal(1000);
  S.enemyHp=Math.floor(getEnemyMax()*.45);
  const enragedMitigation=bossGearDamageMitigation();
  S.boss=false;const outside=bossGearDamageMitigation(),healOutside=bossGearLifeSteal(1000);
  S.equip=previous.equip;S.boss=previous.boss;S.stage=previous.stage;
  S.enemyHp=previous.hp;bossEnragedStage=previous.latched;
  return {normalMitigation,enragedMitigation,heal,outside,healOutside};
 });
 expect(outcome.normalMitigation).toBeCloseTo(.12);
 expect(outcome.enragedMitigation).toBeCloseTo(.30);
 expect(outcome.heal).toBe(60);
 expect(outcome.outside).toBe(0);
 expect(outcome.healOutside).toBe(0);
});

test('boss crafting view displays each unique combat trait',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>renderBossForge());
 for(const title of ['수왕의 가호','포자 흡수','그리핀의 심판','용암 폭주','골렘의 결의'])expect(result).toContain(title);
});
