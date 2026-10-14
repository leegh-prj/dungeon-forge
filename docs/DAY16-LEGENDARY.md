# Day 16 — L Legendary equipment cinematic and endgame milestones

Date: 2026-10-14

## Implemented
- L rarity equipment gains ornate gold-background cards and animated star accents in the equipment bag and forge selection.
- A full-screen legendary cutscene overlays the game when L equipment is created by regular craft, multi-craft, elemental craft, synthesis or promotion. The modal uses glowing gold seal, light particles, reveal-scale animation and provides confirm/skip controls.
- The cinematic is **not** replayed by strengthening an already-owned L item.
- First L obtained triggers persistent one-time award: +100,000 gold and +50 crystals, tracked with `legendaryFirstClaimed` and achievements in existing localStorage save.
- Legendary equipment gains slot-specific passive when equipped: weapon +12% damage, armor -8% incoming damage, shield -10% incoming damage, ring +5% lifesteal on successful hits.
- Three endgame achievements visible on Equipment page: First Legendary (reward above), collect L in all four equipment slots (+100 crystals), obtain any L +20 (+150 crystals).
- No save-key migrations; prior SSS, L and +20 equipment preserved.
- Reduced motion is supported for cinematic animations.

## QA
Mock browser smoke tests passed (10/10): single / repeat / bulk L craft, one-time rewards and persistence, unique passives, milestone UI, modal close, collect all four L item classes, L+20 reward idempotency, non-repeating cutscene after enhancements.

## Known limitations
- Distinct L weapon/armor/shield/ring **illustration source art** is not yet drawn; enhanced CSS and glow frame reuse existing equipment WebP assets.
- Sound and real phone-browser animation timing have not been separately QA tested.
