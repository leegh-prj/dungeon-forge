const {test,expect}=require('@playwright/test');
const KEY='dungeon-forge-ui-v2';
const baseSave={playerName:'QA SAVED',gold:777,ore:120,crystals:20,stage:2,hp:1280,maxHp:1280,enemyHp:1200,enemyMax:1200,boss:false,kills:0,stageKills:0,battleMode:'manual',inventory:[
{id:'qa-w',kind:'weapon',name:'QA Sword',tier:1,effect:'화상',power:20,defense:0,level:1},
{id:'qa-a',kind:'armor',name:'QA Armor',tier:1,effect:'견고함',power:0,defense:20},
{id:'qa-r',kind:'ring',name:'QA Ring',tier:1,effect:'흡혈',power:8,defense:4},
{id:'qa-spare',kind:'weapon',name:'QA Spare',tier:0,effect:'화상',power:5,defense:0}
],warehouse:[],equip:{weapon:0,armor:1,shield:null,ring:2},last:Date.now()};
test.beforeEach(async({page})=>{
 await page.addInitScript(({key,saved})=>{if(sessionStorage.getItem('qa-seeded')!=='1'){localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem(key+'-backup',JSON.stringify(saved));sessionStorage.setItem('qa-seeded','1')}},{key:KEY,saved:baseSave});
});
test('existing save survives reload and equipment identity remains stable',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#screen')).not.toBeEmpty();
 let state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
 expect(state.playerName).toBe('QA SAVED');
 expect(state.inventory[state.equip.weapon].id).toBe('qa-w');
 await page.evaluate(()=>moveToWarehouse(3));
 await page.reload();
 state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
 expect(state.inventory[state.equip.weapon].id).toBe('qa-w');
 expect(state.inventory[state.equip.armor].id).toBe('qa-a');
 expect(state.inventory[state.equip.ring].id).toBe('qa-r');
 expect(state.warehouse.map(x=>x.id)).toContain('qa-spare');
 await page.evaluate(()=>moveToBag(0));
 await page.reload();
 state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
 expect(state.inventory.map(x=>x.id)).toContain('qa-spare');
 expect(state.warehouse).toHaveLength(0);
});
test('corrupted primary falls back to valid backup',async({page})=>{
 await page.addInitScript(key=>localStorage.setItem(key,'{bad-json'),KEY);
 await page.goto('/');
 await expect(page.locator('#screen')).not.toBeEmpty();
 const state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
 expect(state.playerName).toBe('QA SAVED');
 expect(state.inventory[state.equip.weapon].id).toBe('qa-w');
});
for(const width of [320,360,390,430]){
 test('mobile '+width+'px navigation and codex',async({page})=>{
  await page.setViewportSize({width,height:760});
  await page.goto('/');
  await expect(page.locator('#screen')).not.toBeEmpty();
  await page.evaluate(()=>{TAB='도감';S.codexTab='monster';render()});
  await expect(page.locator('.monsterCodexCard')).toHaveCount(10);
  await expect(page.locator('.monsterCodexCard img').first()).toHaveJSProperty('naturalWidth',512);
  await expect(page.locator('.monsterFilter').first()).toBeVisible();
  const overflows=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
  expect(overflows).toBe(false);
 });
}
