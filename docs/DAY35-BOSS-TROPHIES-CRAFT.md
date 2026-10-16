# Day 35 — Boss Trophies & Exclusive Crafting

Date: 2026-10-16
Production: https://dungeon-forge-gilt.vercel.app/
Code: index.html
Previous: docs/DAY34-BOSS-CADENCE-REWARDS.md

## Objective
Give each regional boss a unique long-term loot and crafting objective while preserving the game's responsive low-scroll structure.

## Implemented
- Added persistent `S.bossTrophies` inventory with backwards-compatible normalization. Existing players begin with zero boss trophies; existing gold, levels, equipment, stash and collected resources remain unchanged.
- On each boss defeat, award one region-specific boss core. Ordinary monster kills do not award this item.
- Added five exclusive recipes:
  - Water / 물의 왕 슬라임: 수왕의 핵 → 수왕의 방패 (shield, 보호막)
  - Poison / 독성 버섯 군주: 군주의 포자핵 → 포자 군주의 반지 (ring, 흡혈)
  - Storm / 전격 석조 그리핀: 그리핀의 뇌핵 → 뇌전 그리핀 창 (weapon, 번개)
  - Fire / 마그마 슬라임: 용암의 심장 → 용암 군주의 검 (weapon, 화상)
  - Earth / 석금 마도 골렘: 골렘의 마력핵 → 고대 골렘 갑주 (armor, 견고함)
- Each recipe consumes **2 regional boss cores, 6 matching regular region materials, 75 ore and 3 crystals**.
- A-grade guaranteed with **15% S-grade chance** (85% A); does not depend on premium currency.
- Crafted boss item inherits corresponding region infusion and has a fixed boss-themed effect plus bonus attack or defense.
- No partial payments: validate all materials and storage capacity first, place the item before deducting costs.
- If bag is full but warehouse has room, the crafted item goes to the warehouse; if both are full, the craft cannot begin.
- Created a compact collapsible `👑 보스 전리품 특별 제작` forge panel showing five recipes and availability; a separate dungeon reward tab contains a collapsible boss-trophy objective.
- Boss kill reward note shows the collected core with its correct defeated region.

## Validation
17/17 mocked JS/DOM regression checks passed:
- all five views
- 5 boss recipes present
- default and old-save boss trophy normalization
- boss vs ordinary kill reward attribution
- availability/insufficient-resource no-spend path
- 5 recipe buttons and collapsible panels
- A-grade successful craft and exact cost deductions
- item stored in bag or warehouse appropriately
- S-grade chance branch
- full inventory/warehouse prevents deduction
- recipe configuration completeness

## Device QA deferred
User has deferred physical device QA/QC. These are logic/DOM checks, not a promise of pixel-perfect image rendering on devices. Image asset existence/dimensions and animations require subsequent real-world validation.
