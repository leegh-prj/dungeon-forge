# Day 25 — Mobile-first combat layout, five-minute onboarding and early-game balance

Date: 2026-10-15
Production: https://dungeon-forge-gilt.vercel.app/
Save key: `dungeon-forge-ui-v2` (unchanged)

## Scope / rationale
The game was overflowing vertically on smartphones. First-time users saw reward and progress panels above the arena, delaying the first interaction. This release prioritizes the battlefield and hand-operated actions before all optional UI and creates a guided fight → forge → equip → boss loop. Monetization work remains on hold.

## Mobile UI layout
- Compact logo, headers, counters, margins and stage HUD; arena minimum height scaled to 235px on handsets and 210px on narrower displays.
- Dungeon order: title → onboarding if new → boss hint when relevant → stage HUD/health/combat → arena → skill actions → optional combat mode/region details → craft quest/rewards.
- Daily missions, attendance, region strategy and crafting resource progress moved **beneath the arena**. Optional groups remain collapsible; pending offline rewards appear below battle.
- Manual-combat buttons use sticky placement immediately above fixed bottom navigation on sub-500px screens.
- Forge begins with the actual crafting/upgrade tabs, not large banner/secondary storage/settings. Secondary materials and storage tools are collapsible below main actions.
- Equipment screen has compact header, first crafted-gear instant equip CTA in guided tutorial, and storage settings below the main equipment controls.
- Correct stage label `STAGE N`, not the legacy `3-N` display.
- Existing mobile viewport-fit and reduced-motion preference retained.

## First five minutes, new users only
- A new save begins at stage 1, manually controlled combat, 2,000 gold, 180 ore, 12 crystals and six basic C-rarity starter items.
- Four-step persisted quest:
  1. Defeat one normal monster.
  2. Craft a weapon.
  3. Manually equip the just-crafted weapon; a quick equip CTA is shown at the top of the equipment screen.
  4. Defeat the first boss.
- Guide links to the relevant game tab, tracks progress safely and disappears after completion.
- Completion bonus: 4,000 gold, 90 ore and 5 crystals, awarded only once.
- Fresh onboarding data is created only on a genuinely new save; old saves with no `intro` key have it set to null and are never forced through onboarding.
- Newbie craft auto-equip suppressed during onboarding so the first manual equip remains meaningful. Existing saves retain auto-equip behavior.

## Beginner balancing
- Stages 1–3 normal monster HP: 150 + stage × 50.
- Stages 1–3 boss HP: 400 + stage × 80.
- Stages 1–3 earned gold/ore from battle ×1.8 compared with the previous stage rewards; novice boss grants 6 crystals instead of 4.
- Stages 4+ old enemy HP and reward formula preserved.
- Existing accounts retain their stage, items, gold, difficulty and stored progression because defaults only apply on creation of a fresh save.

## Verification
15/15 mocked-DOM/JS regression checks passed:
- Script parses, all five menus render.
- New-save stats and onboarding shown.
- Arena precedes reward/quest panels, mobile sticky combat controls are included.
- First kill → craft → manual equipment action → boss victory → guide completion and reward.
- Tutorial completion saved persistently.
- Older saves with L +20 equipment preserve gear, currency, progress and combat mode, and do not see onboarding.
- Core forge screen remains available.

## Limitations
- Automated tests check logic and generated markup. Physical iOS/Android screens, browser audio behavior and performance are not device-tested. A mobile screenshot and touch QA are advised before store release.
- The game still saves locally in a given browser; cross-device account sync is not provided.
- Real-money purchase and ad SDK integrations remain disabled.
