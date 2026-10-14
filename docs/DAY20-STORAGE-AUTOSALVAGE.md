# Day 20 — Equipment Capacity, Warehouse, Auto-Salvage & Regional Strategy

Date: 2026-10-14

## Changes
- Bag capacity defaults to 120 items; warehouse to 200. Existing over-capacity saves are preserved by raising limits to at least saved counts instead of deleting items.
- Move unequipped items to warehouse and back. Moving an item correctly rebases the equipped-item inventory indices after the removed position.
- When the bag is full, a crafted item is placed in the warehouse if it has room. If both are full, crafting is blocked before spending materials.
- Optional auto-salvage of **newly crafted**, unupgraded, non-infused items only. Off by default; thresholds C, B or A. S and higher always protected. Already-owned, locked and equipped items are never automatically dismantled.
- Automatic salvage credits the same ore/crystal values used in manual dismantling. Tracked with `salvagedCount`. A crafted low-rarity item that is auto-salvaged is not added to the bag.
- Elemental craft avoids auto salvage and requires one free bag slot, preserving its newly infused item.
- Dungeon stage matching-element resonance: 2 equipped pieces matching the current region give +6% outgoing damage; 4 pieces also give -4% incoming damage. This is in addition to existing 2-/4-piece set bonuses. The dungeon UI shows resonance and the equipment requirement.
- Existing localStorage save key `dungeon-forge-ui-v2` preserved.

## Validation
- App source parses.
- 5 main views render in a JS DOM stub.
- Bag/warehouse sections and controls render.
- Crafted auto-salvage pays resources and does not silently delete owned items.
- Equipped slot references are retained after moving a preceding inventory item into storage.
- S-tier auto-salvage is hard-blocked even at maximum allowed threshold A.
- Fire stage set resonance returns +6% attack damage for a matching 2-piece set.
- Real-browser performance and mobile touch UX still require testing.
