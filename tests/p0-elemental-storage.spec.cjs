const {test,expect}=require('@playwright/test');

test('P0 elemental craft stores in warehouse when bag is full',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const region=forgeRegion();
  const def=recipeDefs.find(x=>x.kind==='weapon');
  S.craftTab='weapon';S.focus='balanced';
  S.materials[region.key]=20;
  S.ore=2000;S.crystals=2000;
  S.bagCapacity=S.inventory.length;
  S.warehouseCapacity=S.warehouse.length+2;
  const before={bag:S.inventory.length,warehouse:S.warehouse.length,ore:S.ore,crystals:S.crystals,material:S.materials[region.key]};
  const priorIds=new Set(S.warehouse.map(x=>x.id));
  forgeElemental();
  const added=S.warehouse.filter(x=>!priorIds.has(x.id));
  return {bagSame:S.inventory.length===before.bag,warehouseAdded:added.length===1,
   infused:added[0]?.infusion===region.key,unique:added.length===1&&!!added[0].id,
   oreSpent:before.ore-S.ore,crystalsSpent:before.crystals-S.crystals,
   materialSpent:before.material-S.materials[region.key],
   expectedOre:def.ore+12,expectedCrystals:def.crystal+1};
 });
 expect(result.bagSame).toBe(true);
 expect(result.warehouseAdded).toBe(true);
 expect(result.infused).toBe(true);
 expect(result.unique).toBe(true);
 expect(result.oreSpent).toBe(result.expectedOre);
 expect(result.crystalsSpent).toBe(result.expectedCrystals);
 expect(result.materialSpent).toBe(4);
});

test('P0 elemental craft with full bag and warehouse does not spend resources',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const region=forgeRegion();
  S.craftTab='weapon';S.focus='balanced';
  S.materials[region.key]=12;S.ore=1000;S.crystals=1000;
  S.bagCapacity=S.inventory.length;S.warehouseCapacity=S.warehouse.length;
  const before={ore:S.ore,crystals:S.crystals,materials:S.materials[region.key],bag:S.inventory.length,warehouse:S.warehouse.length};
  forgeElemental();
  const after={ore:S.ore,crystals:S.crystals,materials:S.materials[region.key],bag:S.inventory.length,warehouse:S.warehouse.length};
  return {before,after};
 });
 expect(result.after).toEqual(result.before);
});
