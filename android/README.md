# Android APK QA build — Dungeon Forge

## Build policy
- Source: `develop/ui-stabilization`, **not** the Vercel production URL.
- Build: Android 9+ debug APK with embedded local web assets, sensor landscape orientation.
- Gate: `python3 tools/regression_smoke.py` plus all Playwright browser / P0 scenarios must pass. A failing QA job blocks the APK job.
- The game uses Android WebView localStorage. Data does **not** sync with the Vercel web game. Back up test progress before uninstalling.

## Download
Open [GitHub Actions](https://github.com/leegh-prj/dungeon-forge/actions/workflows/android-local-apk.yml), choose a successful **Android APK after full QA (development only)** run, then download its `dungeon-forge-landscape-qa-apk` artifact. Extract the ZIP to obtain `app-debug.apk`. Install on your own Android phone after allowing installs from the file manager/browser.

**Do not download** APKs from unknown links. Verify the run belongs to `leegh-prj/dungeon-forge` and branch `develop/ui-stabilization`.

## Current limitation
The GitHub runner must actually execute the workflow, and green browser QA is required. Until then, the APK is **not** a verified deliverable. Store release signing, real-device touch QA, and Play Store packaging are not included.
