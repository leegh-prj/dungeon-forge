#!/usr/bin/env python3
"""Non-mutating stability regression checks for central screen dispatch and image safety."""
from pathlib import Path
s=(Path(__file__).resolve().parents[1]/'index.html').read_text(encoding='utf-8')
checks={
 'Central render dispatch':"const SCREEN_RENDERERS={'던전':renderDungeon",
 'Render entry remains':"function render(){",
 'Screen still resets only when tab changes':"if(previousRenderedTab!==TAB)",
 'HTML attribute escaping':"function escapeImageAttr(value)",
 'Image error fallback':"function handleGraphicError(img,forcedKind)",
 'Inventory display remains':"function renderEquipment()",
 'Codex display remains':"function renderMonsterCodex()",
 'Saved data version unchanged':"const K='dungeon-forge-ui-v2';",
 'Keyboard focus indicators':"#nav button:focus-visible",
 'Narrow viewport wrap':"@media(max-width:430px){.codexCreature .info",
}
for name,marker in checks.items():
    assert marker in s,name
    print('PASS',name)
print('PASS',len(checks),'stability checks')
