#!/usr/bin/env python3
"""Fail fast when the offline Android game package is incomplete.
Does not modify game saves, assets, or production deployments.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8-sig")
manifest = (ROOT / "android/app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
java = (ROOT / "android/app/src/main/java/com/dungeonforge/mobile/MainActivity.java").read_text(encoding="utf-8")
gradle = (ROOT / "android/app/build.gradle").read_text(encoding="utf-8")
errors = []

def check(label, ok):
    print(("PASS" if ok else "FAIL") + " " + label)
    if not ok:
        errors.append(label)

check("APK entry point exists", (ROOT / "index.html").is_file())
check("Android package matches MainActivity", "package com.dungeonforge.mobile;" in java and "applicationId 'com.dungeonforge.mobile'" in gradle)
check("Offline WebViewAssetLoader origin configured", 'https://appassets.androidplatform.net/assets/index.html' in java and '.addPathHandler("/assets/"' in java)
check("Android launcher declared", 'android:name=".MainActivity"' in manifest and 'android.intent.action.MAIN' in manifest)
check("Android local storage enabled", "settings.setDomStorageEnabled(true)" in java)
check("Android manifest landscape orientation", 'android:screenOrientation="sensorLandscape"' in manifest)

for file in ("assets/js/inventory-core.js", "assets/js/save-core.js", "assets/ui/visual-system.css"):
    check("Required game asset " + file, (ROOT / file).is_file())

# Only check literal local <script src> and <link href> paths in the HTML.
# Runtime-computed equipment and stage art are handled by their own tests.
for tag in re.findall(r"<(?:script|link)\\b[^>]*>", html, re.I):
    m = re.search(r'\\b(?:src|href)="([^"]+)"', tag, re.I)
    if not m:
        continue
    uri = m.group(1).split("?", 1)[0]
    if not uri.startswith("assets/"):
        continue
    check("Local HTML dependency " + uri, (ROOT / uri).is_file())

if errors:
    print("ANDROID PREFLIGHT FAILED:", len(errors), "checks")
    sys.exit(1)
print("PASS Android local asset and launcher preflight")
