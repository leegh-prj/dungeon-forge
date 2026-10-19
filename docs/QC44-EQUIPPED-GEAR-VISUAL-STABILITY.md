# QC44 — Equipped gear image stability

Date: 2026-10-19
Production: https://dungeon-forge-gilt.vercel.app/
Status: source-level fix committed, automated checks passed; physical device visual QA deferred.

## Findings
- Equipped slots and hero overlays already used the shared `graphicImage` handler, but rendered via `<img src="data:image/svg+xml,...">` or optionally external HD WebP files. These can show a broken-image glyph when a WebView fails to decode or resolve the image. Prior onerror fallback is not sufficient for every renderer failure.
- Character HUD also had a hardcoded `Lv.32 대장장이` even when a player's actual level differed.
- Inventory/equipment indexing is used in saved games; changing to ID references without a migration would risk saves.

## Fixes
1. Introduce `equippedGearArtwork(item,cssClass)`, converting existing 512px vector equipment artwork to inline SVG markup for equipped slots and hero overlays. This path requires neither external file fetch nor image src decoding. Keeps equipment kind, tier, elemental style, and alt/aria name.
2. Use the same inline vector path in all 4 equipped slots and 4 hero loadout overlay positions; empty slots retain distinct placeholders.
3. Add SVG-specific CSS sizing, alignment and isolation; avoid breaking existing mobile layouts.
4. Remove misleading fixed level-32 labels from combat and equipment stat panels. No gameplay leveling logic changed.
5. Retain the existing image fallback for hero and all other image-backed content. Preserve inventory index references and existing save schema.

## Tests
12/12 code/mocked-DOM regression checks passed:
- all 5 main screens
- all 4 equipped slots inline SVG and no image src
- all 4 hero overlays inline SVG
- all 28 kind/tier SVG variants compile
- unequip / re-equip placeholders and artwork
- warehouse item removal preserves other equipment references
- saved equip indices persisted
- hero sprite still has onerror fallback
- boss forge unchanged
- misleading hardcoded level removed
- inline SVG CSS present

## Limitations
No browser pixel screenshot, iOS/Android physical QA, original HD asset binary audit, or real-device WebView rendering check. Do not claim those were completed. The equipped slot fix avoids network-dependent images; remaining inventory/codex/modal images still rely on their shared fallback and may warrant further inspection if users report problems.
