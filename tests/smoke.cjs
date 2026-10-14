// Run: node tests/smoke.cjs
// No dependencies; protects against inert tabs and initial-render crashes.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,'app script missing');
const src=match[1],end=src.lastIndexOf('\nrender();');
assert.ok(end>0,'script boot marker missing');
const elements=new Map();
function element(){return {innerHTML:'',textContent:'',style:{},className:'',classList:{add(){},remove(){},toggle(){}},getAttribute(k){return this[k]},setAttribute(k,v){this[k]=v}};}
const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelector(id){return this.getElementById(id)}};
let save={};
const localStorage={getItem(k){return save[k]||null},setItem(k,v){save[k]=v}};
const window={addEventListener(){}};
const sandbox={document,localStorage,window,Math,Date,console,setTimeout(){},setInterval(){},clearTimeout(){}};
vm.createContext(sandbox);vm.runInContext(src.slice(0,end),sandbox,{timeout:2000});
function execute(code){return vm.runInContext(code,sandbox,{timeout:2000})}
function check(name,fn){fn();console.log('PASS '+name)}
check('every main screen',()=>{for(const t of ['던전','대장간','장비','도감','상점']){execute('TAB='+JSON.stringify(t)+';render()');assert.ok(document.getElementById('screen').innerHTML.length>100,t)}});
check('forge subtabs',()=>{execute("TAB='대장간'");for(const t of ['제작','강화','분해','합성','승급']){execute('setForgeMode('+JSON.stringify(t)+')');assert.ok(document.getElementById('screen').innerHTML.includes(t),t)}});
check('gear category tabs',()=>{execute("TAB='장비'");for(const t of ['전체','무기','갑옷','방패','반지','기타']){execute('setInventoryFilter('+JSON.stringify(t)+')');assert.ok(document.getElementById('screen').innerHTML.includes('inventoryGrid'),t)}});
check('codex tabs',()=>{execute("TAB='도감'");for(const t of ['equipment','monster','region']){execute('S.codexTab='+JSON.stringify(t)+';render()');assert.ok(document.getElementById('screen').innerHTML.includes('도감'),t)}});
check('gear unequip and lock',()=>{execute("TAB='장비';setInventoryFilter('전체')");const old=execute('S.equip.weapon');execute('equipItem('+old+')');assert.equal(execute('S.equip.weapon'),null);execute('toggleItemLock('+old+')');assert.equal(execute('S.inventory['+old+'].locked'),true)});
check('craft and all forge actions render',()=>{execute("TAB='대장간';S.ore+=5000;S.crystals+=500;S.gold+=500000");for(let i=0;i<6;i++)execute("craft('weapon',true)");for(const t of ['강화','분해','합성','승급'])execute('setForgeMode('+JSON.stringify(t)+')')});
check('combat mode switch',()=>{execute("TAB='던전';setBattleMode('manual')");assert.equal(execute('S.battleMode'),'manual');execute("setBattleMode('auto')");assert.equal(execute('S.battleMode'),'auto')});
console.log('All UI smoke checks passed.');
