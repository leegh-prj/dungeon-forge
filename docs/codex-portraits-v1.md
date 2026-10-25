# Codex portrait export and test

Run `python -m pip install Pillow==11.3.0 CairoSVG==2.8.2` and `python scripts/build_codex_portraits.py` from repository root.

The script renders the 10 hand-authored, first-pass SVG pixel monster portraits as independent 512 × 512 RGBA WebP files. It verifies dimensions, transparent backgrounds, successful WebP decoding, and uniqueness, then switches the codex-only HTML image paths from SVG to WebP. The existing combat sprites remain unmodified.

On the `feat/codex-pixel-portraits` branch, GitHub Actions runs the export and regression test and commits generated assets if write permissions permit.

**Remaining manual review:** inspect visual quality, the monster/all/normal/boss/epic filters, portrait fallback and layout at 320, 360, 390, 430 px. Only merge/deploy after successful tests and graphics review; automated pixel integrity is not a substitute for device QA.
