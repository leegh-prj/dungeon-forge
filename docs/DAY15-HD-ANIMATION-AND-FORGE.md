# Day 15 — HD animation continuity & all-region forging

## Production changes
- Restores deterministic pose-start animation clocks. Idle frames loop; attack/guard/hurt/special pose frames advance from event start and hold their final pose instead of cycling by wall clock.
- Preserves original high-resolution WebP fallback and all uploaded `assets/hd` art.
- Stage progress now follows **3 normal kills → boss → stage advance**, independent of lifetime kill counter. Old saves migrate once via `stageKills`.
- After a boss kill, stage-kill progress is reset to zero.
- Players can select any of 5 regional material types in the forge regardless of current stage. Selected material type persists in `S.forgeRegionKey`.
- Fixes +20 reinforcement UI disable rule to match actual enhancement cap.
- Fixes empty saved inventory being repopulated with free starter gear; starter items are created only on a genuinely fresh save.
- Keeps zero health as zero during state normalization instead of silently resetting to maximum. All other save fields continue using existing localStorage key.

## Tests
JavaScript source parsed successfully. Mock DOM smoke tests checked starter inventory, saved empty inventory, stage-kill migration, boss progression, stored materials from another zone, crafting cost consumption, +20 cap, pose timing, and regional selector rendering. Seven representative uploaded HD frames/backgrounds/materials were fetched successfully from GitHub.

## Follow-up QA
Test mobile Safari/Chrome for pose transitions and small-screen five-region selector; test aggressive rapid taps, saved accounts with legacy boss flags, and scroll smoothness. This is not a claim of physical mobile-device QA.
