# vax-demo-saas-api

A small demo SaaS API repository for showing the VAX workflow end to end.

## Purpose

This repository is meant to be the public demo app for VAX. It is intentionally small, understandable, and focused on a believable SaaS-style API surface so visitors can review code, workflow configuration, and the resulting VAX report without extra setup overhead.

## Important demo note

This app is intentionally designed to include simplified security issues for demonstration and scanning purposes. It should **not** be used as production code.

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

## Planned VAX workflow

This repo is intended to be scanned by VAX from GitHub Actions using a workflow saved at `.github/workflows/vax.yaml`.

> Local scaffold note: the workflow file is intentionally not included in this working copy yet.

## Links

- Product site: https://vax.ata.systems
- GitHub Marketplace listing: https://github.com/marketplace/actions/vax-evidence-scan

## Repository structure

```text
src/
  app.js
  server.js
  data/customers.js
test/
  app.test.js
```
