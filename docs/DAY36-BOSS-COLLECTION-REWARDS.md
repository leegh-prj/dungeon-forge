# Day 36 — 보스 전용 장비 수집 도감과 단계별 보상

Date: 2026-10-16
Production: https://dungeon-forge-gilt.vercel.app/
Code: index.html
Previous: docs/DAY35-BOSS-TROPHIES-CRAFT.md

## Goals
- Turn five regional boss crafting items from one-off recipes into a long-term, finite collection goal.
- Maintain mobile-first minimal scrolling, existing saved items, crafting costs, and game economy.
- No in-person device QA at user's request. Behavioral mock DOM tests only.

## Implemented
1. New codex subtab **보스 장비**, joining equipment, monsters, and regions.
2. Progress **0/5 to 5/5**, icons with clear locked/unlocked states, boss and region information.
3. Collection history persists as `S.bossCollection` (array of unique region keys) and uses previous `S.discovered` recipe-names for retroactive support. Only successful exclusive gear craft yields a permanent record; collecting a trophy alone does not count. Selling/storing gear later does not clear history.
4. Three claimable, one-time milestone rewards:
   - 1 unique boss gear: 3,000 gold + 100 ore.
   - 3 unique boss gears: 10,000 gold + 200 ore + 12 crystals.
   - 5 unique boss gears: 25,000 gold + 400 ore + 35 crystals.
5. Persist `S.bossCollectionClaimed` to prevent repeated claims. Rewards explicitly require a claim button in codex; no automatic unannounced grant. Rewards for historical crafted gear are eligible if their previous discovery record exists.
6. New boss craft reward message shows collection count and reward-ready hint. Codex tab adds a ● indicator if any eligible reward remains unclaimed.
7. Responsive 4-column codex top navigation, compact milestone rows, limited internal scrolling for boss collection cards. Existing five main navigation tabs unchanged.

## Test results
21/21 mocked-DOM/JS checks passed in three phases (11 base, 5 multi-recipe persistence, 5 final UI and reward state):
- All main screens and codex tab.
- Initially locked boss collection and rewards.
- Crafting registers the recipe by unique regional key.
- 1/3/5 rewards unlock only after distinct bosses.
- Claiming each reward credits exact currencies once; duplicate claims do not pay again.
- Repeated crafting of one recipe does not inflate completion.
- Old saved discover records are retroactively recognized.
- Claimed flags and collection survive reload.
- Regular beginner kill→craft→equip remains functional.
- Reward-ready marker appears after a qualifying craft and disappears after claim.

## Limitations
Actual mobile QA/QC deferred, including screenshot visual review and low-end browser testing. The established asset-fallback layer remains, but original graphic assets haven't been exhaustively inspected by binary content.
