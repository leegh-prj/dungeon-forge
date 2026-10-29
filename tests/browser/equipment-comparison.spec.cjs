const {test,expect}=require('@playwright/test');
test('bag cards compare against currently equipped item without changing save',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  S.intro=null;
  const a={id:'compare-w1',kind:'weapon',name:'Compare Equipped',tier:0,effect:'화상',power:25,defense:0,locked:false};
  const b={id:'compare-w2',kind:'weapon',name:'Compare Candidate',tier:0,effect:'화상',power:45,defense:0,locked:false};
  S.inventory.push(a,b);S.equip.weapon=S.inventory.length-2;
  storageTab='bag';TAB='장비';save();render();
 });
 const card=page.locator('.invItem').filter({hasText:'Compare Candidate'});
 await expect(card.locator('.equipmentCompare')).toContainText('공격 +20');
 await page.reload();
 const snapshot=await page.evaluate(()=>({selected:S.inventory[S.equip.weapon]?.id,candidate:S.inventory.find(x=>x.id==='compare-w2')?.power}));
 expect(snapshot.selected).toBe('compare-w1');expect(snapshot.candidate).toBe(45);
});
test('forge readiness status reflects selected materials on portrait and landscape',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.evaluate(()=>{S.intro=null;TAB='대장간';setForgeMode('강화')});
 await expect(page.locator('.forgeActionStatus')).toContainText('필요한 장비');
 await page.setViewportSize({width:844,height:390});
 await expect(page.locator('.forgeActionStatus')).toBeVisible();
});
