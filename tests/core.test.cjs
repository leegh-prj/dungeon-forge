const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function loadScript(name){
 const ctx={};
 ctx.window=ctx;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),ctx,{filename:name});
 return ctx;
}
const save=loadScript('assets/js/save-core.js').GameSaveCore;
const inventory=loadScript('assets/js/inventory-core.js').GameInventoryCore;
const snapshot=(stage=1)=>JSON.stringify({stage,inventory:[{id:'one'}],equip:{weapon:0,armor:null,shield:null,ring:null}});

test('invalid primary restores intact backup',()=>{
 const restored=save.recoverSnapshot('{broken',snapshot(12));
 assert.equal(restored.stage,12);
 assert.equal(restored.inventory[0].id,'one');
});
test('valid primary takes precedence over backup',()=>{
 assert.equal(save.recoverSnapshot(snapshot(4),snapshot(8)).stage,4);
});
test('malformed save structures are rejected',()=>{
 for(const raw of [null,'','null','[]','{}','{broken',
  JSON.stringify({stage:0,inventory:[],equip:{}}),
  JSON.stringify({stage:2,inventory:null,equip:{}}),
  JSON.stringify({stage:2,inventory:[],equip:null})]){
  assert.equal(save.validSnapshot(raw),false);
 }
});
test('read-only recovery does not mutate snapshots',()=>{
 const primary=snapshot(3),backup=snapshot(5);
 save.recoverSnapshot(primary,backup);
 assert.equal(JSON.parse(primary).stage,3);
 assert.equal(JSON.parse(backup).stage,5);
});
test('removeAt adjusts equipped item index after deletion',()=>{
 const state={inventory:[{id:'a'},{id:'b'},{id:'c'}],equip:{weapon:2,armor:null,shield:null,ring:null}};
 assert.equal(inventory.removeAt(state,0).id,'a');
 assert.equal(state.equip.weapon,1);
 assert.deepEqual(state.inventory.map(x=>x.id),['b','c']);
});
test('removeAt rejects equipped and invalid removal',()=>{
 const state={inventory:[{id:'a'},{id:'b'}],equip:{weapon:1,armor:null,shield:null,ring:null}};
 assert.throws(()=>inventory.removeAt(state,1),/equipped/i);
 assert.equal(inventory.removeAt(state,-1),null);
 assert.equal(state.inventory.length,2);
});
