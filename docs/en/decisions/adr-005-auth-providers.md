---
title: "ADR-005 — Authentication Providers"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-005 — Authentication Providers

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-005-auth-providers.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-04

## Context

MarketFlow needs reliable identity in the MVP with low registration friction (small retailers) and enterprise-readiness for the future.

## Problem

Which authentication mechanisms to offer in the MVP and the future?

## Decision

In the MVP: **email + password** and **Google OAuth**, both via **Supabase Auth**. Future: Microsoft, Apple, Magic Link, OIDC, SAML and **MFA** (P2+). The application never stores passwords (hash in Supabase); OAuth secrets live in secure configuration, never in the frontend. Details: `sdd/03-AUTH.md`.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Own auth (JWT + hash) | Full control | Security minefield; high risk in the MVP | Supabase Auth delivers this with less risk |
| Social login only (Google) | Low friction | Excludes users without Google; retailers often prefer email | MVP includes both |
| MFA in the MVP | Strong security | Friction and complexity for the final user in the MVP | Future (P2) |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Low-friction registration | OAuth secrets require management | Future MFA/SAML options add choices |
| Passwords hashed outside the application | Tied to the identity provider | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Credential theft | Secure sessions; monitor auth events | Proposed |
| Cache leak on logout/company switch | Security testing/acceptance in the MVP | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| Supabase Auth | Identity/sessions | [../security/authentication.md](../security/authentication.md) |
| Frontend | Login/registration flows; session states | [../security/authentication.md](../security/authentication.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | Token/session for data access | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-005 |
| Component | Supabase Auth, Frontend |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/03-AUTH.md` (spec — not implemented) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-001 | related (Supabase as the backend) |
| ADR-004 | related (authorization uses the identity) |

## References

| Reference | Location |
| --- | --- |
| Authentication doc | [../security/authentication.md](../security/authentication.md) |
| Security | [../security/security.md](../security/security.md) |
| Evidence | [`sdd/03-AUTH.md`](../../../sdd/03-AUTH.md) |