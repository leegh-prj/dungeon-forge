# Day 23 — Gameplay UX and quality-of-life pass

## Changes
- Collapsible secondary panels: storage capacity/auto-salvage, capacity expansion, regional material vault, equipment presets, elemental set bonuses and legendary achievements. Primary play actions remain more visible.
- Dungeon top section now shows attendance only when claimable today and offline rewards only when there is a pending offline chest. Daily missions move into a compact expandable section that opens automatically if a reward can be claimed.
- Added "claim all available daily mission rewards" button with one operation, including the completion bonus once prerequisite missions are claimed. Duplicate grants prevented.
- Inventory search shows displayed-item count, updates during live search input.
- Corrected date string matching in previous-day calendar utility; consecutive attendance now recognizes the actual previous local date correctly.
- Removed duplicate hidden resource vault markup introduced by the first UI refactor.
- No new monetization features; no changes to purchase or ad availability.
- Existing localStorage key remains `dungeon-forge-ui-v2`.

## Tests
8/8 mock-DOM checks passed for all five screens, calendar decrement, claim-all payouts and idempotence, equipment/forge disclosure markup, inventory displayed count and attendance visibility.
Actual mobile browser visual QA and extended gameplay still pending.
