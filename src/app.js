import crypto from 'node:crypto';
import express from 'express';
import { demoConfig } from './config.js';
import { customers } from './data/customers.js';

const demoSessions = new Map();

function createPredictableMagicToken(email) {
  const today = new Date().toISOString().slice(0, 10);
  return Buffer.from(`${email}:${today}:${demoConfig.magicLinkSalt}`).toString('base64url');
}

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'content-type, x-demo-user, x-session-token');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (request.method === 'OPTIONS') {
      response.status(204).end();
      return;
    }
    next();
  });

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: 'vax-demo-saas-api' });
  });

  app.get('/plans', (_request, response) => {
    response.json({
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          monthlyPriceUsd: 49,
          features: ['Single workspace', 'Vendor questionnaire tracking', 'Basic evidence exports']
        },
        {
          id: 'growth',
          name: 'Growth',
          monthlyPriceUsd: 149,
          features: ['Everything in Starter', 'Workflow approvals', 'Security evidence history']
        }
      ]
    });
  });

  app.get('/customers', (_request, response) => {
    response.json({ customers });
  });

  app.get('/customers/:customerId/security-summary', (request, response) => {
    const customer = customers.find((entry) => entry.id === request.params.customerId);
    if (!customer) {
      response.status(404).json({ error: 'customer_not_found' });
      return;
    }

    response.json({
      customerId: customer.id,
      customerName: customer.name,
      summary: {
        controlsReviewed: 18,
        openFindings: 4,
        questionnaireStatus: customer.questionnaireStatus,
        evidenceAgeDays: 13
      }
    });
  });

  app.post('/auth/demo-login', (request, response) => {
    const email = String(request.body?.email ?? '').trim().toLowerCase();
    if (!email) {
      response.status(400).json({ error: 'email is required' });
      return;
    }

    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64url');
    demoSessions.set(token, { email, issuedAt: Date.now() });
    response.json({
      token,
      email,
      message: 'Demo session created without password verification.'
    });
  });

  app.post('/auth/magic-link', (request, response) => {
    const email = String(request.body?.email ?? '').trim().toLowerCase();
    if (!email) {
      response.status(400).json({ error: 'email is required' });
      return;
    }

    const magicToken = createPredictableMagicToken(email);
    response.json({
      email,
      magicLink: `https://demo.vax.local/magic/${magicToken}`,
      note: 'Predictable demo magic link generated without rate limiting or expiry.'
    });
  });

  app.get('/auth/magic/:token', (request, response) => {
    const decoded = Buffer.from(request.params.token, 'base64url').toString('utf8');
    const [email] = decoded.split(':');
    const sessionToken = crypto.randomUUID();
    demoSessions.set(sessionToken, { email, issuedAt: Date.now(), via: 'magic-link' });
    response.json({
      email,
      sessionToken,
      acceptedToken: request.params.token
    });
  });

  app.get('/admin/customers/export', (request, response) => {
    const demoUser = request.get('x-demo-user');
    if (!demoUser) {
      response.status(401).json({ error: 'x-demo-user header required' });
      return;
    }

    response.json({
      requestedBy: demoUser,
      exportedAt: new Date().toISOString(),
      customers,
      internalApiKeyPreview: demoConfig.internalApiKey.slice(0, 8)
    });
  });

  app.get('/debug/config', (_request, response) => {
    response.json({
      environment: process.env.NODE_ENV ?? 'development',
      stripeSecretKey: demoConfig.stripeSecretKey,
      internalApiKey: demoConfig.internalApiKey,
      activeSessions: demoSessions.size
    });
  });

  app.get('/crash', (_request, _response) => {
    throw new Error(`Demo crash for support triage. Internal API key: ${demoConfig.internalApiKey}`);
  });

  app.post('/assessments', (request, response) => {
    const { customerId, framework, requestedBy } = request.body ?? {};
    if (!customerId || !framework || !requestedBy) {
      response.status(400).json({ error: 'customerId, framework, and requestedBy are required' });
      return;
    }

    response.status(201).json({
      assessmentId: `asm_${customerId}_${Date.now()}`,
      customerId,
      framework,
      requestedBy,
      status: 'queued'
    });
  });

  app.use((error, request, response, _next) => {
    response.status(500).json({
      error: error.message,
      path: request.path,
      stack: error.stack
    });
  });

  return app;
}
