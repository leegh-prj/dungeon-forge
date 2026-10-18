#!/usr/bin/env python3
"""Verify all 168 HD equipment files before production deploy.
Usage: python tools/verify_gear_assets.py
Requires Pillow: pip install pillow
"""
from pathlib import Path
from collections import Counter
import hashlib, json, sys

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "gear"
KINDS = ("weapon", "armor", "shield", "ring")
GRADES = ("C", "B", "A", "S", "SS", "SSS", "L")
EFFECTS = ("fire", "leech", "barrier", "counter", "fortify", "ice")
EXPECTED = {f"{kind}_{grade}_{effect}.webp" for kind in KINDS for grade in GRADES for effect in EFFECTS}
problems = []
manifest_path = ASSETS / "manifest.json"
if not manifest_path.exists():
    problems.append("Missing manifest.json")
    manifest = {}
else:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
actual = {p.name for p in ASSETS.glob("*.webp")} if ASSETS.exists() else set()
for name in sorted(EXPECTED - actual):
    problems.append("Missing asset: " + name)
for name in sorted(actual - EXPECTED):
    problems.append("Unexpected asset: " + name)
declared = {Path(row.get("file","")).name for row in manifest.get("items", [])}
if declared != EXPECTED:
    problems.append("Manifest is incomplete or has unknown paths")
if len(manifest.get("items", [])) != 168:
    problems.append("Manifest must contain exactly 168 entries")
hashes = {}
try:
    from PIL import Image
except ImportError:
    problems.append("Pillow is required for full image validation")
else:
    for name in sorted(EXPECTED & actual):
        path = ASSETS / name
        try:
            with Image.open(path) as im:
                im.load()
                if im.format != "WEBP" or im.size != (320, 320):
                    problems.append(f"Bad format/size: {name} {im.format} {im.size}")
                if im.mode not in ("RGBA", "LA") and "transparency" not in im.info:
                    problems.append("No transparency channel: " + name)
                rgba = im.convert("RGBA")
                ext = rgba.getchannel("A").getextrema()
                if ext == (0, 0) or ext == (255, 255):
                    problems.append("Empty or fully opaque: " + name)
            hashes[name] = hashlib.sha256(path.read_bytes()).hexdigest()
        except Exception as exc:
            problems.append(f"Corrupt image: {name}: {exc}")
    repeated = [group for group in Counter(hashes.values()).items() if group[1] > 1]
    if repeated:
        problems.append(f"Duplicate image contents: {len(repeated)} groups")
print(json.dumps({"expected":168,"files_found":len(actual),"verified":len(hashes),
                  "errors":len(problems),"details":problems[:30]}, ensure_ascii=False,indent=2))
sys.exit(1 if problems else 0)
