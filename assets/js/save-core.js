/* Save parsing and validation; pure helpers, no storage mutation or schema migration. */
(function(root){
 'use strict';
 function parseSnapshot(raw){
  if(typeof raw!=='string'||!raw)return null;
  try{
   const data=JSON.parse(raw);
   if(!data||typeof data!=='object'||Array.isArray(data))return null;
   // Keep older saves compatible: check only keys required by the game boot path.
   if(!Number.isInteger(data.stage)||data.stage<1)return null;
   if(!Array.isArray(data.inventory))return null;
   if(!data.equip||typeof data.equip!=='object'||Array.isArray(data.equip))return null;
   return data;
  }catch(_error){return null}
 }
 function validSnapshot(raw){return parseSnapshot(raw)!==null}
 function recoverSnapshot(primaryRaw,backupRaw){
  return parseSnapshot(primaryRaw)||parseSnapshot(backupRaw);
 }
 root.GameSaveCore=Object.freeze({parseSnapshot,validSnapshot,recoverSnapshot});
})(typeof window!=='undefined'?window:globalThis);
