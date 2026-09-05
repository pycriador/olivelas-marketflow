---
title: "MarketFlow — Roadmap"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Roadmap

> Language: EN | [Português (pt-BR)](../pt-BR/roadmap.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/06-ROADMAP.md`](../../sdd/06-ROADMAP.md) and backlog items in [`sdd/10-FULL-SYSTEM.md`](../../sdd/10-FULL-SYSTEM.md).

## Evolution principles

- Incremental evolution: deliver value early and evolve by priorities.
- Security before scale: security capabilities are P0/P1, never postponed for scale.
- Do not turn the MVP into an ERP: POS, finance, accounting, tax, CRM and full e-commerce are future with explicit decision.
- Any AI used for development must read the documentation before changing the architecture.

## Priorities

| Priority | Meaning |
| --- | --- |
| P0 | Required for MVP / operation |
| P1 | High value right after the MVP |
| P2 | Evolution |
| P3 | Future |

## MVP (P0)

Source: `sdd/06-ROADMAP.md` and backlog `29-BACKLOG`.

- Landing page.
- Auth (email+password + Google OAuth) and first company creation.
- Multi-company and company switching.
- IAM/RBAC (GLOBAL_ADMIN, ADMIN, STOCK, VISITOR).
- Categories, brands, manufacturers, suppliers.
- Products (CRUD, images, cost/sale/promo price, SKU/barcode, units).
- Basic inventory (entry, exit, adjustment, loss, count, history).
- Lots and expiry.
- Public catalog (product publishing, company slug).
- Basic catalog requests.
- AI product registration (photo → data + confidence → human review → save).
- In-app notifications (low stock, expiry, invitations, requests).

## Security P0/P1

- P0: Supabase Auth, RLS, tenant isolation, RBAC, backend authorization, secure Storage, input validation, output filtering, secrets, HTTPS, basic rate limiting, audit logs for critical operations, inventory and public catalog protection, AI quota, cross-tenant and IDOR/BOLA tests.
- P1: security headers, CSP, monitoring, dependency scanning, backup/recovery, abuse detection, security alerts, advanced AI cost controls.
- P2 (future): MFA, custom roles, ABAC, SSO/SAML/OIDC, IP allowlist, advanced threat detection, advanced LGPD workflows.

MVP security acceptance criteria in `sdd/08-SECURITY.md`.

## P1 — High priority

- Reports with export (CSV/XLSX/PDF).
- Observability improvements (structured logs, metrics, alerts).
- P1 security (above).
- AI efficiency and cost optimization.

## P2 — Evolution

- Monetization: Free/Basic/Pro/Business/Enterprise plans, configurable limits, subscriptions and billing per company. See [decisions/adr-006-monetization-free-first.md](decisions/adr-006-monetization-free-first.md).
- MFA and advanced security controls.

## P3 — Future

- POS.
- Tax/fiscal.
- Finance.
- Branches.
- Public API for third parties.
- Automations and AI Copilot.
- Multi-channel notifications (email, WhatsApp, push).
- Online billing/payments (gateway + webhooks).
- Enterprise features (SSO, SAML, OIDC, IP allowlist, advanced reports).

## Rule for implementing AI

Analyze all project documents before creating tasks. Identify dependencies, gaps and conflicts. Prioritize security, multi-tenancy, RLS, user value and simplicity. Do not implement future features without an explicit decision.

## Related documentation

| Document | Path |
| --- | --- |
| Project overview | [project-overview.md](project-overview.md) |
| Security (priorities) | [security/security.md](security/security.md) |
| Monetization | [decisions/adr-006-monetization-free-first.md](decisions/adr-006-monetization-free-first.md) |
| Source | [`sdd/06-ROADMAP.md`](../../sdd/06-ROADMAP.md), [`sdd/07-MONETIZATION.md`](../../sdd/07-MONETIZATION.md) |