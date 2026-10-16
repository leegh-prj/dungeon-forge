# Dungeon Forge — Sequential Quality Improvement Roadmap

Date: 2026-10-16
Production: https://dungeon-forge-gilt.vercel.app/
Repository: leegh-prj/dungeon-forge
Save key: dungeon-forge-ui-v2

## Immutable working principles
- Mobile responsive first, minimal scrolling: battle and core action in one screen, secondary content in tabs, long lists only internally scrollable.
- Preserve saved games, equipped gear, rarity, enhancements, resources and free/premium boundaries.
- Each step: audit → implement → code/functional tests → deployment → device QA → next step.
- A successful mocked-DOM test is **not** a substitute for iOS/Android real-device validation.

## Phase 1 — Visual stability
### Day 31 / Steps 1A–1C [CODE SHIPPED]
1A. Inspect icon render paths and existing HD sprite onerror handler. Basic gear uses WebP files; S/SS/SSS/L mostly generated SVG data URIs; inventory/recipe previews previously used CSS background images with no image error callback.
1B. Generate stable tier-aware placeholder graphics for six types (weapon, armor, shield, ring, hero, monster); add image-error fallback to display generated placeholder when file fails. HD sprite attempts original HD frame → base sprite WebP → generated placeholder. A failure cache avoids repeated HD attempts for known missing frames.
1C. Normalize object-fit: contain in inventory icons, recipe cards, equipped slots, codex thumbnails, forged rewards and modal gear images. Convert background-image icon thumbnails to actual image elements with onerror handling; preserve overlays and rarity badges.
### Phase 1 remaining [NOT YET DONE]
1D. Asset manifest: verify every referenced file against actual repository binary paths using a suitable binary asset listing / CI build, check missing assets and broken dimensions, then replace or correct original files. GitHub connector's text file fetch cannot decode binary WebP files; binary existence/dimensions were not conclusively audited here.
1E. Physical device tests: portrait/landscape iOS Safari and Android Chrome, particularly low-end GPUs and background/foreground switching. Record screenshot, pixel width, broken element selector, expected vs actual and asset URL.
1F. Add an automated browser screenshot regression pipeline at multiple viewports when browser/build execution access is available.

## Phase 2 — Combat and crafting feel
2A. Boss pattern timing and explicit telegraphs.
2B. Make status effects distinct by equipment slot and enemy.
2C. Improve enhancement/rare-gear animations while maintaining reduced-motion support.
2D. Playtest novice 5-minute journey and boss progression; adjust based on completion times.

## Phase 3 — Long-term content
3A. Boss-specific resource drops and exclusive crafting recipes.
3B. Stage-region progression, sets and collection achievement rewards.
3C. Expand unique item artwork consistently with a single 256px gear icon spec and reliable fallbacks.

## Phase 4 — Data and balancing
4A. Local-only opt-in event logs and measurements before shipping analytics or transmitting player data.
4B. Review progression, enhancement/rarity distribution and drop resource economy.
4C. Make tuning parameters configurable and version-controlled, test for progression cliffs.

## Phase 5 — Monetization (after QA)
5A. Rewarded advertising verified via genuine SDK completion callbacks and daily reward limits.
5B. Convenience pass and storage expansion with transparent price/benefit UX.
5C. Real checkout verification, restore purchases, fraud prevention and platform policy review.

## Day 31 automation tests (10/10 passing)
- Five main screens parse/render.
- All 28 equipment kind/tier URLs generated.
- Equipped gear, forge recipe and monster codex use protected image elements.
- Tier placeholder image is valid SVG data URI.
- Failed image loads are replaced exactly once; older raw IMG inference works.
- HD frame failure falls back to base art, then generated graphic if needed.
- Early tutorial first kill→weapon craft→equip still works.

## Caveat
Image fallbacks prevent blank/visibly broken slots but do not demonstrate that underlying artwork exists, decodes on every platform, or looks good. User-reported broken images still need targeted asset audit and real-device repro to claim complete resolution.
