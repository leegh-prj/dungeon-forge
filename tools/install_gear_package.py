#!/usr/bin/env python3
"""Stage the approved 168-item equipment ZIP without modifying game logic.

Run from a clean checkout:
  python tools/install_gear_package.py path/to/dungeon_forge_hd_assets_deploy_ready.zip
  python tools/verify_gear_assets.py
  git add assets/gear
  git commit -m "Deploy reviewed HD gear assets"
  git push

Requires Pillow for full verification. This script never pushes or deploys.
"""
import argparse
import json
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KINDS = ("weapon", "armor", "shield", "ring")
GRADES = ("C", "B", "A", "S", "SS", "SSS", "L")
EFFECTS = ("fire", "leech", "barrier", "counter", "fortify", "ice")
EXPECTED = {f"assets/gear/{k}_{g}_{e}.webp" for k in KINDS for g in GRADES for e in EFFECTS}
EXPECTED.add("assets/gear/manifest.json")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("package", type=Path)
    parser.add_argument("--replace", action="store_true", help="replace previously staged artwork")
    args = parser.parse_args()
    if not args.package.is_file():
        parser.error("ZIP package not found")
    with zipfile.ZipFile(args.package) as archive:
        names = archive.namelist()
        if len(names) != len(EXPECTED) or set(names) != EXPECTED:
            print(f"FAIL: archive must contain exactly 168 WebP files and one manifest; got {len(names)} entries", file=sys.stderr)
            return 1
        if any(info.file_size > 15 * 1024 * 1024 for info in archive.infolist()):
            print("FAIL: unusually large image or manifest", file=sys.stderr)
            return 1
        manifest = json.loads(archive.read("assets/gear/manifest.json"))
        paths = [item.get("file") for item in manifest.get("items", [])]
        if len(paths) != 168 or set(paths) != EXPECTED - {"assets/gear/manifest.json"}:
            print("FAIL: manifest does not match all 168 images", file=sys.stderr)
            return 1
        target = ROOT / "assets" / "gear"
        if target.exists() and any(target.iterdir()) and not args.replace:
            print("FAIL: target already populated; use --replace after review", file=sys.stderr)
            return 1
        with tempfile.TemporaryDirectory() as temp:
            stage = Path(temp) / "gear"
            stage.mkdir()
            for name in names:
                dest = stage / Path(name).name
                dest.write_bytes(archive.read(name))
            try:
                from PIL import Image
            except ImportError:
                print("FAIL: Pillow needed (pip install pillow)", file=sys.stderr)
                return 1
            for name in sorted(EXPECTED - {"assets/gear/manifest.json"}):
                path = stage / Path(name).name
                with Image.open(path) as image:
                    image.load()
                    if image.format != "WEBP" or image.size != (320, 320):
                        print("FAIL: wrong format or dimensions: " + name, file=sys.stderr)
                        return 1
                    if image.getchannel("A").getextrema() == (255,255):
                        print("FAIL: missing transparency: " + name, file=sys.stderr)
                        return 1
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(stage, target)
    print("PASS: safely staged 168 WebP files and manifest; run tools/verify_gear_assets.py before commit")
    return 0

if __name__ == "__main__":
    sys.exit(main())
