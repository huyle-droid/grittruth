# Test report — 8 October 2026

Tests ran against the completed local production build. No production deployment or external account was created.

## Results

| Check                                | Result                          | Evidence / scope                                                                                                                |
| ------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Production build                     | PASS                            | `npm run build`; all routes compiled and generated successfully                                                                 |
| Lint                                 | PASS                            | `npm run lint`; zero errors/warnings after corrections                                                                          |
| Type checking                        | PASS                            | `npm run typecheck`                                                                                                             |
| Unit/API/SQL tests                   | PASS                            | `npm test`; **32 tests across 5 files**                                                                                         |
| Browser tests                        | PASS                            | `npm run test:e2e`; **6 tests**, desktop and mobile Chromium                                                                    |
| Authentication logic                 | PASS, mocked provider           | Missing config and invalid identity fail closed; verified identity is used                                                      |
| Real email login and session refresh | NOT RUN                         | Requires Supabase project, configured Auth email delivery, and a real test inbox                                                |
| Database access control              | PASS, real embedded Postgres    | Both migrations run in PGlite; actual RLS/roles tested with two user identities                                                 |
| Live Supabase deployment             | NOT RUN                         | Owner project/credentials unavailable                                                                                           |
| API error handling                   | PASS, mocked upstream           | Missing key, invalid brief, missing brand, quota exhaustion/failure, provider errors/empty output                               |
| Live Claude request                  | NOT RUN                         | Anthropic credentials unavailable                                                                                               |
| Contact form                         | PASS, mocked upstream + browser | Validation, honeypot, rate limit, missing config, provider error, accepted delivery semantics                                   |
| Real email delivery                  | NOT RUN                         | Resend, Upstash and verified sending domain/mailbox not connected                                                               |
| Demo workflow                        | PASS                            | Brand edit/save/reload, campaign creation, sample generation, draft editing/save/reopen/filter, export, cascade deletion, reset |
| Responsive layout                    | PASS                            | 1440px desktop and 390px mobile; no horizontal overflow on tested pages and studio                                              |
| Accessibility                        | PASS, automated review          | Axe WCAG 2 A/AA and 2.1 AA tags on all public pages, login and populated studio at both sizes                                   |
| Visual review                        | PASS, sampled screenshots       | Desktop home/contact/studio and mobile homepage visually inspected; 18 full-page screenshots captured                           |
| Links                                | PASS                            | Internal links on all public pages/login fetched successfully; unknown URL returns 404                                          |
| SEO metadata                         | PASS                            | Titles, descriptions and canonical paths on seven public pages; private routes noindex/nofollow, sitemap and robots checked     |
| Security headers                     | PASS                            | nosniff and DENY verified on seven public pages; additional policy headers configured in source                                 |
| Client secret exposure scan          | PASS                            | No server credential variable names in production browser bundle; no real-key patterns found in app/public/docs/config template |
| Production dependency audit          | PASS                            | `npm audit --omit=dev`: **0 vulnerabilities**                                                                                   |
| Full dependency audit                | KNOWN LIMITATION                | **5 high entries**, all in the development-only lint chain; details below                                                       |

## SQL coverage

- Owner sees their own brand; another user sees no matching rows.
- Cross-user insert rejected.
- Cross-user update/delete affect no rows.
- Cross-owner campaign association rejected by composite foreign key.
- Anonymous table and quota access denied.
- The 31st generation attempt for a UTC day is denied; another user has an independent quota.
- Direct quota reset denied.
- Campaign deletion removes its own drafts.
- Database-level field constraints reject an oversized brand context.

These are real SQL authorization tests using embedded Postgres, with a minimal Supabase-compatible auth schema. They do not replace validation of the policies and Auth configuration in the owner's deployed Supabase project.

## Corrections made during QA

- Fixed a Next.js internal-link lint error and sign-out navigation warning.
- Updated the test framework to remove moderate/critical development dependency findings.
- Removed a decorative low-contrast letter from the homepage.
- Kept the editor available when draft text is cleared.
- Added database field limits to match request validation.
- Hosted fonts locally instead of fetching Google Fonts at runtime.
- Improved validation feedback and generated screenshots from the final build.

## Remaining dependency advisory

The five development-only audit entries trace through `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. The underlying advisory is [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), a denial of service from deeply nested patterns. The published braces version checked was 3.0.3 and no patched version was available. The registry's suggested fix was a major downgrade of the framework lint configuration, so it was not applied. No production dependency findings remained. Recheck and update the development dependency chain when a compatible fix is published.

## Reproduce

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run start
# In another terminal, with the local server running:
node tests/verify-public.mjs
npm audit --omit=dev
```

E2E expects empty external-service credentials and uses fictional demo data. Browser tests cover Chromium and mobile emulation, not a physical iPhone/Safari or a complete screen-reader audit. Automated accessibility results are not a compliance certification. Real provider behavior, network delivery, custom domain, HTTPS and production settings remain owner setup checks listed in DEPLOYMENT.md.
