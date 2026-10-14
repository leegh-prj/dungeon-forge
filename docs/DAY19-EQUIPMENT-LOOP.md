# Day 19 — Set bonuses, option reroll, inventory search/sort

## Released
- Five elemental sets recognized from equipped gear's `infusion` field. Two and four equipped pieces of the same element enable different combat bonuses.
- Water: 2 pieces +180 HP; 4 pieces an additional +400 HP.
- Fire: 2 pieces +24 attack; 4 pieces +8% damage.
- Storm: 2 pieces +18 attack; 4 pieces +6% damage.
- Poison: 2 pieces +4% damage; 4 pieces +48 attack.
- Earth: 2 pieces +32 defense; 4 pieces -8% incoming damage.
- Active set effects display on Equipment page without changing saved item ownership.
- Gear Details now supports reroll confirmation, tier-scaled ore/gold/crystal cost preview, and new effect roll which differs from the previous effect.
- Reroll retains equipment identity, rarity, infusion, enhancement and lock state. It updates the discovered equipment codex and saves using the existing localStorage key.
- Equipment menu now offers text search (name, effect, slot, rarity or set) and sort by highest rarity, total stats, enhancement, most recent and oldest, retaining original inventory indices for equip/lock/detail actions.
- No new binaries or asset deployments required.

## QA
9 mocked DOM/JavaScript checks passed: all primary screens render, two/four set bonuses affect real stats, reroll preview and mutation preserve identity/tier/level, sorting, UI controls and set panel.

## Known limitations
- Search currently filters visible cards and remembers text; after switching filters/sort, search continues to apply on the underlying inventory.
- No full browser automated click harness has been run; mobile UX and performance on 1000+ item inventories require further QA.
