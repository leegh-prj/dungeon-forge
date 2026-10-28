/* Pure inventory index operation. Do not reorder objects or alter save format. */
(function(root){
 'use strict';
 function removeAt(state,index){
  if(!Number.isInteger(index)||index<0||index>=state.inventory.length)return null;
  if(Object.values(state.equip).includes(index))throw Error('Cannot remove equipped gear');
  const removed=state.inventory.splice(index,1)[0];
  for(const kind of ['weapon','armor','shield','ring']){
   const slot=state.equip[kind];
   if(Number.isInteger(slot)&&slot>index)state.equip[kind]=slot-1;
  }
  return removed;
 }
 root.GameInventoryCore=Object.freeze({removeAt});
})(typeof window!=='undefined'?window:globalThis);
