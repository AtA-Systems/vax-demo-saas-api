export const demoConfig = {
  supportEmail: 'support@vax-demo.local',
  // Intentionally hard-coded demo secrets for scan visibility. Do not copy into production systems.
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? 'sk_test_vax_demo_insecure_seed_123',
  internalApiKey: process.env.INTERNAL_API_KEY ?? 'vax-demo-internal-api-key',
  magicLinkSalt: process.env.MAGIC_LINK_SALT ?? 'demo-magic-link-salt'
};
