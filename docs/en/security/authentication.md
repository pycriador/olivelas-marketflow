---
title: "MarketFlow — Authentication"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Authentication

> Language: EN | [Português (pt-BR)](../../pt-BR/security/authentication.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/03-AUTH.md`](../../../sdd/03-AUTH.md). Partially implemented (frontend prototype wires Supabase Auth client; full backend flows pending).

## Purpose

Define how users (human) and integrators (machine) prove identity in MarketFlow: providers, principles and responsibilities over credentials and sessions. Machine authentication (API Keys) is covered here only as a reference — details in [contracts/api.md](../contracts/api.md) and [ADR-008](../decisions/adr-008-api-first-and-api-keys.md).

## Entry point (mechanism) — human

| Entry point | Mechanism | Classification |
| --- | --- | --- |
| Registration / login | Supabase Auth — email + password | Confirmed (SDD) |
| Registration / login | Supabase Auth — Google OAuth | Confirmed (SDD) |
| Session | Session tokens managed by Supabase Auth | Confirmed (SDD) |

## Entry point (mechanism) — machine

| Entry point | Mechanism | Classification |
| --- | --- | --- |
| API access | API Keys `mf_live_...` / `mf_test_...` (bearer) | Confirmed (SDD) — ADR-008 |

## Providers — MVP

| Provider | Status | Notes |
| --- | --- | --- |
| Email + password | MVP | Passwords hashed by Supabase; the application **never** stores passwords |
| Google OAuth | MVP | OAuth 2.0 / OpenID via Supabase |
| Microsoft | Future | — |
| Apple | Future | — |
| Magic Link | Future | — |
| OIDC | Future | — |
| SAML | Future (enterprise) | — |

OAuth secrets live in secure provider configuration (never in the frontend). API Keys are hashed at rest (`secret_hash`) and shown in full only once, at creation.

## MFA

- Out of the MVP; planned (P2/future). See [roadmap.md](../roadmap.md) and security priorities in [security.md](security.md).

## Principles

| Principle | Meaning | Classification |
| --- | --- | --- |
| Security by Default | Secure configuration by default | Confirmed (SDD) |
| Least Privilege | Sessions and tokens with the minimum required | Confirmed (SDD) |
| Secure sessions | Secure tokens; no cache leak on logout/company switch | Confirmed (SDD) |
| Passwords not stored by the application | Hashing managed by Supabase | Confirmed (SDD) |
| No sensitive tokens in the business database | Secrets and credentials outside business tables | Confirmed (SDD) |
| No private credentials in the frontend | No secrets in the client | Confirmed (SDD) |

## Operational rules (SDD)

- Logout and company switch must not cause cache leak.
- Removed users lose access immediately; disabled users cannot operate.
- No Global Admin creation through public UI.
- Credentials in transit via HTTPS (managed infrastructure).

## Responsibilities

| Component | Responsibility | Classification |
| --- | --- | --- |
| Supabase Auth | Identity, sessions, providers, hashing | Confirmed (SDD) |
| Frontend | Redirects, session states, error capture | Confirmed (SDD) |
| Edge Functions / API layer | Token validation in privileged operations; API Key hash + status check | Confirmed (SDD) |
| PostgreSQL/RLS | Never trusts `user_id`/`company_id` from the client | Confirmed (SDD) |

## Related documentation

| Document | Path |
| --- | --- |
| Authorization (RBAC + scopes) | [authorization.md](authorization.md) |
| Security (overall posture) | [security.md](security.md) |
| Contracts (API Keys) | [contracts/api.md](../contracts/api.md) |
| Full source | [`sdd/03-AUTH.md`](../../../sdd/03-AUTH.md) |