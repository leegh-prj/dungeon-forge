# Dungeon Forge — Monster Codex Portrait Asset Specification

## Purpose
Codex cards must use **complete single-subject portraits**, never sprite animation frame strips such as `assets/hd/{region}/idle-0.webp`. Animation frames can contain cropped portions and are unsuitable as collection art.

## Asset requirements
- Format: transparent-background WebP (RGBA), ideally source PNG with alpha
- Canvas: 512 × 512 px (square); subject wholly inside safe area (approximately 8–92% horizontal and vertical)
- No text, UI borders, or painted rectangular backgrounds baked into the image
- One full monster per file, feet/tail/crown fully visible, visually consistent stylized dark fantasy RPG art
- Unique silhouettes for normal and boss. No upscaled animation-cel crops
- Confirm alpha and decode integrity in browsers, including Android Chrome
- Use an explicit loading/fallback state if an asset is missing, rather than stretching a combat frame

## Region 1–5 portrait mapping
| Region | Region key | Normal portrait | Boss portrait | Normal monster | Boss monster |
|---|---|---|---|---|---|
| 1 물의 성당 | water | `assets/codex/monsters/water_normal.webp` | `assets/codex/monsters/water_boss.webp` | 왕관 슬라임 | 물의 왕 슬라임 |
| 2 독성 늪지 | poison | `assets/codex/monsters/poison_normal.webp` | `assets/codex/monsters/poison_boss.webp` | 포자 정령 | 독성 버섯 군주 |
| 3 폭풍 첨탑 | storm | `assets/codex/monsters/storm_normal.webp` | `assets/codex/monsters/storm_boss.webp` | 번개 정령 | 전격 석조 그리핀 |
| 4 용암 제련소 | fire | `assets/codex/monsters/fire_normal.webp` | `assets/codex/monsters/fire_boss.webp` | 마그마 젤 | 마그마 슬라임 |
| 5 고대 마도 유적 | earth | `assets/codex/monsters/earth_normal.webp` | `assets/codex/monsters/earth_boss.webp` | 석금 파수병 | 석금 마도 골렘 |

Names above are the intended codex entries; game `REGIONS` entries remain the source of truth if localized names evolve.

## Integration gates
1. Generate and individually inspect all 10 portraits.
2. Verify dimensions, alpha channel, decode success, unique subject composition and filenames.
3. Add portrait-path mapping separate from gameplay animation paths.
4. Preview mobile widths 320, 360, 390 and 430px.
5. Keep the existing combat sprites untouched, and fall back to a neutral codex placeholder when a portrait is absent.
6. Push only after successful asset checks and smoke tests. Epic portraits are deferred until epic encounters are actually implemented.

**Status:** Specification only. These 10 standalone portraits are not claimed to have been generated or deployed.
