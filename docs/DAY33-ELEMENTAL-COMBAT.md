# Day 33 — Elemental combat effects (2026-10-16)

Production: https://dungeon-forge-gilt.vercel.app/

## Implemented
- Fire weapon: 3-second limited burn DOT, attack-scaled tick each second.
- Poison weapon: 4.5-second poison DOT, attack-scaled tick each second.
- Frost weapon: temporary enemy slow/attack delay on eligible hit, avoiding unlimited stacking each hit.
- Lightning weapon: immediate extra damage on every attack.
- Lifesteal weapon or ring: restores a small percentage of damage, capped at maximum HP.
- Battle HUD shows enemy conditions without expanding scroll-heavy UI.
- Clear all enemy status timers when an enemy dies or a fight resets. DOT victories award normal loot and skip stale battle events in the same tick.
- Retain tier and equipment progression; no saved-game schema changes.
- No device QA was available; behavioral tests only.

This feature was released as code commits 60764bf4 and 8d48ef4b before Day 34.
