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

test('POST /auth/magic-link returns a predictable demo link and permissive CORS header', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/auth/magic-link`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ email: 'founder@example.com' })
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    const payload = await response.json();
    assert.equal(payload.email, 'founder@example.com');
    assert.match(payload.magicLink, /^https:\/\/demo\.vax\.local\/magic\//);
    assert.match(payload.note, /without rate limiting or expiry/i);
  });
});

test('GET /admin/customers/export exposes customer data with only a demo header', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/admin/customers/export`, {
      headers: {
        'x-demo-user': 'analyst@example.com'
      }
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.requestedBy, 'analyst@example.com');
    assert.equal(Array.isArray(payload.customers), true);
    assert.equal(payload.customers.length, 2);
    assert.equal(typeof payload.internalApiKeyPreview, 'string');
  });
});

test('GET /crash leaks stack traces and request details', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/crash`);
    assert.equal(response.status, 500);
    const payload = await response.json();
    assert.match(payload.error, /internal api key/i);
    assert.equal(payload.path, '/crash');
    assert.match(payload.stack, /Error: Demo crash/);
  });
});
