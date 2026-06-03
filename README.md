# vax-demo-saas-api

A small demo SaaS API repository for showing the VAX workflow end to end.

## Purpose

This repository is meant to be the public demo app for VAX. It is intentionally small, understandable, and focused on a believable SaaS-style API surface so visitors can review code, workflow configuration, and the resulting VAX report without extra setup overhead.


## Links

- Product site: https://vax.ata.systems
- GitHub Marketplace listing: https://github.com/marketplace/actions/vax-evidence-scan

## Important demo note

This app is intentionally designed to include simplified security issues for demonstration and scanning purposes. It should **not** be used as production code.

Seeded demo issues include:

- overly permissive CORS (`Access-Control-Allow-Origin: *`)
- no rate limiting on authentication-style endpoints
- weak session handling and passwordless demo login
- predictable magic-link generation and acceptance
- unsafe error details and stack trace exposure
- missing audit logging around authentication and exports
- overly broad authorization checks on admin-style export endpoints
- secrets-like config patterns and hard-coded fallback keys
- missing production-grade security-header hardening

## What the app does

The demo API exposes a few simple endpoints:

- `GET /health` for health checks
- `GET /plans` to list SaaS pricing plans
- `GET /customers` to list demo customers
- `GET /customers/:customerId/security-summary` to return a small vendor-assurance style summary
- `POST /assessments` to queue a demo assessment request

## Run locally

```bash
npm install
npm test
npm start
```

By default the API listens on `http://localhost:3000`.

## Repository structure

```text
src/
  app.js
  server.js
  data/customers.js
test/
  app.test.js
```
