const {test,expect}=require('@playwright/test');

test('weapon mastery distinguishes five elements and counters their boss regions',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const originalStage=S.stage,originalBoss=S.boss,originalEquip={...S.equip};
  const definition=recipeDefs.find(x=>x.kind==='weapon');
  const kinds=['water','fire','poison','storm','earth'];
  const effect={water:'냉기',fire:'화상',poison:'독',storm:'번개',earth:'견고함'};
  const outcomes=[];
  try{
    for(const k of kinds){
      const it=mkItem(definition,1,effect[k]);
      S.inventory.push(it);S.equip.weapon=S.inventory.length-1;
      const skill=forgedSkillInfo();
      const bossRegion=ELEMENT_COUNTERS[k];
      const stage=REGIONS.findIndex(x=>x.key===bossRegion)+1;
      S.stage=stage;S.boss=true;
      const before=enemyAttackAt;
      const result=applyForgedStrikeSkill(200);
      outcomes.push({key:k,skill:skill?.element,damage:result.amount,
        hasCounter:result.description.includes('약점 격파'),correctRegion:regionInfo().key===bossRegion});
      enemyAttackAt=before;
    }
  }finally{S.stage=originalStage;S.boss=originalBoss;S.equip=originalEquip}
  return outcomes;
 });
 expect(result).toHaveLength(5);
 for(const x of result){
  expect(x.skill).toBe(x.key);
  expect(x.damage).toBeGreaterThan(200);
  expect(x.hasCounter).toBe(true);
  expect(x.correctRegion).toBe(true);
 }
});

test('boss guide explains recommended weakness and equipped skill',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
   const prev={boss:S.boss,stage:S.stage};
   S.stage=1;S.boss=true;
   const weapon=mkItem(recipeDefs.find(x=>x.kind==='weapon'),1,'독');
   S.inventory.push(weapon);const oldWeapon=S.equip.weapon;S.equip.weapon=S.inventory.length-1;
   const html=bossGuide();
   S.stage=prev.stage;S.boss=prev.boss;S.equip.weapon=oldWeapon;
   return html;
 });
 expect(result).toContain('추천');
 expect(result).toContain('독');
 expect(result).toContain('약점 공략 가능');
 expect(result).toContain('맹독 각인');
});

test('first tutorial craft gives a B-tier weapon with counter element and does not auto equip',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const prevIntro=S.intro,prevStage=S.stage,prevEquip=S.equip.weapon;
  const prevBag=S.bagCapacity,prevWarehouse=S.warehouseCapacity,prevSalvage=S.autoSalvageTier;
  S.stage=1;S.intro={step:1,completed:false,craftedId:null};
  S.craftTab='weapon';S.focus='balanced';S.ore=10000;S.crystals=10000;
  S.bagCapacity=Math.max(S.bagCapacity,S.inventory.length+1);
  S.warehouseCapacity=Math.max(S.warehouseCapacity,S.warehouse.length+1);
  S.autoSalvageTier=-1;
  const item=craft('weapon',true);
  const result={tier:item?.tier,effect:item?.effect,unchangedEquip:S.equip.weapon===prevEquip,advanced:S.intro.step===2};
  S.intro=prevIntro;S.stage=prevStage;S.bagCapacity=prevBag;S.warehouseCapacity=prevWarehouse;S.autoSalvageTier=prevSalvage;
  return result;
 });
 expect(result).toEqual({tier:1,effect:'독',unchangedEquip:true,advanced:true});
});

test('unskilled attack has no mastery bonus or enemy side effects',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
   const oldEquip=S.equip.weapon,oldAttack=enemyAttackAt,oldPoison=enemyPoisonUntil;
   S.equip.weapon=null;
   const value=applyForgedStrikeSkill(250);
   const unchanged=enemyAttackAt===oldAttack&&enemyPoisonUntil===oldPoison;
   S.equip.weapon=oldEquip;
   return {value,unchanged};
 });
 expect(result.value).toEqual({amount:250,description:''});
 expect(result.unchanged).toBe(true);
});

test('higher grade weapon amplifies its mastery bonus without altering inventory',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='weapon');
  const first=mkItem(def,0,'화상'),legend=mkItem(def,MAX_TIER,'화상');
  S.inventory.push(first,legend);
  const old=S.equip.weapon,stage=S.stage,boss=S.boss,enemy=S.enemyHp;
  S.stage=2;S.boss=false;S.equip.weapon=S.inventory.length-2;
  const basic=applyForgedStrikeSkill(200).amount;
  S.equip.weapon=S.inventory.length-1;
  const high=applyForgedStrikeSkill(200).amount;
  S.equip.weapon=old;S.stage=stage;S.boss=boss;
  return {basic,high,enemyUnchanged:S.enemyHp===enemy};
 });
 expect(result.high).toBeGreaterThan(result.basic);
 expect(result.enemyUnchanged).toBe(true);
});

test('combat UI labels strong skill with equipped weapon mastery',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='weapon'),item=mkItem(def,1,'번개');
  S.inventory.push(item);
  const prev={weapon:S.equip.weapon,mode:S.battleMode};
  S.equip.weapon=S.inventory.length-1;S.battleMode='manual';
  const html=renderDungeon();
  S.equip.weapon=prev.weapon;S.battleMode=prev.mode;
  return html;
 });
 expect(result).toContain('뇌전 격파');
 expect(result).toContain('aria-label="뇌전 격파"');
});
