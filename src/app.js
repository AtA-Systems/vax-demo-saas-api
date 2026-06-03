import express from 'express';
import { customers } from './data/customers.js';

export function createApp() {
  const app = express();

  app.use(express.json());

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

  return app;
}
