const {test,expect}=require('@playwright/test');

test('P0 save recovery: structurally invalid JSON uses the last valid backup',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
   S.gold=54321;
   if(!save())throw Error('fixture could not save');
   const valid=localStorage.getItem(K);
   localStorage.setItem(K+'-backup',valid);
   localStorage.setItem(K,JSON.stringify({garbage:true,stage:1}));
 });
 await page.reload({waitUntil:'domcontentloaded'});
 const result=await page.evaluate(()=>({gold:S.gold,inventory:Array.isArray(S.inventory),stage:S.stage,validPrimary:GameSaveCore.validSnapshot(localStorage.getItem(K))}));
 expect(result).toEqual({gold:54321,inventory:true,stage:1,validPrimary:true});
});
test('P0 save validation: structurally damaged objects cannot replace backup',async({page})=>{
 await page.goto('/');
 const r=await page.evaluate(()=>{
  const valid=JSON.stringify({...S,last:Date.now()});
  const invalid=['{}','[]','null',JSON.stringify({stage:1,gold:10}),JSON.stringify({stage:0,gold:10,inventory:[],equip:{}})];
  return {valid:GameSaveCore.validSnapshot(valid),invalidRejected:invalid.every(v=>!GameSaveCore.validSnapshot(v))};
 });
 expect(r).toEqual({valid:true,invalidRejected:true});
});
