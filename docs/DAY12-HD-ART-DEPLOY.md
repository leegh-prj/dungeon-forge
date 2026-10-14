# Day 12 — high resolution sprite integration and five elemental stages

## Deployment
Production code was committed to `main` and Vercel auto-deployed. New binary assets are **prepared separately**; they cannot appear on Vercel until uploaded to GitHub.

Use `dungeon-forge-day12-hd-assets.zip` and the Windows script `scripts/publish-day12.ps1`:

```powershell
git pull --ff-only origin main
powershell -ExecutionPolicy Bypass -File .\scripts\publish-day12.ps1
```

The ZIP must be saved as `%USERPROFILE%\Downloads\dungeon-forge-day12-hd-assets.zip`. The script verifies hero, slime, magma, and four background paths before committing and pushing.

## Changes
- Original HD WebP art restored as fallback. New animation frames in `assets/hd/{hero,slime,water,poison,storm,magma,earth}` replace previous stylized SVG poses when installed.
- 54 cropped WebP pose files: hero 8, slime 6, each of five elemental bosses 8.
- Four generated region backgrounds (water, fire, storm, poison) and a distinct color-graded earth placeholder.
- Five repeating stage ecosystems keyed by stage number.
- Distinct three-pattern boss tables (heal, poison, multi-hit, heavy attack and guard).
- Craft material types for each region; monster/elite loop gives materials and bosses give more; 4 regional materials + ore and crystal permit infused equipment crafting.
- Combat stats consume the infused item bonuses; existing save key remains unchanged.
- JS smoke tests passed for stage selection, reward storage, elemental forging and manual combat.

## Limitations and QA
- New WebP is not uploaded merely by the code deployment. Vercel may report READY while serving only fallback art.
- Sprite crops derive from AI-generated sheets and must be reviewed for cut margins and visual continuity. Some boss frames have uneven cell layouts; a subsequent art-polish pass is planned.
- Existing localStorage resource amounts are preserved and may be far above the intended economy in older test accounts.
- Current legacy save starts on stage 12. New users and saved progress should be checked on actual mobile devices.
