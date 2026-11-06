<!--
Sync Impact Report
- Version change: 1.0.0 -> 2.0.0
- Modified principles:
  - I. Simplicity First -> I. Simplicity First (expanded)
  - II. Security by Default -> II. Security by Default (expanded)
  - III. Data Correctness -> III. Data Correctness and Concurrency
  - IV. Mobile-First UX -> IV. Mobile-First, Engaging UI/UX
  - V. Open-Source Quality -> V. Open-Source Quality and Community
  - VI. Cloudflare-Native -> VI. Cloudflare-Native Architecture
  - VII. Production Readiness -> VII. Testing and Reliability
- Added principles:
  - VIII. Performance and Responsiveness
  - IX. Privacy and Minimal Data Collection
  - X. Maintainability and Future Evolution
- Added sections:
  - Technical and Product Constraints
- Removed sections:
  - Technical and Operational Constraints (superseded by the product-focused constraints section)
- Follow-up TODOs: None
-->
# CartMates Constitution

CartMates enables families, flatmates, and officemates to manage a shared grocery shopping list
with minimal effort. It MUST feel like a delightful consumer product while remaining exceptionally
simple to build, operate, contribute to, customize, and self-host.

## Core Principles

### I. Simplicity First

- The application MUST remain small, understandable, maintainable, and easy for developers to
  extend.
- Designs MUST follow KISS and YAGNI. Only features explicitly approved in the specification MAY be
  implemented.
- Implementations MUST prefer boring, proven technologies and straightforward, readable code over
  complex frameworks, clever techniques, or speculative abstractions.
- Dependencies, infrastructure components, configuration, and operational steps MUST be kept to the
  minimum required by current requirements.
- Performance work MUST respond to an observed need or an explicit requirement; premature
  optimization is prohibited.
- When multiple solutions meet the requirements, the solution that is easiest to understand,
  operate, and debug MUST be selected.

Rationale: simplicity keeps CartMates approachable to occasional contributors and makes failures
and operational behavior easier to understand.

### II. Security by Default

- Access to all shopping-list data MUST require authentication through Google OAuth 2.0 and OpenID
  Connect.
- Authorization MUST use a statically configured allowlist of approved email addresses.
- Every backend API that reads or changes protected data MUST independently enforce authentication
  and authorization. Frontend checks MUST NOT be treated as security controls.
- Permissions for application code, Cloudflare resources, deployment automation, and contributors
  MUST follow least privilege.
- Credentials, tokens, allowlists containing sensitive data, and secrets MUST NOT be exposed in
  frontend code, committed to the repository, or written to logs.
- Sessions MUST use secure lifecycle management and cookies with `Secure`, `HttpOnly`, `SameSite`,
  path, and expiration settings appropriate to the deployment.
- Every untrusted input MUST be validated on the server. The application MUST defend against common
  web vulnerabilities, including XSS, CSRF, injection, session fixation, and authentication bypass.
- The application MUST NOT collect or retain personal information that is unnecessary for access or
  operation.

Rationale: household shopping data is private, and every request must remain secure even when a
client is modified or an API is called directly.

### III. Data Correctness and Concurrency

- The backend MUST be the authoritative source of truth for the shared shopping list. Client-side
  state MUST NOT determine data correctness.
- Mutations to a shared list MUST be serialized so simultaneous additions, removals, item updates,
  and list-wide operations have a defined and predictable order.
- Every mutation MUST be atomic and durably persisted before success is reported. Acknowledged
  updates MUST NOT be lost under concurrent use.
- Repeated requests and infrastructure retries MUST be safe through idempotency keys, preconditions,
  transaction identifiers, or an equivalently simple mechanism.
- Critical state MUST survive application restarts and deployments and MUST NOT depend on
  in-memory-only storage.
- Persistence MUST use the simplest representation that meets these guarantees. A newline-delimited
  text representation is preferred for the initial implementation.
- A relational database, ORM, or complex data model MUST NOT be introduced unless an approved
  requirement demonstrates why the simpler representation is insufficient.

Rationale: several people may update the same list at once, so user trust depends on durable,
predictable results without unnecessary data infrastructure.

### IV. Mobile-First, Engaging UI/UX

- The primary experience MUST be designed for smartphones, touchscreens, and use while shopping.
  Responsive layouts MUST also support tablets and desktops.
- The interface MUST be clean, modern, visually engaging, and enjoyable. It MUST feel like a
  consumer product rather than a generic CRUD interface.
- Adding an item, marking an item or the list as bought, and viewing the active list MUST be
  immediately discoverable and require minimal typing, navigation, and taps. Common actions SHOULD
  require a single tap when that does not increase error risk.
- Touch targets, typography, spacing, and visual hierarchy MUST remain usable on small screens.
- Every user action MUST receive timely visual feedback. Loading, empty, success, and error states
  MUST be clear, friendly, and actionable.
- Destructive actions MUST be visually distinct and MUST include safeguards proportionate to the
  risk of accidental data loss.
- Animation, transitions, and micro-interactions MAY be used only when they clarify state or improve
  delight without adding clutter. Reduced-motion preferences MUST be respected.
- User-facing functionality MUST meet WCAG 2.2 AA expectations, including keyboard navigation,
  visible focus, semantic structure, sufficient contrast, accessible names, and screen-reader
  compatibility.
- The interface MUST remain lightweight and responsive on typical mobile devices and slower mobile
  networks. Usability and clarity take precedence over feature count and decoration.

Rationale: CartMates is primarily used in a distracting, one-handed environment where immediacy,
clarity, accessibility, and a pleasant experience directly determine whether it is useful.

### V. Open-Source Quality and Community

- CartMates MUST be released under the MIT License.
- `README.md` MUST be clear, welcoming, and comprehensive and MUST document the purpose, supported
  features, architecture, screenshots, local setup, configuration, and deployment process.
- `CONTRIBUTING.md` MUST explain local development, bug reports, feature requests, issue discovery,
  branching, pull requests, coding conventions, project structure, quality commands, documentation
  and test expectations, and the review and acceptance process.
- `CODE_OF_CONDUCT.md` MUST establish expectations for respectful community participation.
- Example configuration MUST contain no real secrets. The documented path to fork, customize,
  self-host, and deploy the project MUST be reproducible.
- All TypeScript MUST compile in strict mode. Code MUST be readable, consistently organized, and
  documented where intent or architectural tradeoffs are not obvious.
- Important architectural decisions MUST be recorded. External dependencies MUST remain minimal.
- GitHub Actions MUST run the required automated quality checks.
- Contributor onboarding MUST remain low-friction. Process requirements MUST exist only when they
  protect quality, security, maintainability, or community health.

Rationale: an open-source project succeeds when new contributors can understand its purpose,
operate it safely, and make useful changes without unnecessary bureaucracy.

### VI. Cloudflare-Native Architecture

- The frontend MUST deploy to Cloudflare Pages, and backend components MUST be compatible with the
  Cloudflare platform.
- Backend functionality, persistence, and coordination MUST prefer Cloudflare-native services.
  Persistent key/value storage SHOULD be used where it satisfies the correctness requirements.
- The architecture MUST minimize infrastructure components and MUST NOT depend on unnecessary
  external services.
- Local development MUST work with Wrangler. Configuration and secrets MUST remain separate from
  application code.
- Deployment MUST be straightforward and reproducible from the public GitHub repository.
- `shopping.lupesko.com` is the initial production domain, but reusable application logic MUST NOT
  hardcode that domain.
- Documentation and configuration MUST enable contributors to deploy independent CartMates
  instances under their own accounts and domains.

Rationale: a small Cloudflare-native footprint aligns local and production behavior, reduces
operational burden, and preserves practical self-hosting.

### VII. Testing and Reliability

- Automated tests MUST cover adding, removing, and clearing items; marking individual items and the
  entire list as bought; and reading current list state.
- Tests MUST cover authentication, email-allowlist authorization, invalid and malicious input,
  structured error behavior, and protected API access independent of the frontend.
- Concurrent-operation tests MUST prove that simultaneous mutations do not lose updates and that
  retries do not repeat destructive operations.
- Persistence tests MUST prove that acknowledged state survives backend restarts and deployments.
- Connectivity failures MUST produce graceful, actionable behavior without corrupting or silently
  discarding user intent.
- Linting, strict typechecking, automated tests, and development and production builds MUST remain
  reliable. All required CI checks MUST pass before merge.
- Tests MUST be deterministic, readable, and maintainable. Test value MUST be judged by protected
  behavior and risk, not an arbitrary coverage percentage.
- Reliability mechanisms for rare edge cases MUST NOT introduce complexity disproportionate to the
  demonstrated risk.

Rationale: focused tests and predictable failure handling protect the collaborative behaviors that
matter without turning the project into a test or infrastructure framework.

### VIII. Performance and Responsiveness

- Startup, list display, and everyday interactions MUST feel fast on typical mobile devices.
- JavaScript bundles, dependency weight, and network requests MUST be kept small and justified.
- In-progress operations MUST provide visible feedback, and synchronization MUST remain simple and
  efficient.
- Lightweight polling MUST be preferred over WebSockets, push systems, or other real-time
  infrastructure unless an approved requirement demonstrates that polling is insufficient.
- Optimization MUST prioritize measured bottlenecks, perceived responsiveness, and usability.
  Premature or speculative optimization is prohibited.

Rationale: fast perceived response matters in a store, while simple synchronization is easier to
operate and debug than complex real-time infrastructure.

### IX. Privacy and Minimal Data Collection

- CartMates MUST store only data necessary to authenticate approved users and operate shared
  shopping lists.
- Behavioral analytics, advertising, user tracking, and third-party tracking technologies MUST NOT
  be introduced.
- Shopping-list data MUST NOT be disclosed to unauthorized users or services.
- Unnecessary profiles, behavioral metadata, and identity attributes MUST NOT be stored.
- Logs MUST be minimal and privacy-conscious and MUST NOT contain tokens, secrets, list contents, or
  unnecessary personal data.
- Documentation MUST clearly describe what information the application stores and why.
- A self-hosted instance MUST be capable of operating independently without sharing application data
  with another CartMates instance.

Rationale: a simple shared list must not require users to surrender household privacy, and
self-hosters must retain control over their own data.

### X. Maintainability and Future Evolution

- Architecture MUST be modular only where boundaries materially improve clarity, testing, security,
  or change isolation; modularity MUST NOT become overengineering.
- UI, authentication, business rules, and persistence SHOULD be separated when doing so makes their
  responsibilities and contracts clearer.
- Application behavior MUST NOT be tightly coupled to one deployment's domain, secrets, or account
  configuration.
- Designs MUST permit straightforward incremental enhancement without implementing speculative
  extension points or unused features.
- Backward compatibility MUST be preserved when reasonably practical. Breaking changes MUST be
  intentional, documented, and accompanied by migration guidance when state or configuration is
  affected.
- Incremental improvements MUST be preferred over large rewrites unless evidence shows that a
  rewrite is the lowest-risk solution.
- Code and documentation MUST remain approachable to occasional contributors.

Rationale: disciplined boundaries and incremental change preserve flexibility without paying the
ongoing cost of architecture for hypothetical futures.

## Technical and Product Constraints

- The approved specification is the feature boundary. Product ideas outside it MUST enter the
  specification process before implementation.
- Protected shopping-list operations MUST use authenticated, authorized backend APIs; direct client
  access to persistence MUST NOT bypass server-side policy.
- Shared-list coordination MUST provide serialization, atomic durability, and retry safety.
- The initial persistence design MUST evaluate newline-delimited text stored through a simple
  Cloudflare-native persistence primitive before considering a relational schema or ORM.
- The production deployment MUST target Cloudflare Pages and compatible Cloudflare backend services,
  while local development MUST use Wrangler.
- Production domains, allowlists, resource identifiers, and secrets MUST be configuration rather
  than reusable application constants.
- The initial `shopping.lupesko.com` deployment MUST use the same documented, reproducible path
  available to independent self-hosters.

## Development Workflow and Quality Gates

1. Every change MUST trace to an approved specification or a narrowly scoped defect, documentation,
   security, reliability, or maintenance need. Speculative features MUST be rejected.
2. Plans and reviews MUST evaluate relevant effects on security, authorization, privacy, data
   consistency, retries, accessibility, mobile usability, performance, Cloudflare behavior, and
   self-hosting.
3. Security-sensitive changes MUST document threat assumptions, server-side enforcement, session
   behavior, input validation, secret handling, and least-privilege implications.
4. Changed core behavior MUST have meaningful automated tests. Authentication, authorization,
   concurrency, retry, persistence, and invalid-input boundaries MUST be tested whenever affected.
5. User-facing changes MUST be reviewed at phone-sized viewports, with keyboard and screen-reader
   behavior, WCAG 2.2 AA criteria, reduced motion, slow-network behavior, and all relevant states.
6. Documentation MUST change with user-visible behavior, setup, configuration, architecture,
   deployment, storage, privacy, or contributor-workflow changes.
7. Before merge, GitHub Actions MUST pass lint, TypeScript typechecking, the full automated test
   suite, and development and production builds. Required checks MUST NOT be bypassed for ordinary
   changes.
8. New dependencies, services, abstractions, or infrastructure MUST document the current
   requirement, rejected simpler options, security and privacy impact, and operational cost.
9. Data and deployment changes MUST be verified for retry, restart, redeployment, migration, and
   rollback safety as applicable.

## Governance

This constitution is the authoritative source of engineering and product principles for CartMates.
Specifications, technical plans, tasks, reviews, and implementation decisions MUST comply with it.
When another project document conflicts with this constitution, this constitution governs.

When principles conflict, decisions MUST apply this priority order:

1. Security and data correctness.
2. Simplicity and maintainability.
3. User experience and accessibility.
4. Reliability and performance.
5. Extensibility and optional enhancements.

Exceptions MUST be explicit, narrowly scoped, justified in writing, approved by a maintainer before
merge, and tracked with an owner and an expiration or resolution condition. Principles MUST NOT be
weakened merely for implementation convenience.

Amendments MUST be intentional and proposed in a reviewed pull request that states the rationale,
affected principles, compatibility impact, and any migration or follow-up work. An amendment is
adopted only after maintainer approval and after dependent specifications or guidance are updated
or explicitly scheduled for update.

Constitution versions follow semantic versioning: MAJOR for backward-incompatible governance
changes or principle removals and redefinitions; MINOR for new principles or materially expanded
guidance; PATCH for clarifications and non-semantic wording corrections. The ratification date
remains the original adoption date, while the last-amended date changes with each adopted amendment.

Every specification, plan, task set, and implementation review MUST include an explicit constitution
compliance check. Compliance MUST be re-evaluated whenever an exception expires or the affected area
changes.

**Version**: 2.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05
