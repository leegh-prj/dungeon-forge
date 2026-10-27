#!/usr/bin/env python3
"""Static invariant guards: do not mutate player saves."""
from pathlib import Path
s=(Path(__file__).resolve().parents[1]/'index.html').read_text(encoding='utf-8')
checks={
 'legacy save key retained':"const K='dungeon-forge-ui-v2';",
 'backup still supported':"K+'-backup'",
 'valid prior snapshot backed up':"localStorage.setItem(K+'-backup',prior)",
 'malformed prior cannot replace recovery':"const parsed=JSON.parse(priorRaw)",
 'equipped gear deletion blocked':"if(Object.values(S.equip).includes(index))throw Error('Cannot remove equipped gear')",
 'single index remapping helper':"function removeInventoryAt(index)",
 'warehouse removal uses remapping':"S.warehouse.push(item);removeInventoryAt(index);",
 'forge removal uses remapping':"removeInventoryAt(idx);",
 'descending removal ordering':"unique.sort((a,b)=>b-a)",
 'legacy equip indices remain':"S.equip[kind]=Number.isInteger(old)&&indexMap.has(old)?indexMap.get(old):null",
}
for name,text in checks.items():
 assert text in s,name
 print('PASS',name)
print('PASS save/index static invariants')
