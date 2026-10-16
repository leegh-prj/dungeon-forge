# Day 32 — 전투·제작 고도화 1단계: 보스 타이밍 방어

Date: 2026-10-16
Production: https://dungeon-forge-gilt.vercel.app/
Previous: docs/QUALITY-ROADMAP-DAY31.md

## QA/QC policy
User cannot perform real-device QA now. Device/screenshots and manual browser QA deferred; development proceeds with automated mocked-DOM and deterministic time tests. Do not claim physical device validation.

## Completed: Boss defense skill depth
- Improve boss attack warning at **1,000ms before scheduled strike**. HUD says '지금 방어', animated urgent highlight, reduced-motion no-animation outline.
- Manual guard during the 1-second telegraph and covering the strike is a **perfect guard**.
- Perfect guard: damage multiplied by 0.12 before other defense modifiers instead of 0.25 for a regular guard, and awards **3 ore once per guard activation**.
- Ordinary boss guard keeps 0.25 damage coefficient but no extra ore payout. Automatic guard still reduces damage but **cannot earn** the perfect timing ore bonus, avoiding automation farming.
- Guarded thunder roar blocks stun. Explicit '감전 차단' feedback remains visible after damage resolution; previously feedback could be overwritten.
- Existing poisoning shield block remains.
- No save schema changes, no new ad/payment features, preserve existing new-player onboarding and low-scroll responsive layout.

## Automated check results
9/9 mocked-DOM + controlled fake Date tests passed:
1. all five main screens render;
2. perfect guard pays once even with two hits;
3. too-early guard does not pay bonus;
4. automatic guard cannot receive manual bonus;
5. guarded thunder roar blocks stun with readable feedback;
6. unguarded thunder roar still stuns;
7. attack warning at <1 second;
8. newcomer kill→craft→equip;
9. legacy stage, L +20 gear and currencies preserved.

## Next development increments
- Day 33: Make weapon elemental combat effects tactically distinct, with readable effect feedback, balanced duration/cooldown and protection against status stacking abuse.
- Day 34: Boss pattern/UI responsiveness and reward pacing (automated logic testing).
- After suitable device QA access: original image asset audit and visual regression, which remain unverified and should not be represented as complete.
- Later: long-term content, telemetry with explicit privacy review, and monetization only after gameplay stability.

## Known limitation
Mobile viewport/layout, graphics fidelity and input timing on actual physical devices have not been verified; the logic tests are not a substitute for a live playtest.
