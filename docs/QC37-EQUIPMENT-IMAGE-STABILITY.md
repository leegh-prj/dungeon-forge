# QC 37 — 착용 장비 이미지·화면 안정성 자체 점검 및 수정

Date: 2026-10-17
Production: https://dungeon-forge-gilt.vercel.app/
Scope: User-reported broken images in equipped gear display, plus related image, layout, inventory regressions.

## Confirmed source-level issues
1. Equipment render code mixed gear image paths: C/B/A items referenced individual external WebP resources while S+ used generated SVG. Browser decode/display quality could vary across slots and views. No physical device reproduction, so this is a likely source of inconsistency rather than a proven sole cause.
2. The previous slot markup was repeated manually for four equipment kinds, increasing divergence and making empty/missing slots inconsistent.
3. CSS accumulated old `.slot img {object-fit:cover}` rules alongside later `contain` overrides; added explicit late scoped rules for all equipped art.
4. Eager-equipped images had a possible duplicate `loading` attribute from the shared helper (`lazy` plus `eager`), potentially delaying slot rendering.
5. In the replacement layout, a missing close for `.charwrap` could put the stats panel inside the character grid; corrected.
6. Some warehouse, tutorial, detail and reward contexts still used bare `img` without the shared fallbacks. Converted major exposed equipment contexts.
7. Bag live search was initially prefiltering item HTML based on the previous search string, so newly broadened searches might not show items; removed prefilter and allowed live DOM match against all category items.

## Implemented
- Unified equipment artwork generation for all 7 rarity grades C–L and 4 equipment categories using the existing resolution-independent SVG art. This removes reliance on beginner WebP gear assets for these icons.
- `equippedItem(kind)`: validates equipped inventory index and matching kind.
- `renderEquipSlot(kind)`: four consistent slots, rarity badge, meaningful empty-gear symbol, eager-loading image and graphic error fallback.
- `eq(kind)` delegates to the validated accessor, returning null on invalid/obsolete slot references.
- Targeted CSS for slot width/height containment, image scaling and small screens; preserve minimal-scroll shell.
- Unified loaded-gear image treatment across warehouse, equipment detail, craft reward, selected forge item and tutorial prompts. Corrected equipment HTML container closing.
- Removed duplicate `loading` markup for eager images.
- Adjusted bag live-search to search all currently selected-category items without losing matches after rerender.
- No changes to saved item schema, upgrade levels, boss collection/rewards or currencies.

## Automated checks: 15/15 passed
Five menu renderers; vector item URI matrix (4 kinds × 7 grades); slot count and closing tags; eager image attribute single occurrence; empty equipment; invalid index/wrong-kind defense; warehouse transfer & safe images; equipment detail and reward modal fallback; bag search; equip/sort persistence; beginner tutorial; old-save L/low-tier equipment rendering; forced image failure replacement; SVG payload decoding.

## Limitations
This is a source and mocked-DOM QC pass. Physical iOS/Android and pixel-perfect screenshots were not available in this session. Therefore **do not claim all hardware render issues are definitively resolved**; inspect on a real browser later. Original 3D/character sprites and background files have not been exhaustively inspected by binary asset tools.
