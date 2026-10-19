#!/usr/bin/env python3
"""Safe static regression smoke checks for the single-file game.
Does not modify saves or require network.
"""
from pathlib import Path
s=(Path(__file__).resolve().parents[1]/"index.html").read_text(encoding="utf-8")
checks={
 "1. Combat attack timing guard":"S.enemyHp>0&&now>=enemyAttackAt",
 "1. Combat has manual/auto modes":"S.battleMode!=='manual'",
 "2. Crafting remains available":"function craft(kind=S.craftTab",
 "2. Equipped comparison guarded":"function itemStrength(it){if(!it)return 0;",
 "3. Boss stage pattern wraps":"bossPatternStep%patterns.length",
 "3. Infinite stage scaling":"function getEnemyMax()",
 "4. Economy guards nonfinite balance":"!Number.isFinite(S.premiumTokens)",
 "5. Narrow mobile layouts":"@media (max-width:360px)",
 "5. Reduced motion support":"prefers-reduced-motion:reduce",
 "6. Save remains recoverable":"catch(error){\n  S.last=previousLast;",
 "6. QA does not autosave":"if(!gearQaMode)document.addEventListener('visibilitychange'",
 "6. Equipped loadout still available":"function renderEquipment()",
 "6. Save format unchanged":"const K='dungeon-forge-ui-v2';",
}
for name,anchor in checks.items():
    ok=anchor in s
    print(("PASS" if ok else "FAIL")+" "+name)
if not all(anchor in s for anchor in checks.values()):raise SystemExit(1)
print("PASS all",len(checks),"static regression checks")
