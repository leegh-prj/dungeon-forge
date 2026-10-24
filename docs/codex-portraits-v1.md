# Codex portrait implementation — first visual pass

Ten unique 512×512 transparent pixel-style SVG illustrations are added for five regions and wired only into the monster codex. No combat sprites have been altered. Missing portrait files fall back to a neutral graphic.

**Important:** this is a first-pass SVG artwork implementation, not yet the requested final transparent WebP export. After art approval, convert each to 512×512 WebP, update codex paths, validate decoding/alpha and mobile widths (320/360/390/430), and verify Vercel production. Keep `docs/monster-codex-assets.md` as the final target specification.
