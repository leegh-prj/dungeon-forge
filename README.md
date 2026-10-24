# DUNGEON FORGE ⚒️

**Forge Your Legend. Conquer the Dungeon.**

DUNGEON FORGE (던전 대장간) is a fantasy single-player forging and dungeon-combat game. Craft and enhance equipment, discover elemental advantages, defeat regional bosses, and collect gear across seven rarity tiers.

## Core Features

- ⚔️ Manual and automatic dungeon battles with boss attack patterns
- ⚒️ Equipment crafting, enhancement (+20), fusion, promotion and dismantling
- 🛡️ Four equipment categories: weapons, armor, shields and rings
- ✨ Seven rarity tiers: C, B, A, S, SS, SSS and L
- 🔥 Elemental combat matchups, status effects and region-specific set bonuses
- 📖 Adventure guide, equipment collection, regional and monster codex
- 🎒 Bag and warehouse management with filtered bulk transfers and expansion
- 🧑 Customizable character name and equipment loadout
- 📱 Responsive browser gameplay with local save data

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser Local Storage
- GitHub and Vercel deployment

## Play

**Production:** https://dungeon-forge-gilt.vercel.app/

Progress is stored locally in the browser. Clearing browser data or switching devices can result in a separate save. Keep game data intact while testing.

## Development Status

**Playable web build — ongoing development.** Gameplay systems are implemented and continually refined; graphic assets, mobile rendering and full device QA remain active areas of work.

### Current Asset Notes

- Combat animation frame images and codex portrait artwork serve different purposes.
- Dedicated normal/boss monster portraits are specified in [Monster Codex Asset Specification](docs/monster-codex-assets.md) but have **not** all been produced or deployed.
- An epic-monster codex category exists as a planned-content placeholder; epic combat encounters are not yet implemented.
- Some equipment art still uses fallbacks until HD assets pass validation.

## Roadmap

- Full-quality monster portraits for five regions (10 unique assets)
- Further character/gear artwork cleanup and mobile visual QA
- Epic enemy combat, special mechanics and rewards
- Equipment and forging interface polish
- More regions, stage variety, bosses and long-term progression
- Secure in-app purchase integration for optional storage expansion
- Rewarded advertising integration and appropriate consent flows
- Android / iOS release preparation

## Testing and QA

- `python tools/regression_smoke.py` — static game-code regression checks
- `python tools/verify_gear_assets.py` — HD gear validation when 168 gear assets are installed
- Do not treat successful CI / production deployment as proof of mobile-device image correctness.
- The optional operator-test currency grant is for local QA, **not** authenticated admin access.

## License

All rights reserved.
