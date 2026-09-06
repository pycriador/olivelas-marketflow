---
title: "MarketFlow — Security"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Security

> Language: EN | [Português (pt-BR)](../../pt-BR/security/security.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/08-SECURITY.md`](../../../sdd/08-SECURITY.md) and [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md). Entry document of the MarketFlow security posture (partially implemented: frontend prototype + migrations with RLS).

**Final rule:** never trust the client. The frontend improves the experience; the backend applies business rules; PostgreSQL/RLS guarantees data isolation; Storage guarantees file isolation; the authentication system guarantees identity; the API layer guarantees token-scoped machine access; auditing guarantees traceability. Security in depth: Authn + Authz + Isolation + RLS + Validation + Constraints + Rate limiting + Audit + Monitoring — a single layer is never enough.

## Scope

| In scope | Out of scope |
| --- | --- |
| Authentication, authorization, multi-tenant isolation, RLS | Physical/datacenter security (managed) |
| Secure Storage, API (`/api/v1`, API Keys, webhooks), public catalog | Corporate SIEM/EDR |
| AI (quota/prompt/untrusted output), WhatsApp (privacy/LGPD) | External audit / formal compliance |
| Basic LGPD, audit, secrets | Custom cryptography |
| Security testing (cross-tenant, IDOR/BOLA) | |

## Ownership

| Role | Owner |
| --- | --- |
| Security | marketflow-team |
| System / technical | marketflow-team |
| Data | marketflow-team |
| Operational / incident | marketflow-team (to be formalized) |

## Assets and classification

| Asset | Classification | Owner | Notes |
| --- | --- | --- | --- |
| Customer data (products, inventory, prices) | Sensitive | marketflow-team | RLS per company |
| `cost_price` / margin | Restricted | marketflow-team | Never in the public catalog |
| Credentials / sessions | Critical | Supabase (managed) | Managed Auth |
| API Keys (`secret_hash`) | Critical | marketflow-team | Hashed at rest; shown once; scopes |
| Webhook secrets | Critical | marketflow-team | Per endpoint; sign deliveries |
| Images/logos | Sensitive | marketflow-team | Storage isolated per company |
| Personal data (LGPD) | Sensitive | marketflow-team | Minimal necessary; flows to document |
| AI resources | Valuable (cost) | marketflow-team | Quota + rate limit |

## Threat model

Source: initial `sdd/08-SECURITY.md` + `sdd/12-EXTRAS.md`.

| Threat | Affected asset | Likelihood | Impact | Mitigation | Classification |
| --- | --- | --- | --- | --- | --- |
| Cross-tenant access | Customer data | Medium | Critical | RLS + authorization | Confirmed (SDD) |
| IDOR/BOLA | Customer data | High | Critical | Object-level authorization | Confirmed (SDD) |
| Privilege escalation | Roles | Medium | Critical | Server-side RBAC; no self-elevation | Confirmed (SDD) |
| Credential theft | Accounts | Medium | Critical | Supabase Auth + secure sessions | Confirmed (SDD) |
| **API Key theft** | API data | Medium | Critical | Hash-only storage; scopes; revocation/rotation | Confirmed (SDD) |
| **Webhook forgery/replay** | Integrations | Medium | High | Signed deliveries; idempotent events; retries | Confirmed (SDD) |
| API abuse | API | Medium | High | Rate limiting per category | Confirmed (SDD) |
| AI abuse | AI resources | Medium | High | Quotas + limits + usage logs | Confirmed (SDD) |
| Prompt injection | AI | Medium | High | Structured output + validation; treat AI output as UNTRUSTED DATA | Confirmed (SDD) |
| Data leakage | Data | Low | Critical | Field filtering | Confirmed (SDD) |
| Malicious upload | Storage | Medium | High | Validation + Storage policies | Confirmed (SDD) |
| SQL injection | Database | Low | Critical | Parameterized queries | Confirmed (SDD) |
| XSS | Frontend | Low | High | Escaping + sanitization | Confirmed (SDD) |
| Catalog spam | Catalog | Medium | Medium | Rate limiting | Confirmed (SDD) |
| Inventory manipulation | Inventory | Medium | High | Transactions + permissions + audit | Confirmed (SDD) |
| Secret exposure | Secrets | Low | Critical | Environment secrets; never in code; hashed keys | Confirmed (SDD) |
| Dependency vulnerability | Stack | High | High | Scanning + updates (P1) | Confirmed (SDD) |
| Data loss | Data | Low | Critical | Backups + recovery (P1) | Confirmed (SDD) |

## Risks

| Risk | Severity | Residual | Status | Classification |
| --- | --- | --- | --- | --- |
| Cross-tenant leak | Critical | — (RLS enabled, policies partial) | mitigated by design (RLS) | Proposed |
| Secret/Key exposure | Critical | — | open (depends on discipline) | Proposed |
| AI abuse (financial cost) | High | — | mitigated by design (quota) | Proposed |
| Managed supplier dependency | Medium | — | accepted | Proposed |

## Trust boundaries

Source: boundary model in `sdd/08-SECURITY.md`.

| Boundary | Inside | Outside | Controls |
| --- | --- | --- | --- |
| Anonymous User | — | visitor/public content | Rate limit; only published |
| Authenticated User | valid session | other companies' data | Supabase Auth |
| API Key consumer | token + company + scope | other tenants/scopes | Hash store; scope validation |
| Company Member | current tenant | other tenants | RLS `company_id` |
| Role / Permission (or Scope) | actions of the role/scope | actions outside | Server-side RBAC + scopes |
| Backend / RLS | trusted enforcement | client claims | RLS + Edge Functions |
| Database | source of truth | — | Constraints + RLS |

No layer should assume the previous layer is sufficient.

## Identity and access

### Authentication

| Entry point | Mechanism | Classification |
| --- | --- | --- |
| Login/registration | Supabase Auth — email+password, Google OAuth (MVP) | Confirmed (SDD) |
| Machine access | API Keys (`mf_live_`/`mf_test_`; hash-stored; per-company; scopes) | Confirmed (SDD) — ADR-008 |
| Future | Microsoft, Apple, Magic Link, OIDC, SAML, MFA | Proposed |

Details: [authentication.md](authentication.md).

### Authorization

| Action / resource | Who is allowed | Mechanism | Classification |
| --- | --- | --- | --- |
| Inventory/product actions | Roles per company | RBAC in `CompanyUser.role` | Confirmed (SDD) |
| API operations | API Keys with the required scopes | Token + company + scope | Confirmed (SDD) — ADR-008 |
| Data access | Company members | RLS by `company_id` | Confirmed (SDD) |
| Public catalog | Everyone (published items) | Filtered public read | Confirmed (SDD) |

Details: [authorization.md](authorization.md).

## Secrets

| Name | Purpose | Source | Required |
| --- | --- | --- | --- |
| Service Role Key (Supabase) | Admin/privileged | Environment (backend/Edge Functions) | yes |
| AI provider keys | AI calls | Environment | yes |
| WhatsApp provider credentials | Message delivery | Environment | yes |
| Webhook secrets | Sign outbound deliveries | Per endpoint (generated) | yes |
| OAuth keys (Google) | Google OAuth config | Environment/Supabase | yes |

No secret values here — references only. Never expose the Service Role Key nor add secrets to code.

## Encryption and data protection

| Data / channel | At rest | In transit | Classification |
| --- | --- | --- | --- |
| Postgres data | managed (provider default at-rest) | HTTPS/TLS | Inferred |
| Images/Storage | managed | HTTPS/TLS | Inferred |
| Sessions/tokens | — | HTTPS | Confirmed (SDD) |
| API Keys | hashed (`secret_hash`) | HTTPS | Confirmed (SDD) |

| Data class | Handling rules | Retention | Classification |
| --- | --- | --- | --- |
| Personal data (LGPD) | Minimal necessary; flows to document | To be defined | Proposed |
| `cost_price`/margin | Never in the public catalog | Persistent | Confirmed (SDD) |
| WhatsApp messages | Data minimization; purpose; secure handling | Adequate retention (LGPD) | Confirmed (SDD) |

## Network and exposure

| Control | Purpose | Classification |
| --- | --- | --- |
| Rate limiting (public catalog, AI, API v1, webhooks) | Anti-abuse | Confirmed (SDD) |
| HTTPS | Transit security | Confirmed (SDD) |

| Surface | Exposure | Notes |
| --- | --- | --- |
| App (frontend) | Exposed | authenticated |
| Public catalog | Exposed | read-only, filtered |
| `/api/v1` | Exposed | API Key + scopes + rate limits |
| Edge Functions | Internal (via app/API) | server-side authorization |

## Controls and requirements

| Requirement | Control | Type | Evidence |
| --- | --- | --- | --- |
| Multi-tenant isolation | RLS + `company_id` | Preventive | `sdd/02-DATABASE`, `sdd/08-SECURITY` |
| Server-side authorization | RBAC + scopes + Edge Functions | Preventive | `sdd/08-SECURITY`, `sdd/12-EXTRAS` |
| API Key security | Hash storage; scope validation; revocation | Preventive | `sdd/12-EXTRAS` |
| Audit of critical operations | Audit logs + `api_request_logs` | Detective | `sdd/08-SECURITY`, `sdd/12-EXTRAS` |
| Untrusted AI output | Confidence + human review; never execute output | Preventive | `sdd/12-EXTRAS` |
| Inventory/history protection | Immutable movements + permissions | Preventive | `sdd/08-SECURITY` |

## Auditability and logging

| Event | Logged? | Where | Classification |
| --- | --- | --- | --- |
| Critical inventory operations | Yes (planned) | Audit logs | Proposed |
| Authentication events | Yes (managed) | Supabase Auth | Confirmed (SDD) |
| AI usage | Yes (planned/table) | `ai_usage_logs` | Proposed |
| API requests | Yes (table) | `api_request_logs` | Implemented (schema) |
| Webhook deliveries | Yes (table) | `webhook_deliveries` | Implemented (schema) |
| Sanitized logs (no secrets/PII) | Yes (planned) | Logging | Proposed |

## Monitoring and incidents

| Signal | Security purpose | Action |
| --- | --- | --- |
| Rate limit exceeded (catalog/API/AI) | Abuse | Alert/block |
| RLS/authorization errors | Attack or policy mismatch | Investigate |
| AI quota | Cost/abuse | Alert |
| Key revoked/expired usage | Abuse | Alert |

| Topic | Link / notes |
| --- | --- |
| Security monitoring | P1 — `sdd/08-SECURITY.md` |
| Security incidents | process to document (Detect→Contain→Investigate→Eradicate→Recover→Post-Incident) |
| Vulnerabilities | dependency scanning (P1) |
| Exceptions | to be defined |

## Dependencies and supply chain

| Dependency | Trust/privilege notes | Owner |
| --- | --- | --- |
| Supabase (Auth/Postgres/Storage/Functions) | Managed backend — high privilege | marketflow-team |
| Lovable Cloud | Frontend hosting | marketflow-team |
| AI providers | Image data access; cost | marketflow-team |
| WhatsApp Provider | Customer contact data; deliverability | marketflow-team |
| npm libraries (React, shadcn/ui, TanStack, Zod…) | Supply chain — scanning (P1) | marketflow-team |

## Testing and readiness

| Strategy | In use? | Last run |
| --- | --- | --- |
| Cross-tenant tests | Planned (P0/MVP) | — |
| IDOR/BOLA tests | Planned (P0/MVP) | — |
| Role tests | Planned (P0/MVP) | — |
| API scope tests | Planned (P0/MVP) | — |
| Dependency scanning | P1 | — |

| Readiness result | Partial — not production-ready |
| --- | --- |
| Notes | Work remaining: full RLS policies, triggers/functions, SDD tables, backend enforcement. MVP acceptance criteria in `sdd/08-SECURITY.md` |

## Security debt and drift

| ID | Description | Priority | Status |
| --- | --- | --- | --- |
| SEC-001 | Cross-tenant/IDOR/BOLA tests not implemented | High | Open |
| SEC-002 | Security monitoring/alerts (P1) not implemented | Medium | Open |
| SEC-003 | LGPD procedures/retention not documented | Medium | Open |
| SEC-004 | Incident response not documented | Medium | Open |
| SEC-005 | RLS policies defined only for 6 of 19 tables (others deny by default) | High | Open |

## Security recommendations

| Recommendation | Priority | Classification |
| --- | --- | --- |
| Complete RLS policies for all business tables | Critical | Proposed |
| Services: never trust `company_id`/`user_id`/permissions from the client | Critical | Proposed |
| API Keys: hash storage + scope least privilege + rotation | Critical | Proposed |
| AI quota + rate limit from the MVP; treat AI output as UNTRUSTED DATA | High | Proposed |
| Validation and storage policies for uploads | High | Proposed |
| Audit logs for critical operations | High | Proposed |
| Secure sessions; logout/company switch without cache leak | High | Proposed |

## Related documentation

| Document | Path |
| --- | --- |
| Authentication | [authentication.md](authentication.md) |
| Authorization | [authorization.md](authorization.md) |
| Architecture | [architecture/overview.md](../architecture/overview.md) |
| Contracts (security sections) | [contracts/api.md](../contracts/api.md) |
| ADRs | [decisions/README.md](../decisions/README.md) |
| Full source | [`sdd/08-SECURITY.md`](../../../sdd/08-SECURITY.md), [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |