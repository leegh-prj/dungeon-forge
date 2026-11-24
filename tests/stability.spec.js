const { test, expect } = require('@playwright/test');
test.beforeEach(async ({ page }) => {
 await page.goto('/');
 await expect(page.locator('#screen')).not.toBeEmpty();
});
test('startup and all five navigation views render', async ({ page }) => {
 for (const tab of ['던전','대장간','장비','도감','상점']) {
  await page.evaluate(tab => switchMainTab(tab), tab);
  await expect(page.locator('#screen')).not.toBeEmpty();
  await expect(page.locator('#gameErrorDetail')).toHaveCount(0);
 }
});
test('save snapshot survives reload without losing inventory', async ({ page }) => {
 const before=await page.evaluate(() => ({items:S.inventory.map(x=>x.id),stage:S.stage,key:K}));
 await page.evaluate(() => save());
 await page.reload();
 const after=await page.evaluate(() => ({items:S.inventory.map(x=>x.id),stage:S.stage,key:K}));
 expect(after).toEqual(before);
});
test('invalid primary snapshot restores exact backup stage and gear', async ({ page, context }) => {
 const expected=await page.evaluate(() => {
  save();
  const snapshot=JSON.parse(localStorage.getItem(K));
  // A valid higher stage proves recovery happened, not a fresh-game reset.
  snapshot.stage=7;
  localStorage.setItem(K+'-backup',JSON.stringify(snapshot));
  localStorage.setItem(K,JSON.stringify({stage:-1,inventory:null,equip:null}));
  return {stage:snapshot.stage,ids:snapshot.inventory.map(x=>x.id)};
 });
 // Open a separate page without unloading the live source page; beforeunload saves
 // are a separate behavior and must not overwrite this synthetic corruption.
 const recoveredPage=await context.newPage();
 await recoveredPage.goto('/');
 const restored=await recoveredPage.evaluate(() => ({stage:S.stage,ids:S.inventory.map(x=>x.id)}));
 expect(restored).toEqual(expected);
});
test('save recovery rejects malformed snapshots without throwing', async ({ page }) => {
 const check=await page.evaluate(() => {
  const valid=JSON.stringify({stage:3,inventory:[],equip:{weapon:null}});
  const bad=['{','null','[]',JSON.stringify({stage:-2,inventory:[],equip:{}})];
  return bad.every(raw=>GameSaveCore.recoverSnapshot(raw,valid)?.stage===3);
 });
 expect(check).toBe(true);
});
test('inventory removal preserves equipped indices', async ({ page }) => {
 const result=await page.evaluate(() => {
  const st={inventory:[{id:'a'},{id:'b'},{id:'c'}],equip:{weapon:2,armor:null,shield:null,ring:null}};
  const first=GameInventoryCore.removeAt(st,0);
  let guarded=false;
  try {GameInventoryCore.removeAt(st,1)} catch(e){guarded=true}
  return {removed:first.id,remaining:st.inventory.map(x=>x.id),weapon:st.equip.weapon,guarded};
 });
 expect(result).toEqual({removed:'a',remaining:['b','c'],weapon:1,guarded:true});
});
test('milestone claim cannot pay twice', async ({ page }) => {
 const value=await page.evaluate(() => {
  S.stage=4;S.bossMilestoneClaimed=[];
  const initial=S.gold;
  claimBossMilestone(4);
  const once=S.gold;
  claimBossMilestone(4);
  return {delta:once-initial,duplicate:S.gold-once};
 });
 expect(value).toEqual({delta:3500,duplicate:0});
});
test('all game views fit narrow mobile width without horizontal overflow', async ({ page }) => {
 for(const width of [320,360,390]){
  await page.setViewportSize({width,height:760});
  for(const tab of ['던전','대장간','장비','도감','상점']){
   await page.evaluate(name=>switchMainTab(name),tab);
   await expect(page.locator('#gameErrorDetail')).toHaveCount(0);
   const dims=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    view:document.documentElement.clientWidth
   }));
   expect(dims.scroll,tab+' at '+width+'px').toBeLessThanOrEqual(dims.view+2);
  }
 }
});

test('normal kill grants exactly one reward and spawns full-health opponent', async ({ page }) => {
 const result=await page.evaluate(() => {
  S.battleMode='manual';S.stage=1;S.boss=false;S.stageKills=0;S.enemyHp=1;
  const oldKills=S.kills,oldGold=S.gold;
  damageEnemy(999999);
  return {kills:S.kills-oldKills,stageKills:S.stageKills,stage:S.stage,
   rewardGold:S.gold-oldGold,enemyFull:S.enemyHp===getEnemyMax()};
 });
 expect(result.kills).toBe(1);
 expect(result.stageKills).toBe(1);
 expect(result.stage).toBe(1);
 expect(result.rewardGold).toBeGreaterThan(0);
 expect(result.enemyFull).toBe(true);
});
test('lethal counterattack resolves one win without negative hero HP', async ({ page }) => {
 const result=await page.evaluate(() => {
  // A test-only local loadout; no production save is modified.
  const ring=S.inventory.findIndex(item=>item.kind==='ring');
  if(ring<0)throw Error('missing starting ring');
  S.inventory[ring].effect='반격';S.equip.ring=ring;
  S.enemyHp=1;S.hp=1;S.stage=1;S.boss=false;S.stageKills=0;
  const oldKills=S.kills;
  takeDamage(999999);
  return {kills:S.kills-oldKills,hp:S.hp,stageKills:S.stageKills,enemyFull:S.enemyHp===getEnemyMax()};
 });
 expect(result.kills).toBe(1);
 expect(result.hp).toBeGreaterThanOrEqual(1);
 expect(result.stageKills).toBe(1);
 expect(result.enemyFull).toBe(true);
});
test('crafting spends only listed resources and creates one item', async ({ page }) => {
 const result=await page.evaluate(() => {
  S.intro=null;S.autoSalvageTier=-1;S.focus='balanced';S.autoLockTier=7;
  S.ore=1000;S.crystals=100;S.bagCapacity=999;
  const initial={count:S.inventory.length,ore:S.ore,crystals:S.crystals};
  const made=craft('weapon',true,true);
  return {made:!!made,count:S.inventory.length-initial.count,
   oreSpent:initial.ore-S.ore,crystalsSpent:initial.crystals-S.crystals};
 });
 expect(result).toEqual({made:true,count:1,oreSpent:10,crystalsSpent:0});
});
test('enhancement probability is bounded and max-level gear cannot roll', async ({ page }) => {
 const result=await page.evaluate(() => {
  const item={kind:'weapon',level:0,power:50,defense:0,upgradeFails:0};
  const rates=[];
  for(let level=0;level<=20;level++){
   item.level=level;rates.push(enhancementChance(item));
  }
  return rates;
 });
 expect(result).toHaveLength(21);
 expect(result.slice(0,20).every(v=>Number.isFinite(v)&&v>=0&&v<=100)).toBe(true);
 expect(result[20]).toBe(0);
});

test('UI navigation preserves inventory references and equipment indices', async ({ page }) => {
 const results=await page.evaluate(()=>{
  const originalInventory=S.inventory;
  const firstIds=S.inventory.map(item=>item.id).join('|');
  const before=JSON.stringify(S.equip);
  for(const tab of ['대장간','장비','도감','상점','던전']){
   switchMainTab(tab);
   if(S.inventory!==originalInventory)return {stable:false,reason:'inventory array replaced'};
  }
  return {stable:true,idsUnchanged:S.inventory.map(item=>item.id).join('|')===firstIds,
   equipUnchanged:JSON.stringify(S.equip)===before};
 });
 expect(results).toEqual({stable:true,idsUnchanged:true,equipUnchanged:true});
});
