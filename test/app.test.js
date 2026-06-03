import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

async function withServer(run) {
  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test('GET /health returns service status', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: 'ok',
      service: 'vax-demo-saas-api'
    });
  });
});

test('GET /customers exposes demo customer records', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/customers`);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(Array.isArray(payload.customers), true);
    assert.equal(payload.customers.length, 2);
    assert.equal(payload.customers[0].id, 'acme-retail');
  });
});

test('POST /assessments validates required fields', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/assessments`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ customerId: 'acme-retail' })
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: 'customerId, framework, and requestedBy are required'
    });
  });
});
