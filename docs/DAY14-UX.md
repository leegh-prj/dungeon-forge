# Day 14 — Forge and Codex UX Stabilization

## New UX
- Dismantling: rarity tabs `전체 / 일반 / 고급 / 희귀 / 영웅 / 전설` show only eligible inventory entries.
- Select all items of the current rarity (up to 50), clear selection, see estimated ore/crystal proceeds.
- Confirmation modal with explicit cancel/confirm before deletion; already equipped or locked equipment is always excluded from selection and blocked at commit.
- Item upgrade: visible success chance by level: 100, 95, 90, 85, 75, 65, 55, 45, 35, 25 percent for +0 to +9, respectively.
- Failing upgrade consumes listed resources, but preserves equipment and enhancement level. Each failure increases the next chance by 5 percentage points, capped at 20 percentage points, and resets on success. Existing enhanced equipment keeps its prior level and stats.
- Equipment codex: filter All / Collected / Missing; accessible 40 positions per equipment category, unique discovered combinations marked as collected, undiscovered entries marked with ?. Navigation pages display 12 positions at a time. Total goal 160 positions.
- No localStorage save key change.

## Logic test results
- Five forge modes render.
- Rarity filter renders; group selection of five protects locked equipment; confirmation removes only selected items.
- Enhancement success rates are bounded 0..100; deterministic failure leaves level and item intact, deducts materials, and increases subsequent chance from 45 to 50 percent.
- Collected and uncollected codex filters and multiple pages work.
- Note: DOM stubs and deterministic JS checks are not substitutes for QA on the user's Android screen.

## Future UX improvements
- Expanded sorting (tier, enhancement, battle power) and batch locking.
- Codex discovery information modal, achievement rewards.
- Explicit confirmation before combining/promotion; probability balance feedback from playtesters.
