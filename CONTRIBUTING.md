# Contributing to CartMates

Thank you for helping keep shared grocery shopping simple and delightful.

## Start locally

Use Node 24, run `npm ci`, copy `.dev.vars.example` to the ignored `.dev.vars`, then follow the two-
terminal workflow in the README. Run `npm run lint`, `npm run typecheck`, `npm run test`,
`npm run test:workers`, `npm run build`, and `npm run test:e2e` before requesting review.

## Issues and feature requests

Search existing issues first. Bug reports should include expected/actual behavior, reproducible steps,
browser/viewport, and sanitized logs with no identity, token, secret, or shopping-list content.
Feature requests must explain the user problem. Out-of-scope ideas require specification review before
implementation.

## Branches and pull requests

Create a focused branch, make small readable commits, and open a pull request describing requirement
traceability, security/data/accessibility effects, test evidence, and documentation changes. Do not
mix unrelated refactors. Maintainers accept changes after required checks pass and the design remains
consistent with the constitution.

## Conventions

- Keep strict TypeScript and plain CSS; prefer readable code over abstractions.
- Browser code lives in `src/`; trusted APIs in `functions/`; coordination in `state-worker/`;
  browser-safe contracts and pure rules in `shared/`.
- Never trust browser identity or authorization data.
- Preserve serialized atomic retry-safe mutations and NDJSON compatibility.
- Use semantic native controls, visible focus, 44px touch targets, live feedback, and reduced motion.
- Add meaningful tests before implementation for changed core behavior.
- Update operator, architecture, privacy, and deployment documentation when affected.

There is no arbitrary coverage target and no contribution bureaucracy beyond what protects users,
data, maintainability, accessibility, and community health.
