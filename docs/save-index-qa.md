# Save/index integration test coverage
The Node VM test runs game source functions without touching browser localStorage.
Covered: equipped-item index protection, reverse-order material consumption, simulated upgrade and fusion product, warehouse round-trip, serialization/reload, malformed primary and backup recovery, quota-error behavior.

This is **not** a substitute for browser automation: real UI tap sequences, tab/background interruptions and browser storage quota/device tests remain manual or future Playwright work.
No save schema, user inventory or economy values are changed by this test-only PR.
