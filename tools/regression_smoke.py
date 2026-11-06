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
 "14. Elemental warehouse overflow":"S.inventory.length>=S.bagCapacity&&S.warehouse.length>=S.warehouseCapacity",
 "15. Mixed dismantle keeps fusion limits":"forgeMode!=='분해'&&(!first||candidate.kind!==first.kind||candidate.tier!==first.tier)",
 "6. QA does not autosave":"if(!gearQaMode)document.addEventListener('visibilitychange'",
 "6. Equipped loadout still available":"function renderEquipment()",
 "6. Save format unchanged":"const K='dungeon-forge-ui-v2';",
}
visual_css=(Path(__file__).resolve().parents[1]/"assets/ui/visual-system.css")
checks["7. Shared visual skin loaded"]='href="assets/ui/visual-system.css?v=12"'
checks["7. Visual style file is modular"]=visual_css.is_file() and "prefers-reduced-motion" in visual_css.read_text(encoding="utf-8")
checks["7. Five regional fallback references"]='assets/backgrounds/${regionInfo().key}-fallback.svg'
checks["8. Region monster sprite resolver"]="assets/sprites/regions/"
region_sprite_dir=Path(__file__).resolve().parents[1]/"assets/sprites/regions"
checks["8. Ten monster sprites present"]=all((region_sprite_dir/f"{region}-{role}.svg").is_file() for region in ("water","poison","storm","fire","earth") for role in ("normal","boss"))
checks["9. Dungeon recovery scope"]=".dungeonCombatPage>.battlefield" in visual_css.read_text(encoding="utf-8")
checks["9. Hidden tasks remain hidden"]="[hidden]{display:none!important}" in visual_css.read_text(encoding="utf-8")
checks["10. Combat text contrast overlay"]="Readability recovery v4" in visual_css.read_text(encoding="utf-8")
checks["11. Duplicate combat stage status removed"]='class="combatOverview" role="group"' not in s
checks["12. Bounded combat action grid"]="grid-template-columns:repeat(3,minmax(0,1fr))!important" in visual_css.read_text(encoding="utf-8")
checks["13. Shared workspace grid"]="shared responsive workspace geometry" in visual_css.read_text(encoding="utf-8")
for name,anchor in checks.items():
    ok=anchor if isinstance(anchor,bool) else anchor in s
    print(("PASS" if ok else "FAIL")+" "+name)
if not all(anchor if isinstance(anchor,bool) else anchor in s for anchor in checks.values()):raise SystemExit(1)
print("PASS all",len(checks),"static regression checks")
