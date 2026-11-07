const {test,expect}=require('@playwright/test');

test('boss phase flips at half health and changes pattern order',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const prev={stage:S.stage,boss:S.boss,hp:S.enemyHp};
  S.stage=1;S.boss=true;bossPatternStep=0;
  S.enemyHp=getEnemyMax();
  const first={phase:bossPhase(),pattern:getBossPattern()[0],interval:bossAttackInterval()};
  S.enemyHp=Math.floor(getEnemyMax()*.49);
  const second={phase:bossPhase(),pattern:getBossPattern()[0],interval:bossAttackInterval()};
  S.stage=prev.stage;S.boss=prev.boss;S.enemyHp=prev.hp;
  return {first,second};
 });
 expect(result.first.phase).toBe(1);
 expect(result.second.phase).toBe(2);
 expect(result.second.pattern).not.toBe(result.first.pattern);
 expect(result.second.interval).toBeLessThan(result.first.interval);
 expect(result.second.interval).toBeGreaterThanOrEqual(3600);
});

test('weakness mastery breaks boss guard and delays next attack at most 650ms',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const prev={stage:S.stage,boss:S.boss,weapon:S.equip.weapon,enemyAttackAt,bossGuardUntil};
  const weapon=mkItem(recipeDefs.find(r=>r.kind==='weapon'),2,'독');
  S.inventory.push(weapon);S.equip.weapon=S.inventory.length-1;S.boss=true;S.stage=1;
  const now=Date.now();
  enemyAttackAt=now+1300;bossGuardUntil=now+3000;
  const before=enemyAttackAt;
  const strike=applyForgedStrikeSkill(200,now);
  const outcome={guardBroken:bossGuardUntil<=now,delay:enemyAttackAt-before,
    counter:strike.description.includes('약점 격파')};
  S.stage=prev.stage;S.boss=prev.boss;S.equip.weapon=prev.weapon;
  enemyAttackAt=prev.enemyAttackAt;bossGuardUntil=prev.bossGuardUntil;
  masteryImpact=null;return outcome;
 });
 expect(result.guardBroken).toBe(true);
 expect(result.delay).toBeGreaterThan(0);
 expect(result.delay).toBeLessThanOrEqual(650);
 expect(result.counter).toBe(true);
});

test('non-counter attack cannot strip a boss guard',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const previous={stage:S.stage,boss:S.boss,weapon:S.equip.weapon,bossGuardUntil,enemyAttackAt};
  const weapon=mkItem(recipeDefs.find(r=>r.kind==='weapon'),2,'화상');
  S.inventory.push(weapon);S.equip.weapon=S.inventory.length-1;S.boss=true;S.stage=1;
  const now=Date.now();bossGuardUntil=now+2900;enemyAttackAt=now+1200;
  const guard=bossGuardUntil,attack=enemyAttackAt;
  const skill=applyForgedStrikeSkill(180,now);
  const outcome={guardSame:bossGuardUntil===guard,attackSame:enemyAttackAt===attack,counter:skill.description.includes('약점 격파')};
  S.stage=previous.stage;S.boss=previous.boss;S.equip.weapon=previous.weapon;
  bossGuardUntil=previous.bossGuardUntil;enemyAttackAt=previous.enemyAttackAt;
  masteryImpact=null;return outcome;
 });
 expect(result).toEqual({guardSame:true,attackSame:true,counter:false});
});

test('boss guide shows phase and counter technique',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  const old={stage:S.stage,boss:S.boss,hp:S.enemyHp};
  S.stage=1;S.boss=true;S.enemyHp=Math.round(getEnemyMax()*.4);
  const guide=bossGuide();
  S.stage=old.stage;S.boss=old.boss;S.enemyHp=old.hp;
  return guide;
 });
 expect(result).toContain('2/2 페이즈');
 expect(result).toContain('보스 방어 태세');
 expect(result).toContain('격노');
});

test('enrage phase updates the live guide and announces with a safe reaction window',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  TAB='던전';dungeonPanel='fight';S.stage=1;S.boss=true;
  S.enemyHp=getEnemyMax();lastBossPhaseUIKey='';
  render();updateBattleHUD();
  const first=document.getElementById('bossStrategyGuide')?.textContent||'';
  const now=Date.now();
  enemyAttackAt=now+250;
  S.enemyHp=Math.floor(getEnemyMax()*.4);
  updateBattleHUD();
  return {
   firstPhase:first.includes('1/2 페이즈'),
   secondPhase:document.getElementById('bossStrategyGuide')?.textContent.includes('2/2 페이즈')||false,
   notice:document.getElementById('stageRewardNote')?.textContent.includes('2페이즈 시작')||false,
   reaction:enemyAttackAt-Date.now()
  };
 });
 expect(result.firstPhase).toBe(true);
 expect(result.secondPhase).toBe(true);
 expect(result.notice).toBe(true);
 expect(result.reaction).toBeGreaterThanOrEqual(1200);
});

test('post-boss crafting guide links to the existing special forge section',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.stage=2;S.boss=false;S.stageKills=0;
  S.bossTrophies=S.bossTrophies||{};
  S.bossTrophies.water=1;
  TAB='던전';dungeonPanel='fight';render();
  const card=document.querySelector('.bossCraftGoal');
  const before=card?.textContent||'';
  openBossForgeGoal();
  return {
   title:before.includes('수왕의 방패'),
   progress:before.includes('1/2'),
   tab:TAB,
   forgeSectionOpen:!!document.querySelector('.uxBossForge')?.open
  };
 });
 expect(result).toEqual({title:true,progress:true,tab:'대장간',forgeSectionOpen:true});
});

test('post-boss craft goal is hidden during the boss fight',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(()=>{
  S.stage=2;S.boss=true;S.stageKills=0;
  S.bossTrophies.water=1;
  return renderPostBossCraftGoal();
 });
 expect(result).toBe('');
});
