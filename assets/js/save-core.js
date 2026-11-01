/* Pure save validation utilities; no storage mutation and no schema migration. */
(function(root){
 'use strict';
 function validSnapshot(raw){
  if(!raw)return false;
  try{const parsed=JSON.parse(raw);return !!parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&Number.isInteger(parsed.stage)&&parsed.stage>=1&&Number.isFinite(parsed.gold)&&parsed.gold>=0&&Array.isArray(parsed.inventory)&&!!parsed.equip&&typeof parsed.equip==='object'&&!Array.isArray(parsed.equip)}
  catch(_error){return false}
 }
 root.GameSaveCore=Object.freeze({validSnapshot});
})(typeof window!=='undefined'?window:globalThis);
