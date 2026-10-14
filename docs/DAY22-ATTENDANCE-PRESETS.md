# Day 22 — Attendance, Offline Rewards, Equipment Presets, Artisan Journey

## Delivered
- Seven-day attendance calendar with streak bonuses in gold and earned Starlight. One claim per local calendar day; a missed day restarts the streak. Day 7 caps the reward.
- Offline exploration chest calculated once from the last persisted play timestamp on next load; minimum 1 minute, capped at 480 minutes, explicit claim, and no repeat claim. 13 gold and 0.65 ore per credited minute.
- Three loadout preset slots save stable item IDs, not fragile inventory array positions. Restoring a preset is atomic; any missing or warehouse-stored item blocks the restore, preventing partial or wrong equips.
- Monthly Artisan Journey tracks 100 XP per calendar month (normal mob +1, boss +5), with four universally available claimable free milestones at 10/30/60/100 XP. Season rolls over by month.
- Premium monthly-pass track is visible as future functionality but disabled pending checkout, verification, and restore integration; no misleading simulated real purchase.
- Existing localStorage save key and gameplay progress preserved.

## Test notes
9/9 JavaScript mocked-DOM checks passed: five views, attendance idempotence and streaks, preset ID save/load/missing item, offline cap and no duplicate claim, pass milestone claims, premium button disabled.
Real browser and mobile smoke tests and timezone/date tampering protections have not yet been completed.
