const {test,expect}=require('@playwright/test');

test('P0 enhancement refuses insufficient resources without changing gear',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='weapon');
  const item=mkItem(def,0,effects[0]);
  S.inventory.push(item);forgeMode='강화';forgeSelection=[S.inventory.length-1];
  S.ore=0;S.gold=0;S.crystals=0;
  const before={id:item.id,level:itemPlus(item),fails:item.upgradeFails||0,ore:S.ore,gold:S.gold,crystals:S.crystals,count:S.inventory.length};
  runForge();
  const after={id:item.id,level:itemPlus(item),fails:item.upgradeFails||0,ore:S.ore,gold:S.gold,crystals:S.crystals,count:S.inventory.length};
  return {before,after};
 });
 expect(outcome.after).toEqual(outcome.before);
});

test('P0 +20 enhancement cap prevents any resource deduction',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const item=mkItem(recipeDefs.find(x=>x.kind==='armor'),0,effects[0]);item.level=20;
  S.inventory.push(item);forgeMode='강화';forgeSelection=[S.inventory.length-1];
  S.gold=50000;S.ore=2000;S.crystals=500;
  const before=[item.level,S.gold,S.ore,S.crystals,S.inventory.length];
  runForge();
  return {before,after:[item.level,S.gold,S.ore,S.crystals,S.inventory.length]};
 });
 expect(outcome.after).toEqual(outcome.before);
});

test('P0 failed enhancement charges exactly once and keeps the original item',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const item=mkItem(recipeDefs.find(x=>x.kind==='shield'),0,effects[0]);item.level=10;
  S.inventory.push(item);forgeMode='강화';forgeSelection=[S.inventory.length-1];
  S.gold=100000;S.ore=100000;S.crystals=100000;
  const p=forgePrice('강화'),before={gold:S.gold,ore:S.ore,crystals:S.crystals,id:item.id,count:S.inventory.length};
  const priorRandom=Math.random;
  try {Math.random=()=>0.999999;runForge()}
  finally{Math.random=priorRandom}
  return {cost:p,spent:{gold:before.gold-S.gold,ore:before.ore-S.ore,crystals:before.crystals-S.crystals},level:item.level,fails:item.upgradeFails,idSame:item.id===before.id,countSame:S.inventory.length===before.count};
 });
 expect(outcome.spent).toEqual(outcome.cost);
 expect(outcome.level).toBe(10);
 expect(outcome.fails).toBe(1);
 expect(outcome.idSame).toBe(true);
 expect(outcome.countSame).toBe(true);
});

test('P0 invalid fusion selection does not spend resources or consume gear',async({page})=>{
 await page.goto('/');
 const outcome=await page.evaluate(()=>{
  const def=recipeDefs.find(x=>x.kind==='ring');
  const items=[mkItem(def,0,effects[0]),mkItem(def,0,effects[0]),mkItem(def,1,effects[0])];
  S.inventory.push(...items);forgeMode='합성';forgeSelection=[S.inventory.length-3,S.inventory.length-2,S.inventory.length-1];
  S.gold=100000;S.ore=100000;S.crystals=100000;
  const before={gold:S.gold,ore:S.ore,crystals:S.crystals,ids:S.inventory.map(x=>x.id)};
  runForge();
  const after={gold:S.gold,ore:S.ore,crystals:S.crystals,ids:S.inventory.map(x=>x.id)};
  return {before,after};
 });
 expect(outcome.after).toEqual(outcome.before);
});
