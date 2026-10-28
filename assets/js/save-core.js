/* Pure save validation utilities; no storage mutation and no schema migration. */
(function(root){
 'use strict';
 function validSnapshot(raw){
  if(!raw)return false;
  try{const parsed=JSON.parse(raw);return !!parsed&&typeof parsed==='object'&&!Array.isArray(parsed)}
  catch(_error){return false}
 }
 root.GameSaveCore=Object.freeze({validSnapshot});
})(typeof window!=='undefined'?window:globalThis);
