const {test,expect}=require('@playwright/test');

for(const viewport of [{width:844,height:390},{width:390,height:844},{width:1024,height:600}]){
 test('forge result dialog remains reachable '+viewport.width+'x'+viewport.height,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto('/');
  await page.evaluate(()=>showForgeSummary('강화 실패',[],'성공 확률 · 다음 강화 시 다시 도전할 수 있습니다'));
  await expect(page.locator('#craftOverlay')).toHaveClass(/show/);
  const modal=page.locator('#craftModal');
  await expect(modal).toBeVisible();
  const measurements=await modal.evaluate(el=>{
   const r=el.getBoundingClientRect();
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,viewportWidth:innerWidth,viewportHeight:innerHeight,scrollable:el.scrollHeight>=el.clientHeight};
  });
  expect(measurements.left).toBeGreaterThanOrEqual(-3);
  expect(measurements.right).toBeLessThanOrEqual(measurements.viewportWidth+3);
  expect(measurements.top).toBeGreaterThanOrEqual(-3);
  expect(measurements.bottom).toBeLessThanOrEqual(measurements.viewportHeight+3);
  await modal.locator('button.tierResultConfirm').click();
  await expect(page.locator('#craftOverlay')).not.toHaveClass(/show/);
 });
}
