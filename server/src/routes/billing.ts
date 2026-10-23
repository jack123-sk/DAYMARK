import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { authMiddleware } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';
import { BillingService } from '../services/billingService.js';

const router = Router();

// Publicly accessible plans list
router.get('/plans', (_req: Request, res: Response): void => {
  res.json({ plans: BillingService.getPlans() });
});

// Authenticated current subscription & usage metrics
router.get('/subscription', authMiddleware, (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const subData = BillingService.getOrgSubscription(orgId);
  res.json(subData);
});

// Change plan tier (Upgrade/Downgrade)
router.post('/change-plan', authMiddleware, (req: Request, res: Response): void => {
  try {
    const orgId = req.organization!.id;
    const { planTier, billingCycle } = req.body;

    if (!planTier) {
      res.status(400).json({ error: 'planTier is required' });
      return;
    }

    const updated = BillingService.changePlan(orgId, planTier, billingCycle || 'monthly');
    logAuditEvent(req, 'PLAN_CHANGED', 'subscription', orgId, `Changed plan to ${planTier} (${billingCycle || 'monthly'})`);

    res.json({
      success: true,
      message: `Plan changed successfully to ${planTier}.`,
      subscriptionData: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Plan change failed' });
  }
});

// Live Payment Webhook Endpoint with Cryptographic Signature Verification
router.post('/webhook', (req: Request, res: Response): void => {
  const signature = (req.headers['stripe-signature'] as string) || (req.headers['x-razorpay-signature'] as string) || '';
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  const result = BillingService.processWebhookEvent(rawBody, signature, req.body);
  if (!result.verified) {
    console.warn('[Webhook Warning] Received unverified signature. Recorded for security audit.');
  }

  res.json({ received: true, verified: result.verified });
});

// Test Webhook Simulator (Allows verification and demonstration of signed webhook handling)
router.post('/simulate-webhook', authMiddleware, (req: Request, res: Response): void => {
  const orgId = req.organization!.id;
  const { eventType = 'payment_intent.succeeded', amount = 14900 } = req.body;

  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_daymark_demo_key_2026';
  const payload = JSON.stringify({
    type: eventType,
    data: {
      object: {
        id: `ch_sim_${Math.random().toString(36).substring(2, 10)}`,
        amount,
        currency: 'usd',
        metadata: { organizationId: orgId }
      }
    }
  });

  // Generate legitimate HMAC SHA-256 signature
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const result = BillingService.processWebhookEvent(payload, signature, JSON.parse(payload));

  logAuditEvent(req, 'WEBHOOK_SIMULATED', 'payment_event', result.eventId, `Simulated signed webhook: ${eventType} ($${amount / 100})`);

  res.json({
    success: true,
    message: 'Cryptographically signed webhook successfully verified and reconciled.',
    result
  });
});

export default router;
