const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const els={};
function el(id){if(!els[id])els[id]={innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){}};return els[id]}
const storage={};
const ctx=vm.createContext({console,Math,Date,document:{getElementById:el,addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},setTimeout(){},setInterval(){},});
vm.runInContext(source,ctx);const evalIn=s=>vm.runInContext(s,ctx);
for(const tab of ['던전','대장간','장비','도감','상점']){evalIn(`TAB=${JSON.stringify(tab)};render()`); assert(el('screen').innerHTML.length>200, tab+' failed')}
assert(evalIn('typeof renderMonsterCodex')==='function');
assert(evalIn('typeof renderRegionCodex')==='function');
assert(evalIn('iconFor({kind:"weapon",tier:4})').includes('items/weapons/5.webp'));
evalIn('S.codexTab="monster";TAB="도감";render()');assert(el('screen').innerHTML.includes('왕관 슬라임'));
evalIn('S.codexTab="region";render()');assert(el('screen').innerHTML.includes('기계 유적'));
evalIn('TAB="대장간";S.ore=10000;S.crystals=1000;craft("shield")');assert(evalIn('S.inventory.length')>=7);
assert(el('craftOverlay').classList);evalIn('closeCraft()');
evalIn('TAB="던전";S.boss=true;pendingBossAttack=Date.now()+100;render()');assert(el('screen').innerHTML.includes('combatAlert'));
console.log('Day 8 smoke tests PASS: 5 tabs, codex, crafting, boss UI, icon mapping');
