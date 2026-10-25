#!/usr/bin/env python3
"""Export approved first-pass pixel SVG monster codex sprites to 512px transparent WebP."""
from pathlib import Path
import hashlib
import io
import re
from PIL import Image
import cairosvg

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets/codex/monsters"
KEYS = ("water", "poison", "storm", "fire", "earth")
EXPECTED = [f"{k}_{t}" for k in KEYS for t in ("normal", "boss")]
HASHES = set()
for name in EXPECTED:
    svg = ASSETS / f"{name}.svg"
    assert svg.is_file(), f"missing source {svg}"
    png = cairosvg.svg2png(url=str(svg), output_width=512, output_height=512)
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    assert im.size == (512, 512)
    assert im.getchannel("A").getextrema() == (0, 255), f"no transparent background: {name}"
    digest = hashlib.sha256(im.tobytes()).hexdigest()
    assert digest not in HASHES, f"duplicate portrait: {name}"
    HASHES.add(digest)
    dst = ASSETS / f"{name}.webp"
    im.save(dst, format="WEBP", lossless=True, method=6)
    with Image.open(dst) as check:
        check.load()
        assert check.size == (512, 512)
        assert check.mode == "RGBA", (dst, check.mode)
        assert check.getchannel("A").getextrema() == (0, 255)
    print(f"OK {dst.relative_to(ROOT)} ({dst.stat().st_size} bytes)")
assert len(HASHES) == 10
source = ROOT / "index.html"
html = source.read_text(encoding="utf-8")
before = "'+r.key+'_'+type+'.svg'"
after = "'+r.key+'_'+type+'.webp'"
assert before in html or after in html, "codex portrait path not found"
html = html.replace(before, after)
source.write_text(html, encoding="utf-8")
assert "assets/hd/'+enemyId+'/idle-0.webp" not in html, "combat animation reused as codex image"
print("PASS 10 unique transparent WebP assets; codex paths connected")
