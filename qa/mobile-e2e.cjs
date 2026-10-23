const {chromium}=require('playwright');
const fs=require('fs');fs.mkdirSync('qa-artifacts',{recursive:true});
const BASE=process.env.QA_URL||'https://dungeon-forge-gilt.vercel.app/';
const results=[];const record=(name,ok,detail='')=>{results.push({name,status:ok?'PASS':'FAIL',detail});console.log((ok?'PASS ':'FAIL ')+name+' '+detail)};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [320,375,430]){
   const context=await browser.newContext({viewport:{width,height:740},deviceScaleFactor:1,isMobile:true,hasTouch:true});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(2000);
   await page.screenshot({path:'qa-artifacts/mobile-'+width+'-dungeon.png',fullPage:true});
   let check=await page.evaluate(()=>({viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+2,screen:!!document.querySelector('#screen'),nav:!!document.querySelector('#nav')}));
   record('mobile-'+width+'-dungeon',!check.overflow&&check.screen&&check.nav&&errors.length===0,JSON.stringify({...check,errors}));
   await page.locator('#nav button').filter({hasText:'대장간'}).click();
   await page.screenshot({path:'qa-artifacts/mobile-'+width+'-forge.png',fullPage:true});
   const tabOverflow=await page.evaluate(()=>{const p=document.querySelector('.forgeTabs');return p?{width:p.clientWidth,scrollWidth:p.scrollWidth,buttons:[...p.querySelectorAll('button')].map(b=>({label:b.textContent,width:Math.round(b.getBoundingClientRect().width)}))}:null});
   record('mobile-'+width+'-forge-tabs',!!tabOverflow&&tabOverflow.scrollWidth<=tabOverflow.width+2&&tabOverflow.buttons.every(b=>b.width>25),JSON.stringify(tabOverflow));
   await context.close();
  }
  const ctx=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
  const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(BASE,{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(1200);
  // Isolated QA state in this one ephemeral browser context. No actual player save is touched.
  await p.evaluate(()=>eval(`S.intro=null;S.gold=300000;S.ore=300000;S.crystals=1000;S.inventory=[];S.warehouse=[];S.equip={weapon:null,armor:null,shield:null,ring:null};for(let i=0;i<9;i++){let it=mkItem(recipeDefs[3],0,'반격');S.inventory.push(it)};save();render()`));
  await p.locator('#nav button').filter({hasText:'대장간'}).click();
  await p.locator('.forgeTabs button').filter({hasText:'강화'}).click();
  await p.locator('.forgeItem').first().click();
  await p.screenshot({path:'qa-artifacts/e2e-01-enhance-selected.png',fullPage:true});
  await p.evaluate(()=>eval('runForge()'));
  await p.waitForTimeout(450);
  await p.screenshot({path:'qa-artifacts/e2e-02-enhanced.png',fullPage:true});
  await p.evaluate(()=>eval('closeCraft()'));
  const upgraded=await p.evaluate(()=>eval('S.inventory[0].level>=1'));
  record('enhancement-ui',upgraded,'first ring upgrade');
  await p.locator('.forgeTabs button').filter({hasText:'합성'}).click();
  for(let i=1;i<=3;i++)await p.locator('.forgeItem').nth(i).click();
  await p.screenshot({path:'qa-artifacts/e2e-03-fusion-selected.png',fullPage:true});
  await p.evaluate(()=>eval('runForge()'));await p.waitForTimeout(400);
  await p.screenshot({path:'qa-artifacts/e2e-04-fused.png',fullPage:true});
  await p.evaluate(()=>eval('closeCraft()'));
  const fused=await p.evaluate(()=>eval('S.inventory.some(it=>it.tier===1)'));
  record('fusion-ui',fused,'tier 1 result stored');
  await p.locator('.forgeTabs button').filter({hasText:'분해'}).click();
  await p.locator('.forgeItem').first().click();
  await p.evaluate(()=>eval('runForge()'));
  await p.screenshot({path:'qa-artifacts/e2e-05-dismantle-confirm.png',fullPage:true});
  await p.locator('#craftModal button').filter({hasText:'분해 확정'}).click();
  await p.evaluate(()=>eval('closeCraft()'));
  const before=await p.evaluate(()=>eval('JSON.stringify({inventory:S.inventory.map(it=>it.id),gold:S.gold,ore:S.ore,crystals:S.crystals,discovered:S.discovered})'));
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(1500);
  const after=await p.evaluate(()=>eval('JSON.stringify({inventory:S.inventory.map(it=>it.id),gold:S.gold,ore:S.ore,crystals:S.crystals,discovered:S.discovered})'));
  record('forge-reload-persistence',before===after,JSON.stringify({before:before.slice(0,180),after:after.slice(0,180)}));
  record('no-js-errors',errors.length===0,errors.join('; '));
  await p.screenshot({path:'qa-artifacts/e2e-06-reloaded.png',fullPage:true});
  await ctx.close();
 }catch(e){record('execution',false,e.stack||e.message)}finally{await browser.close();fs.writeFileSync('qa-artifacts/results.json',JSON.stringify(results,null,2));}
 if(results.some(x=>x.status==='FAIL'))process.exitCode=1;
})();