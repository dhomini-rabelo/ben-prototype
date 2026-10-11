# Verdict tests-02 (browser, 390x844, Expo web :8081)
PASS. Setup as tests-01, plus backend :3333 mocked via Playwright route (agent-preferences/detail + captures/counts) so "Ben's model" loads; real server-ben not started (needs auth/DB/Firebase).
- v1.1.0 title wraps to 2 lines, top-aligned, chevron on first line, date right, no overlap (screenshots/01).
- Sheet scrolls (591 vs 720px) to whole versions section + Sign out (02, 03).
- Both expanded (03); 1.1.0 closed, 1.0.0 open (04); both closed (05); 1.1.0 reopened (06). Row 350x72.
- Cases 1-5 of tests-01 re-run: section position, default state, toggles all PASS. Console: 0 errors.
