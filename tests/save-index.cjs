'use strict';
/* Exercise actual game functions in isolated VM contexts; never access player localStorage. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
function fn(name,next){
 const start=html.indexOf('function '+name+'('),end=html.indexOf(next,start);
 assert(start>=0&&end>start,'Missing source '+name);
 return html.slice(start,end);
}
const removeSource=fn('removeInventoryAt','function moveToWarehouse(');
const saveCore=fs.readFileSync(require('node:path').join(__dirname,'..','assets/js/save-core.js'),'utf8');
const inventoryCore=fs.readFileSync(require('node:path').join(__dirname,'..','assets/js/inventory-core.js'),'utf8');
function testRemoval(){
 const A={id:'a',kind:'weapon'},B={id:'b',kind:'armor'},C={id:'c',kind:'ring'},D={id:'d',kind:'shield'};
 const state={inventory:[A,B,C,D],equip:{weapon:0,armor:1,ring:2,shield:3}};
 const ctx={S:state};vm.createContext(ctx);vm.runInContext(inventoryCore,ctx);vm.runInContext(removeSource,ctx);
 assert.throws(()=>ctx.removeInventoryAt(0),/equipped/);
 assert.equal(state.inventory.length,4);
 state.equip.armor=null;
 assert.equal(ctx.removeInventoryAt(1),B);
 assert.deepEqual(state.inventory.map(x=>x.id),['a','c','d']);
 assert.deepEqual({...state.equip},{weapon:0,armor:null,ring:1,shield:2});
 assert.equal(state.inventory[state.equip.ring],C);
 assert.equal(state.inventory[state.equip.shield],D);
 assert.equal(ctx.removeInventoryAt(-1),null);
 // Simulate descending batch removal while respecting equipped indices.
 state.inventory.push({id:'e',kind:'armor'},{id:'f',kind:'armor'});
 for(const i of [4,3])ctx.removeInventoryAt(i);
 assert.deepEqual(state.inventory.map(x=>x.id),['a','c','d']);
 console.log('PASS equipped inventory identity and descending removal');
}
const saveSource=fn('save','function toast(');
function storage(seed={}){
 const m=new Map(Object.entries(seed));
 return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),dump:()=>Object.fromEntries(m)};
}
function runSave(store,state){
 const ctx={S:state,K:'dungeon-forge-ui-v2',localStorage:store,saveErrorReported:false,console,document:{getElementById:()=>null},Date};
 vm.createContext(ctx);vm.runInContext(saveCore,ctx);vm.runInContext(saveSource,ctx);return ctx.save();
}
function testSaves(){
 const K='dungeon-forge-ui-v2',B=K+'-backup';
 const old={inventory:[{id:'old',kind:'weapon'}],equip:{weapon:0},last:10};
 const store=storage({[K]:JSON.stringify(old)});
 assert.equal(runSave(store,{...old,gold:99,last:10}),true);
 assert.equal(JSON.parse(store.getItem(B)).inventory[0].id,'old');
 assert.equal(JSON.parse(store.getItem(K)).gold,99);
 const preserved=JSON.stringify(old);
 const broken=storage({[K]:'{bad json',[B]:preserved});
 assert.equal(runSave(broken,{...old,gold:7}),true);
 assert.equal(broken.getItem(B),preserved);
 assert.equal(JSON.parse(broken.getItem(K)).gold,7);
 const fresh=storage();assert.equal(runSave(fresh,{inventory:[],equip:{},last:0}),true);
 assert.equal(fresh.getItem(B),fresh.getItem(K));
 const fail=storage();fail.setItem=()=>{throw Error('quota')};
 const failed={inventory:[],equip:{},last:123};
 assert.equal(runSave(fail,failed),false);assert.equal(failed.last,123);
 console.log('PASS existing backup, malformed primary recovery, first save and quota failure');
}
testRemoval();testSaves();

/* End-to-end state transition model using actual removal/move/forge functions. */
function testInventoryReloadJourney(){
 const K='dungeon-forge-ui-v2';
 const mk=(id,kind,tier=0)=>({id,kind,tier,level:0,locked:false});
 const state={inventory:[mk('weapon','weapon'),mk('armor','armor'),mk('ring','ring'),mk('material1','weapon'),mk('material2','weapon'),mk('material3','weapon')],
  warehouse:[],warehouseCapacity:400,bagCapacity:200,equip:{weapon:0,armor:1,shield:null,ring:2},gold:300,ore:100,crystals:10,last:0};
 const initialIds=state.inventory.slice(0,3).map(v=>v.id);
 const store=storage();
 const ctx={S:state,K,localStorage:store,saveErrorReported:false,console,document:{getElementById:()=>null},Date,
  forgeSelection:[],isLocked:it=>!!it.locked,isEquipped:i=>Object.values(state.equip).includes(i),
  toast:()=>{},render:()=>{},getMaxHp:()=>1280,introAdvance:()=>{},closeCraft:()=>{},showForgeSummary:()=>{}};
 vm.createContext(ctx);
 const move=fn('moveToWarehouse','function moveToBag(');
 const bag=fn('moveToBag','function bulkWarehouseToBag(');
 const forge=fn('removeForgeItems','function runForge(');
 vm.runInContext(inventoryCore,ctx);vm.runInContext(saveCore,ctx);vm.runInContext(removeSource+move+bag+forge+saveSource,ctx);
 const invariant=()=>{
  for(const [kind,index] of Object.entries(state.equip))if(index!==null){
   assert.equal(state.inventory[index]?.kind,kind);
   assert.equal(state.inventory[index]?.id,initialIds[['weapon','armor','ring'].indexOf(kind)]);
  }
  const ids=[...state.inventory,...state.warehouse].map(v=>v.id);
  assert.equal(new Set(ids).size,ids.length,'item duplication');
 };
 assert.equal(ctx.save(),true);
 state.inventory[0].level=1;assert.equal(ctx.save(),true); // simulated enhancement
 ctx.forgeSelection=[3,4,5];ctx.removeForgeItems([3,4,5]); // simulated fusion material consumption
 state.inventory.push(mk('fused','weapon',1));
 invariant();assert.equal(ctx.save(),true);
 ctx.moveToWarehouse(3);
 invariant();assert.equal(state.warehouse[0].id,'fused');
 ctx.moveToBag(0);
 invariant();assert.equal(ctx.save(),true);
 // Simulated browser refresh: JSON reload into a fresh object with the same legacy schema.
 const restored=JSON.parse(store.getItem(K));
 assert.deepEqual(restored.inventory.map(x=>x.id),state.inventory.map(x=>x.id));
 assert.deepEqual(restored.equip,state.equip);
 assert.equal(restored.inventory[restored.equip.weapon].level,1);
 assert.equal(restored.gold,300);
 // Power interruption / damaged primary: backup remains parsable and slot-safe.
 store.setItem(K,'{interrupted');
 const recovered=JSON.parse(store.getItem(K+'-backup'));
 assert.equal(recovered.inventory[recovered.equip.weapon].id,'weapon');
 console.log('PASS craft-like generation, upgrade, fusion removal, warehouse round-trip, reload and recovery');
}
testInventoryReloadJourney();

function testSnapshotValidation(){
 const context={};vm.createContext(context);vm.runInContext(saveCore,context);
 for(const raw of [null,'','null','[]','3','"x"','{broken']){
  assert.equal(context.GameSaveCore.validSnapshot(raw),false);
 }
 assert.equal(context.GameSaveCore.validSnapshot('{"inventory":[],"equip":{}}'),true);
 const K='dungeon-forge-ui-v2',B=K+'-backup';
 const good=JSON.stringify({inventory:[{id:'kept',kind:'weapon'}],equip:{weapon:0}});
 const brokenBackup=storage({[K]:good,[B]:'{damaged'});
 assert.equal(runSave(brokenBackup,{inventory:[{id:'kept',kind:'weapon'}],equip:{weapon:0},gold:77}),true);
 assert.equal(JSON.parse(brokenBackup.getItem(B)).inventory[0].id,'kept');
 assert.equal(JSON.parse(brokenBackup.getItem(K)).gold,77);
 console.log('PASS save-core snapshot validation and corrupted backup replacement');
}
testSnapshotValidation();
