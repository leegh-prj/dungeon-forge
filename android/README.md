# Android APK QA build — Dungeon Forge

## Build policy
- Source: `develop/ui-stabilization`, **not** the Vercel production URL.
- Build: Android 9+ debug APK with embedded local web assets served through AndroidX WebViewAssetLoader (secure HTTPS-like local origin), sensor landscape orientation.
- Gate: `python3 tools/regression_smoke.py` plus all Playwright browser / P0 scenarios must pass. A failing QA job blocks the APK job.
- The game uses Android WebView localStorage. Data does **not** sync with the Vercel web game. Back up test progress before uninstalling.

## Download
Open [GitHub Actions](https://github.com/leegh-prj/dungeon-forge/actions/workflows/android-local-apk.yml), choose a successful **Android APK after full QA (development only)** run, then download its `dungeon-forge-landscape-qa-apk` artifact. Extract the ZIP to obtain `app-debug.apk`. Install on your own Android phone after allowing installs from the file manager/browser.

**Do not download** APKs from unknown links. Verify the run belongs to `leegh-prj/dungeon-forge` and branch `develop/ui-stabilization`.

## Current limitation
The GitHub runner must actually execute the workflow, and green browser QA is required. Until then, the APK is **not** a verified deliverable. Store release signing, real-device touch QA, and Play Store packaging are not included.

## Local asset smoke validation
The Android WebView URL is `https://appassets.androidplatform.net/assets/index.html`, mapped to packaged `app/src/main/assets/index.html`; the page's relative `assets/...` paths resolve under the same package. This APK does not depend on the production Vercel domain.

## Build artifact integrity
The GitHub Actions APK job now verifies the application ID and checks that the APK ZIP contains the HTML entry point, save script and visual-system stylesheet before uploading. Each successful artifact includes `android-apk-sha256.txt` for checksum verification. The release gate still requires all static and Playwright QA jobs to pass. A committed workflow is **not** proof that a run succeeded.
