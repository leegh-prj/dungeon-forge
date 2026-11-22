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
test('invalid primary snapshot restores exact backup stage and gear', async ({ page }) => {
 const expected=await page.evaluate(() => {
  save();
  const snapshot=JSON.parse(localStorage.getItem(K));
  // A valid higher stage proves recovery happened, not a fresh-game reset.
  snapshot.stage=7;
  localStorage.setItem(K+'-backup',JSON.stringify(snapshot));
  localStorage.setItem(K,JSON.stringify({stage:-1,inventory:null,equip:null}));
  return {stage:snapshot.stage,ids:snapshot.inventory.map(x=>x.id)};
 });
 await page.reload();
 const restored=await page.evaluate(() => ({stage:S.stage,ids:S.inventory.map(x=>x.id)}));
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
test('mobile viewport does not overflow horizontally', async ({ page,isMobile }) => {
 if (!isMobile) return;
 const dims=await page.evaluate(() => ({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
 expect(dims.scroll).toBeLessThanOrEqual(dims.view+2);
});
