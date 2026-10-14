/* Dungeon Forge — interactive forge v1.1 */
let forgeMode='제작';
let forgePicked=[];
function itemPower(x){return (x?.power||0)+(x?.level||0)*(x?.kind==='weapon'?4:2)}
function itemDefense(x){return (x?.defense||0)+(x?.level||0)*(x?.kind==='weapon'?0:4)}
totalAtk=function(){return 120+itemPower(eq('weapon'))+itemPower(eq('ring'))+S.stage*8};
totalDef=function(){return 60+itemDefense(eq('armor'))+itemDefense(eq('shield'))+itemDefense(eq('ring'))+S.stage*12};
getMaxHp=function(){return 1280+itemDefense(eq('armor'))*6+itemDefense(eq('shield'))*3+S.stage*20};
function changeForgeMode(mode){forgeMode=mode;forgePicked=[];render()}
function pickForgeItem(i){
  if(!S.inventory[i])return;
  if(forgeMode==='합성'){
    if(isEquipped(i))return toast('장착 중인 장비는 합성 재료로 사용할 수 없습니다');
    if(forgePicked.includes(i))forgePicked=forgePicked.filter(v=>v!==i);
    else{if(forgePicked.length>=2)forgePicked.shift();forgePicked.push(i)}
  }else forgePicked=[i];
  render();
}
function removeForgeItems(indices){
  const descending=[...new Set(indices)].sort((a,b)=>b-a);
  if(descending.some(i=>isEquipped(i)))throw Error('Equipped gear cannot be consumed');
  for(const i of descending){
    S.inventory.splice(i,1);
    for(const kind of Object.keys(S.equip)){
      if(S.equip[kind]!==null&&S.equip[kind]>i) S.equip[kind]--;
    }
  }
  forgePicked=[];
}
function refreshForgeStats(){
  S.maxHp=getMaxHp();
  S.hp=Math.max(1,Math.min(S.hp,S.maxHp));
  save();
}
function forgeAction(){
  if(forgeMode==='제작')return craft();
  const index=forgePicked[0];
  const item=S.inventory[index];
  if(!item)return toast('장비를 선택하세요');
  if(forgeMode==='강화'){
    const next=(item.level||0)+1;
    if(next>10)return toast('최대 강화 단계는 +10입니다');
    const ore=8+next*6,gold=300+next*260;
    if(S.ore<ore||S.gold<gold)return toast('강화 재료가 부족합니다');
    S.ore-=ore;S.gold-=gold;item.level=next;
    refreshForgeStats();toast(item.name+' +'+next+' 강화 성공');return;
  }
  if(forgeMode==='분해'){
    if(isEquipped(index))return toast('장착 중인 장비는 분해할 수 없습니다');
    const ore=6+(item.tier+1)*5+(item.level||0)*3;
    const crystal=Math.floor((item.tier+1)/2);
    removeForgeItems([index]);S.ore+=ore;S.crystals+=crystal;
    save();toast('분해 성공! 광석 +'+ore+' · 결정 +'+crystal);return;
  }
  if(forgeMode==='승급'){
    if(item.tier>=4)return toast('최고 등급 SS는 승급할 수 없습니다');
    if((item.level||0)<3)return toast('장비를 +3 이상 강화해야 승급할 수 있습니다');
    const crystal=(item.tier+1)*12,gold=(item.tier+1)*2500;
    if(S.crystals<crystal||S.gold<gold)return toast('승급 재료가 부족합니다');
    S.crystals-=crystal;S.gold-=gold;
    item.tier+=1;item.level=0;
    const def=recipeDefs.find(x=>x.kind===item.kind);
    item.power=def.atk[item.tier];item.defense=def.def[item.tier];
    discover(item);refreshForgeStats();
    toast(rarityName[item.tier]+' '+item.name+' 승급 성공');return;
  }
  if(forgeMode==='합성'){
    if(forgePicked.length!==2)return toast('합성할 장비 2개를 선택하세요');
    const [a,b]=forgePicked,other=S.inventory[b];
    if(!other||a===b)return toast('서로 다른 장비 2개를 선택하세요');
    if(isEquipped(a)||isEquipped(b))return toast('장착 중인 장비는 합성할 수 없습니다');
    if(item.tier!==other.tier)return toast('같은 등급 장비끼리 합성할 수 있습니다');
    if(item.tier>=4)return toast('SS 등급은 합성할 수 없습니다');
    const cost=(item.tier+1)*8;
    if(S.crystals<cost)return toast('합성 결정이 부족합니다');
    const tier=item.tier+1;
    const def=recipeDefs[Math.floor(Math.random()*recipeDefs.length)];
    const newItem=mkItem(def,tier,effects[Math.floor(Math.random()*effects.length)]);
    S.crystals-=cost;removeForgeItems([a,b]);S.inventory.push(newItem);discover(newItem);
    save();toast(rarityName[newItem.tier]+' '+newItem.name+' 합성 성공');return;
  }
}
function forgeItemRow(item,index){
  const selected=forgePicked.includes(index),equipped=isEquipped(index);
  return '<button type="button" class="forgeRow '+(selected?'chosen ':'')+(equipped?'equipped':'')+'" onclick="pickForgeItem('+index+')" aria-pressed="'+selected+'">'+
    '<img src="'+iconFor(item)+'" alt=""><span><b>'+item.name+' '+(item.level?'+'+item.level:'')+'</b>'+
    '<small class="r'+item.tier+'">'+rarityLetter[item.tier]+' · 공격 '+itemPower(item)+' / 방어 '+itemDefense(item)+(equipped?' · 장착 중':'')+'</small></span><strong>'+(selected?'✓':'＋')+'</strong></button>';
}
function forgeOperations(){
  const it=S.inventory[forgePicked[0]];
  let message='',details='',button='';
  if(forgeMode==='강화'){
    message='장비를 최대 +10까지 100% 확률로 강화합니다. 강화 단계에 따라 공격력 또는 방어력이 증가합니다.';
    details=it?'광석 '+(8+((it.level||0)+1)*6)+' · 골드 '+(300+((it.level||0)+1)*260).toLocaleString():'강화할 장비를 선택하세요';
    button='⚒ 강화하기';
  }else if(forgeMode==='분해'){
    message='장착하지 않은 장비를 분해하고 제작 재료를 획득합니다. 분해는 취소할 수 없습니다.';
    details=it?'획득 광석 +'+(6+(it.tier+1)*5+(it.level||0)*3)+' · 결정 +'+Math.floor((it.tier+1)/2):'분해할 장비를 선택하세요';
    button='♻ 장비 분해';
  }else if(forgeMode==='승급'){
    message='+3 이상 강화한 장비를 한 단계 높은 등급으로 승급합니다. 승급 후 강화 단계는 초기화됩니다.';
    details=it?'결정 '+((it.tier+1)*12)+' · 골드 '+((it.tier+1)*2500).toLocaleString():'승급할 장비를 선택하세요';
    button='✦ 승급하기';
  }else{
    message='동일 등급의 미장착 장비 2개를 합성하여 한 단계 높은 무작위 장비를 만듭니다. SS는 합성할 수 없습니다.';
    details=forgePicked.length===2&&it?'결정 '+((it.tier+1)*8):'합성 재료 '+forgePicked.length+'/2개 선택';
    button='⚗ 합성하기';
  }
  return '<section class="forgeOperations"><p class="hint">'+message+'</p>'+
    '<div class="forgeOpsHead"><b>보유 장비 '+S.inventory.length+'개</b><span>'+forgePicked.length+'개 선택</span></div>'+
    '<div class="forgeList">'+(S.inventory.map(forgeItemRow).join('')||'<p class="hint">대장간에서 장비를 먼저 제작하세요.</p>')+'</div>'+
    '<div class="forgeOpsCost">⛏ '+details+'</div><button class="primaryBtn" onclick="forgeAction()">'+button+'</button></section>';
}
const renderForgeCraft=renderForge;
renderForge=function(){
  if(forgeMode==='제작'){
    // Reuse existing approved crafting scene and replace decorative tabs with working ones.
    const original=renderForgeCraft();
    return original.replace(/<div class="forgeTabs"[\s\S]*?<\/div>/,
      '<div class="forgeTabs">'+['제작','강화','분해','승급','합성'].map(mode=>'<button class="segbtn '+(forgeMode===mode?'active':'')+'" onclick="changeForgeMode(\''+mode+'\')">'+mode+'</button>').join('')+'</div>');
  }
  return renderHeader('대장간','⚒️')+
    '<div class="forgeTabs">'+['제작','강화','분해','승급','합성'].map(mode=>'<button class="segbtn '+(forgeMode===mode?'active':'')+'" onclick="changeForgeMode(\''+mode+'\')">'+mode+'</button>').join('')+'</div>'+
    '<div class="forgeBanner panel"><div class="smith"></div><div class="speech">좋은 장비는<br>더 멀리 가게 해주지!</div></div>'+
    forgeOperations();
};
let equipmentFilter='all';
renderEquipment=(function(previous){
  return function(){
    let html=previous();
    const marker='<div class="subnav"';
    const start=html.indexOf(marker);
    if(start<0)return html;
    html=html.slice(0,start);
    const categories=[['all','전체'],['weapon','무기'],['armor','갑옷'],['shield','방패'],['ring','반지']];
    html+='<div class="subnav">'+categories.map(([key,name])=>'<button class="segbtn '+(equipmentFilter===key?'active':'')+'" onclick="equipmentFilter=\''+key+'\';render()">'+name+'</button>').join('')+'</div>';
    const items=S.inventory.map((it,idx)=>({it,idx})).filter(row=>equipmentFilter==='all'||row.it.kind===equipmentFilter);
    html+='<div class="inventoryGrid">'+items.map(({it,idx})=>
      '<div class="invItem"><div class="mini" style="background-image:url('+iconFor(it)+')"><span class="rar '+rarityClass(it.tier)+'">'+rarityLetter[it.tier]+'</span></div><div class="txt">'+it.name+
      (it.level?' +'+it.level:'')+'<br><span class="'+rarityClass(it.tier)+'">'+it.effect+'</span></div><button onclick="equipItem('+idx+')">'+
      (isEquipped(idx)?'장착 중':'장착')+'</button></div>').join('')+'</div>';
    return html;
  };
})(renderEquipment);
render();
