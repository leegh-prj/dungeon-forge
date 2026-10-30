const {test,expect}=require('@playwright/test');
test('equipped detail has zero stat deltas, candidate compares against equipped stats',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  S.intro=null;
  S.inventory.push({id:'qa-equipped-compare',kind:'weapon',name:'QA Equipped Compare',tier:0,effect:'화상',power:22,defense:3,level:2,locked:false});
  S.equip.weapon=S.inventory.length-1;
  S.inventory.push({id:'qa-candidate-compare',kind:'weapon',name:'QA Candidate Compare',tier:0,effect:'화상',power:30,defense:5,level:3,locked:false});
  TAB='장비';storageTab='bag';save();render();
 });
 let values=await page.evaluate(()=>compareItemToEquipped(S.equip.weapon));
 expect(values).toContain('>+0</strong>');
 expect(values).toContain('현재 장착 중인 아이템');
 const candidate=await page.evaluate(()=>compareItemToEquipped(S.inventory.findIndex(x=>x.id==='qa-candidate-compare')));
 expect(candidate).toContain('>+8</strong>');
 expect(candidate).toContain('>+2</strong>');
 expect(candidate).toContain('>+1</strong>');
 await page.reload();
 const after=await page.evaluate(()=>S.inventory[S.equip.weapon]?.id);
 expect(after).toBe('qa-equipped-compare');
});
