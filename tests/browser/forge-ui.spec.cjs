const {test,expect}=require('@playwright/test');
const KEY='dungeon-forge-ui-v2';
async function setup(page){
 await page.goto('/');
 await page.evaluate(()=>{
  S.intro=null;S.battleMode='manual';S.gold=1000000;S.ore=100000;S.crystals=10000;
  S.autoSalvageTier=-1;S.autoLockTier=7;TAB='대장간';forgeMode='제작';forgeSelection=[];save();render();
 });
}
async function assertEquipped(page){
 const state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
 for(const [kind,index] of Object.entries(state.equip||{}))if(index!==null){
  expect(state.inventory[index]?.kind).toBe(kind);
 }
 return state;
}
test('actual forge craft button creates persistent gear',async({page})=>{
 await setup(page);
 const before=await page.evaluate(()=>S.inventory.length);
 await page.locator('.craftQuickActions button').first().click();
 await expect.poll(()=>page.evaluate(()=>S.inventory.length)).toBeGreaterThan(before);
 await page.reload();
 const state=await assertEquipped(page);
 expect(state.inventory.length).toBeGreaterThan(before);
});
test('actual forge enhancement selection preserves gear identity through reload',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  S.inventory.push({id:'qa-enhance',kind:'weapon',name:'QA Enhance',tier:0,effect:'화상',power:12,defense:0,level:0,locked:false});
  save();setForgeMode('강화');
 });
 await page.locator('.forgeItem').filter({hasText:'QA Enhance'}).click();
 await page.locator('button.primaryBtn').filter({hasText:'강화 실행'}).click();
 await page.reload();
 const state=await assertEquipped(page);
 const item=state.inventory.find(x=>x.id==='qa-enhance');
 expect(item).toBeTruthy();
 expect((item.level||0)+(item.upgradeFails||0)).toBeGreaterThan(0);
});
test('actual forge fusion buttons consume exactly three and persist a new item',async({page})=>{
 await setup(page);
 await page.evaluate(()=>{
  for(let i=0;i<3;i++)S.inventory.push({id:'qa-fusion-'+i,kind:'ring',name:'QA Fusion '+i,tier:0,effect:'흡혈',power:1,defense:1,locked:false});
  save();setForgeMode('합성');
 });
 for(let i=0;i<3;i++)await page.locator('.forgeItem').filter({hasText:'QA Fusion '+i}).click();
 await page.locator('button.primaryBtn').filter({hasText:'합성 실행'}).click();
 await page.reload();
 const state=await assertEquipped(page);
 expect(state.inventory.filter(x=>String(x.id).startsWith('qa-fusion-'))).toHaveLength(0);
 expect(state.inventory.some(x=>x.kind==='ring'&&x.tier===1)).toBe(true);
});
