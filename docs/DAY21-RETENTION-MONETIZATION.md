# Day 21 — Daily Engagement, Goal Crafting, and Monetization Foundation

## Gameplay implemented
- Daily missions counted from actual battles (10 normal mob kills, 2 boss kills; completion bonus after both claims), resetting at midnight in the device's local time.
- One-time-per-day claim rewards give gold, ore and earned Starlight tokens. Repeat claims do not grant additional currency.
- Automated target-rarity crafting (C through L) attempts at most 20 crafts per manual button press. Stops immediately upon target tier, lacking materials, or storage capacity. Loot probabilities are unchanged. Shows the item actually produced in this batch.
- Bag and warehouse have 10 expansion levels: +20 bag or +40 warehouse slots per purchase, payable with gold or earned Starlight.
- Starlight store provides ore/crystal/gold/region-material bundles. Transaction is implemented locally using earned in-game currency and persistent save.
- Legacy unlimited free-resource shop buttons have been replaced.
- Future ad-reward and real-payment options are visibly disabled with accurate messaging. There is no real money checkout, advertising SDK, payment confirmation, or purchase restore in the shipped build.

## Monetization direction
- Future opt-in rewarded ads: supplementary rewards with cooldowns; never present rewards before actual SDK completion callbacks.
- Future convenience IAP: equipment presets, expanded auto-crafting convenience, ad-free option and storage. Avoid directly selling top-rarity loot and keep earnable routes.
- Production IAP needs platform-specific store SDK, server-backed purchase verification, restore handling, user consent and store policy review. Current Starlight is not a paid currency and is earned through daily missions.

## Verification
9 mocked DOM/JS behavior checks passed: main menus, task rendering, no early/duplicate daily claims, gold and Starlight storage expansions, Starlight merchant purchases, disabled payment indicators and auto-craft batch cap.
Existing localStorage game save key remains unchanged.
