const {test,expect}=require('@playwright/test');

test('five weapon masteries show distinct visual identities on the battlefield',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const oldTab=TAB,oldStage=S.stage,oldBoss=S.boss,oldWeapon=S.equip.weapon;
  TAB='던전';dungeonPanel='fight';S.stage=1;S.boss=false;render();
  const effects={fire:'화상',water:'냉기',poison:'독',storm:'번개',earth:'견고함'};
  const def=recipeDefs.find(r=>r.kind==='weapon');
  const outputs=[];
  for(const [key,effect] of Object.entries(effects)){
   const it=mkItem(def,0,effect);S.inventory.push(it);S.equip.weapon=S.inventory.length-1;
   const skill=forgedSkillInfo();showMasteryImpact(skill,42,false);
   const layer=document.querySelector('#masteryImpact'),field=document.querySelector('.battlefield');
   outputs.push({key,layerClass:layer.className,fieldClass:field.className,
     heading:layer.querySelector('strong')?.textContent,detail:layer.querySelector('span')?.textContent});
  }
  masteryImpact=null;updateMasteryImpact();S.equip.weapon=oldWeapon;S.stage=oldStage;S.boss=oldBoss;TAB=oldTab;
  return outputs;
 });
 expect(result).toHaveLength(5);
 for(const item of result){
  expect(item.layerClass).toContain('mastery-'+item.key);
  expect(item.fieldClass).toContain('mastery-'+item.key);
  expect(item.heading.length).toBeGreaterThan(4);
  expect(item.detail).toContain('+42');
 }
});

test('weakness strike has distinct counter feedback and expires without changing saved state',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const oldTab=TAB;
  TAB='던전';dungeonPanel='fight';render();
  const before=JSON.stringify(S);
  showMasteryImpact({element:'storm',name:'뇌전 격파',icon:'⚡'},77,true,1000);
  const active=document.querySelector('#masteryImpact').className;
  const enemy=document.querySelector('.battlefield').className;
  updateMasteryImpact(3000);
  const expired=document.querySelector('#masteryImpact').className;
  const cleared=!document.querySelector('.battlefield').classList.contains('mastery-counter');
  const stateUnchanged=JSON.stringify(S)===before;
  TAB=oldTab;
  return {active,enemy,expired,cleared,stateUnchanged};
 });
 expect(result.active).toContain('counter');
 expect(result.enemy).toContain('mastery-counter');
 expect(result.expired).toBe('masteryImpact');
 expect(result.cleared).toBe(true);
 expect(result.stateUnchanged).toBe(true);
});

for(const viewport of [{width:844,height:390},{width:390,height:844}]){
 test('mastery impact remains visible and non-interactive in '+viewport.width+'x'+viewport.height,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('/');
  await page.evaluate(()=>{
   TAB='던전';dungeonPanel='fight';render();
   showMasteryImpact({element:'fire',name:'용광로 일격',icon:'🔥'},128,true);
  });
  const impact=page.locator('#masteryImpact');
  await expect(impact).toHaveClass(/active/);
  await expect(impact.locator('strong')).toContainText('용광로 일격');
  const measurements=await impact.evaluate(el=>{
   const r=el.getBoundingClientRect(),style=getComputedStyle(el);
   return {left:r.left,right:r.right,view:innerWidth,pointerEvents:style.pointerEvents};
  });
  expect(measurements.left).toBeGreaterThanOrEqual(-3);
  expect(measurements.right).toBeLessThanOrEqual(measurements.view+3);
  expect(measurements.pointerEvents).toBe('none');
 });
}

test('automatic strong attack produces weapon-specific feedback as well',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  TAB='던전';dungeonPanel='fight';S.stage=1;S.boss=true;
  const item=mkItem(recipeDefs.find(r=>r.kind==='weapon'),0,'독');
  S.inventory.push(item);S.equip.weapon=S.inventory.length-1;
  S.enemyHp=Math.max(getEnemyMax(),100000);
  S.battleMode='auto';strikeReady=0;battleStunUntil=0;
  render();strike(true);
  return {skill:masteryImpact?.name,
    active:!!masteryImpact&&Date.now()<masteryImpact.until,
    poisonApplied:enemyPoisonUntil>Date.now(),
    counter:masteryImpact?.counter===true};
 });
 expect(result).toEqual({skill:'맹독 각인',active:true,poisonApplied:true,counter:true});
});
