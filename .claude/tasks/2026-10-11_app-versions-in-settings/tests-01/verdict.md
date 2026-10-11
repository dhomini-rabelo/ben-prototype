# Verdict tests-01 (browser, 390x844, Expo web :8081, no backend)

Setup: temp .env (fake values, deleted after), session injected in localStorage (`@ben/jwttoken`, `ben.jwttoken` (the key web storage really reads), `@ben/user`). Backend :3333 down, so "Ben's model" shows skeleton then "couldn't load your model settings"; console errors are only ERR_CONNECTION_REFUSED to :3333.

| # | Case | Result | Evidence |
|---|------|--------|----------|
| 1 | Section between Ben's model and Sign out; header "APP VERSIONS" + "v1.1.0" | PASS | screenshots/01-settings-open.png |
| 2 | Initial: 1.1.0 open (description visible), 1.0.0 closed; rows show number + title + date | PASS | screenshots/02-initial-state.png |
| 3 | Tap 1.0.0 -> both open | PASS | screenshots/03-both-open.png |
| 4 | Tap 1.1.0 -> collapses, 1.0.0 stays open | PASS | screenshots/04-latest-collapsed.png |
| 5 | Close + reopen Settings -> resets to default (only 1.1.0 open) | PASS (observed: state resets) | screenshots/05-reopened.png |
| 6 | Usability | PASS with notes | screenshots/06-scrolled-both-open.png |

Case 6 notes:
- Row buttons 350x48 (good touch target); both-open state fits in 844px with Sign out visible (model error state).
- Minor: v1.1.0 title "App versions in settin..." is ellipsized at 390px (no overlap; description full).
- Not verified: sheet scroll with the model section fully loaded (backend off, taller sheet). No scrollable overflow detected in the tested state.

## Result: PASS
