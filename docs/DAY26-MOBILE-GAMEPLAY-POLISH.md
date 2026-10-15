# Day 26 — Small-screen gameplay polish, newcomer delight, stage-reward curve

Date: 2026-10-15
Production: https://dungeon-forge-gilt.vercel.app/
Branch: main

## Goals
Mobile game first: reduce the vertical distance to combat, maintain accessible battle controls, make the first 5 minutes fun and prevent the Stage 3→4 difficulty/reward cliff. Monetization remains on hold.

## Changes shipped
- Moved secondary battle status/attack/defense labels and enemy charge meter **below** the battlefield and basic combat skill row, preserving their existing DOM ids so live battle HUD updating remains compatible.
- Handset battle height now uses a dynamic viewport-aware CSS clamp, with a compact override for short phone screens (under 700px).
- Maintains sticky manual-combat skill actions over the bottom nav and minimum touch sizes for interactive actions.
- On changing game tabs, automatically resets window scroll position to the top; no jump on repeated battle re-renders within the same tab.
- For **first-time players only**, the first weapon crafted at onboarding step 2 is guaranteed B / 고급 tier. An explicit label explains the guarantee before crafting; later crafts use the original C-to-L probability table.
- Added optional "건너뛰기" tutorial control. Skipping gives no tutorial-completion rewards.
- Smoothed regular and boss enemy HP from Stage 4 through 12 so difficulty no longer abruptly jumps after Stage 3. Stage 13+ retains original HP formulas.
- Battle gold and ore drops now have a minimum 1.8x reward scale through early and middle stages, then scale up naturally as the pre-existing later-stage multiplier exceeds 1.8. This eliminates an earlier gold/ore reward dip across Stage 3→4 and preserves late-game growth. Boss and ordinary monsters both benefit.
- All progression remains on the same browser localStorage key; legacy saves keep gear, rarity, stage, currency and battle mode, without forced onboarding.
- No new ad or purchase features.

## Verification
11/11 mocked-DOM/JavaScript checks passed:
- five main tabs render
- arena appears before status and reward panels with no duplicated battleStatus ID
- one-time B first craft, equip/boss tutorial and ordinary subsequent crafting odds
- normal and boss HP monotonic across stages 1–20
- gold and ore rewards non-decreasing across stages 1–50
- existing L +20 save compatibility and optional skip without bonus

## QA constraints
- Automated JS/DOM smoke tests do not substitute for full browser or physical phone screenshots. No real iOS/Android device QA has been completed in this development session.
- Production build is deployed from GitHub via Vercel.
