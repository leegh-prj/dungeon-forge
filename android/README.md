# Android APK QA build — Dungeon Forge

## Build policy
- Source: `develop/ui-stabilization`, **not** the Vercel production URL.
- Build: Android 9+ debug APK with embedded local web assets served through AndroidX WebViewAssetLoader (secure HTTPS-like local origin), sensor landscape orientation.
- The `qa` and `apk` jobs run in parallel. Browser QA results are independent from the APK artifact; an internal test APK may be built even if QA fails, but it is always labeled UNVERIFIED. Check the separate `qa` job before interpreting results. Never treat this build as release-approved.
- The game uses Android WebView localStorage. Data does **not** sync with the Vercel web game. Back up test progress before uninstalling.

## Download
Open [GitHub Actions](https://github.com/leegh-prj/dungeon-forge/actions/workflows/android-local-apk.yml), choose a successful **Android APK after full QA (development only)** run, then download its `dungeon-forge-landscape-UNVERIFIED-qa-apk` artifact. Extract the ZIP to obtain `app-debug.apk`. Install on your own Android phone after allowing installs from the file manager/browser.

**Do not download** APKs from unknown links. Verify the run belongs to `leegh-prj/dungeon-forge` and branch `develop/ui-stabilization`.

## Current limitation
The GitHub runner must actually execute the workflow, and green browser QA is required. Until then, the APK is **not** a verified deliverable. Store release signing, real-device touch QA, and Play Store packaging are not included.

## Local asset smoke validation
The Android WebView URL is `https://appassets.androidplatform.net/assets/index.html`, mapped to packaged `app/src/main/assets/index.html`; the page's relative `assets/...` paths resolve under the same package. This APK does not depend on the production Vercel domain.

## Build artifact integrity
The GitHub Actions APK job now verifies the application ID and checks that the APK ZIP contains the HTML entry point, save script and visual-system stylesheet before uploading. Each successful artifact includes `android-apk-sha256.txt` for checksum verification. Release approval still requires all static and Playwright QA jobs to pass; an internal test APK may be built despite failed browser checks. A committed workflow is **not** proof that a run succeeded.

## Diagnosing a red Actions run
Open the newest workflow run, select the `qa` or `apk` job, and expand its first red step. The workflow now prints SDK/Gradle diagnostics, summarizes QA and APK stages, and uploads `android-build-diagnostics` when available. The APK is only downloadable when the `Upload installable debug APK` step succeeds; do not confuse a QA failure artifact with the APK. This change does not itself certify any build.

## Parallel workflow diagnostics
The Android build no longer waits for Playwright. Inspect `apk` for build status and `qa` independently for browser failures. A failed build uploads `android-build-diagnostics` with `android-gradle-build.log` where available. `android-qa-status.txt` explicitly does not assert test success. The displayed red workflow status may reflect failed browser QA even if the internal APK artifact was created.

## Verified-build pipeline rules (2026-11-04)
- Both QA and APK jobs are pinned to Ubuntu 24.04 to avoid image migration drift.
- The Gradle task is executed using `bash` with `set -euo pipefail`, so `gradle ... | tee ...` cannot falsely report success when Gradle fails.
- ZIP listing, AAPT package metadata and SHA-256 checksum are saved in the build artifact. Missing HTML, script or CSS files fail the APK verification step.
- The latest workflow configuration is committed but has not itself been observed completing a successful run; test APK status remains **UNVERIFIED**.

## Next mobile QA build changes
- WebView now treats an empty `#screen` as a startup failure (not just a missing container) and logs missing local game assets to Android logcat under `DungeonForgeQA`.
- The Android job is pinned to Ubuntu 24.04. A successful APK upload adds a direct artifact link to the GitHub Actions job summary; the build is still marked UNVERIFIED until the separate browser QA job passes.
- **No signed APK bytes or successful execution logs have been retrieved in this development session.** Do not report an installable artifact until its job succeeds.

## Persistent CI evidence
Each workflow run now uploads **qa-test-evidence** (JUnit `qa-results.xml` plus Playwright screenshots/traces when available) and **android-build-diagnostics** (Gradle log plus APK manifests when available), including on successful jobs. This lets a failed APK be diagnosed independently of QA. The artifact `dungeon-forge-landscape-UNVERIFIED-qa-apk` appears only after the APK verification step succeeds. Build success is not assumed from the workflow file alone.

## Packaged-game startup and APK validation (2026-11-05)
- The Android WebView startup probe checks three conditions in a single numeric status: populated game `#screen`, `GameSaveCore`, and `GameInventoryCore`. Status `7` means all three loaded. Failures are shown on-screen and logged as `DungeonForgeQA` without deleting saved data.
- The APK verification now checks archive integrity (`unzip -tqq`), expected launchable MainActivity, min SDK 28 and target SDK 35 in addition to game asset packaging and checksum.
- This does not prove real-device gameplay success; builds and actual installs remain unverified until a green APK job and on-device run are observed.

## Offline Android preflight
The `apk` job now executes `python3 tools/android_preflight.py` before copying game assets or invoking Gradle. The check validates the launcher package, secure offline WebView URL, DOM storage, required script and stylesheet files, and literal HTML asset references. A red preflight step is an asset/configuration problem, not a Gradle compilation failure. APK availability still depends on a successful build run.
