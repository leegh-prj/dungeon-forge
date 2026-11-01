const { test, expect } = require('@playwright/test');

// Tests use a fresh browser context per case. No production or user save is touched.
test('P0 equip: toggles exactly the selected slot and survives reload', async ({page}) => {
 await page.goto('/');
 const result=await page.evaluate(() => {
  const before=JSON.stringify(S.inventory), old=S.equip.weapon, oldHp=S.hp;
  const def=recipeDefs.find(r=>r.kind==='weapon');
  const it=mkItem(def,0,effects[0]); S.inventory.push(it);
  const idx=S.inventory.length-1;
  equipItem(idx);
  const equipped=S.equip.weapon===idx && S.inventory[idx].id===it.id;
  const stored=JSON.parse(localStorage.getItem(K));
  const persisted=stored.equip.weapon===idx && stored.inventory[idx].id===it.id;
  equipItem(idx);
  const unequipped=S.equip.weapon===null;
  return {equipped,persisted,unequipped};
 });
 expect(result).toEqual({equipped:true,persisted:true,unequipped:true});
});

test('P0 crafting: insufficient resources do not change inventory or balances', async ({page}) => {
 await page.goto('/');
 const result=await page.evaluate(() => {
  S.ore=0;S.crystals=0;
  const before={ore:S.ore,crystals:S.crystals,items:S.inventory.length,warehouse:S.warehouse.length};
  craft('weapon',true,true);
  const after={ore:S.ore,crystals:S.crystals,items:S.inventory.length,warehouse:S.warehouse.length};
  return {before,after};
 });
 expect(result.after).toEqual(result.before);
});

test('P0 crafting: successful craft conserves currency and adds item', async ({page}) => {
 await page.goto('/');
 const result=await page.evaluate(() => {
  const def=recipeDefs.find(r=>r.kind==='weapon');
  S.ore=100000;S.crystals=100000;
  const before={ore:S.ore,crystals:S.crystals,items:S.inventory.length+S.warehouse.length};
  const previousFocus=S.focus;S.focus='balanced';
  const result=craft('weapon',true,true);
  S.focus=previousFocus;
  return {created:!!result, oreSpent:before.ore-S.ore, crystalSpent:before.crystals-S.crystals,itemsAdded:S.inventory.length+S.warehouse.length-before.items,expectedOre:def.ore,expectedCrystals:def.crystal};
 });
 expect(result.oreSpent).toBe(result.expectedOre);
 expect(result.crystalSpent).toBe(result.expectedCrystals);
 expect(result.itemsAdded).toBe(1);
});

test('P0 save: valid primary snapshot is backed up before replacement', async ({page}) => {
 await page.goto('/');
 const result=await page.evaluate(() => {
  S.gold=12345;const a=save();const first=localStorage.getItem(K);
  S.gold=23456;const b=save();const backup=localStorage.getItem(K+'-backup');
  return {a,b,oldGold:JSON.parse(backup).gold,newGold:JSON.parse(localStorage.getItem(K)).gold,firstValid:GameSaveCore.validSnapshot(first)};
 });
 expect(result).toEqual({a:true,b:true,oldGold:12345,newGold:23456,firstValid:true});
});
