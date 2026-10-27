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
function testRemoval(){
 const A={id:'a',kind:'weapon'},B={id:'b',kind:'armor'},C={id:'c',kind:'ring'},D={id:'d',kind:'shield'};
 const state={inventory:[A,B,C,D],equip:{weapon:0,armor:1,ring:2,shield:3}};
 const ctx={S:state};vm.createContext(ctx);vm.runInContext(removeSource,ctx);
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
 vm.createContext(ctx);vm.runInContext(saveSource,ctx);return ctx.save();
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
