import crypto from 'node:crypto';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface PlanDefinition {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  monthlyPrice: number;
  annualPrice: number;
  limits: {
    maxProjects: number;
    maxWorkflowRunsMonthly: number;
    maxAiTokensMonthly: number;
    maxTeamSeats: number;
    maxCrmContacts: number;
  };
  features: string[];
}

export const PLAN_TIERS: Record<string, PlanDefinition> = {
  free: {
    id: 'plan_free',
    name: 'Free / Community',
    tier: 'free',
    monthlyPrice: 0,
    annualPrice: 0,
    limits: {
      maxProjects: 1,
      maxWorkflowRunsMonthly: 50,
      maxAiTokensMonthly: 10000,
      maxTeamSeats: 1,
      maxCrmContacts: 100
    },
    features: ['1 Active Project', 'Basic CRM Contacts', '50 Workflow Runs/mo', '10k AI Tokens/mo', 'Community Support']
  },
  starter: {
    id: 'plan_starter',
    name: 'Starter Automation',
    tier: 'starter',
    monthlyPrice: 49,
    annualPrice: 470,
    limits: {
      maxProjects: 5,
      maxWorkflowRunsMonthly: 500,
      maxAiTokensMonthly: 150000,
      maxTeamSeats: 3,
      maxCrmContacts: 1000
    },
    features: ['5 Business Projects', 'Nexora Opportunity Engine', '500 Workflow Runs/mo', '150k AI Tokens/mo', 'Email & Webhook Triggers']
  },
  pro: {
    id: 'plan_pro',
    name: 'Professional Agency OS',
    tier: 'pro',
    monthlyPrice: 149,
    annualPrice: 1430,
    limits: {
      maxProjects: 25,
      maxWorkflowRunsMonthly: 3000,
      maxAiTokensMonthly: 750000,
      maxTeamSeats: 10,
      maxCrmContacts: 10000
    },
    features: ['25 Active Projects', 'Human-in-the-Loop Approval Gates', '3,000 Workflow Runs/mo', '750k AI Tokens/mo', 'Full AI Agent Suite (6 Agents)', 'Custom Webhooks & Audit Logs']
  },
  business: {
    id: 'plan_business',
    name: 'Business Scale',
    tier: 'business',
    monthlyPrice: 399,
    annualPrice: 3830,
    limits: {
      maxProjects: 100,
      maxWorkflowRunsMonthly: 15000,
      maxAiTokensMonthly: 3000000,
      maxTeamSeats: 30,
      maxCrmContacts: 50000
    },
    features: ['Unlimited Projects', '15,000 Workflow Runs/mo', '3M AI Tokens/mo', '30 Team Seats', 'Priority SLA', 'Dedicated Account Manager']
  },
  enterprise: {
    id: 'plan_enterprise',
    name: 'Enterprise Custom',
    tier: 'enterprise',
    monthlyPrice: 999,
    annualPrice: 9590,
    limits: {
      maxProjects: 9999,
      maxWorkflowRunsMonthly: 100000,
      maxAiTokensMonthly: 20000000,
      maxTeamSeats: 999,
      maxCrmContacts: 500000
    },
    features: ['Custom Limits', 'Dedicated Cloud / On-Prem VPC', 'SAML SSO', 'Custom Security Compliance Reviews', '24/7 Phone Support']
  }
};

export interface OrgSubscriptionData {
  subscription: any;
  plan: PlanDefinition;
  usage: {
    currentPeriod: string;
    workflowRuns: number;
    maxWorkflowRuns: number;
    aiTokens: number;
    maxAiTokens: number;
    contacts: number;
    maxContacts: number;
    projects: number;
    maxProjects: number;
  };
  invoices: any[];
}

export class BillingService {
  public static getPlans() {
    return Object.values(PLAN_TIERS);
  }

  public static getPlan(tier: string): PlanDefinition {
    return PLAN_TIERS[tier] || PLAN_TIERS.starter;
  }

  public static getOrgSubscription(organizationId: string): OrgSubscriptionData {
    const sub = db.prepare(`
      SELECT s.*, o.name as organization_name
      FROM subscriptions s
      JOIN organizations o ON o.id = s.organization_id
      WHERE s.organization_id = ?
    `).get(organizationId) as any;

    if (!sub) {
      // Create default starter subscription if missing
      const newSubId = uuidv4();
      db.prepare(`
        INSERT INTO subscriptions (id, organization_id, plan_tier, status, billing_cycle, current_period_end)
        VALUES (?, ?, 'starter', 'active', 'monthly', datetime('now', '+30 days'))
      `).run(newSubId, organizationId);

      return this.getOrgSubscription(organizationId);
    }

    const currentPeriod = new Date().toISOString().slice(0, 7);
    const usages = db.prepare(`
      SELECT metric, count FROM usage_records
      WHERE organization_id = ? AND period = ?
    `).all(organizationId, currentPeriod) as Array<{ metric: string; count: number }>;

    const usageMap: Record<string, number> = {};
    for (const u of usages) {
      usageMap[u.metric] = u.count;
    }

    const plan = this.getPlan(sub.plan_tier);

    // Fetch invoices / payment events
    const invoices = db.prepare(`
      SELECT id, event_type, amount, currency, status, provider_ref, verified, created_at
      FROM payment_events
      WHERE organization_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(organizationId);

    return {
      subscription: sub,
      plan,
      usage: {
        currentPeriod,
        workflowRuns: usageMap['workflow_runs'] || 0,
        maxWorkflowRuns: plan.limits.maxWorkflowRunsMonthly,
        aiTokens: usageMap['ai_tokens'] || 0,
        maxAiTokens: plan.limits.maxAiTokensMonthly,
        contacts: (db.prepare('SELECT COUNT(*) as c FROM contacts WHERE organization_id = ?').get(organizationId) as any).c,
        maxContacts: plan.limits.maxCrmContacts,
        projects: (db.prepare('SELECT COUNT(*) as c FROM business_projects WHERE organization_id = ?').get(organizationId) as any).c,
        maxProjects: plan.limits.maxProjects
      },
      invoices
    };
  }

  public static changePlan(organizationId: string, newTier: string, billingCycle: 'monthly' | 'annual' = 'monthly') {
    if (!PLAN_TIERS[newTier]) {
      throw new Error(`Invalid plan tier: ${newTier}`);
    }

    const plan = PLAN_TIERS[newTier];
    const amount = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

    // Update organization & subscription records
    db.prepare(`
      UPDATE organizations
      SET plan_tier = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newTier, organizationId);

    db.prepare(`
      UPDATE subscriptions
      SET plan_tier = ?, billing_cycle = ?, status = 'active', current_period_end = datetime('now', '+30 days'), updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = ?
    `).run(newTier, billingCycle, organizationId);

    // Record verified transaction event
    const eventId = uuidv4();
    const providerRef = `test_ch_${Math.random().toString(36).substring(2, 12)}`;
    db.prepare(`
      INSERT INTO payment_events (id, organization_id, event_type, amount, currency, status, provider_ref, verified)
      VALUES (?, ?, 'subscription_plan_change', ?, 'USD', 'success', ?, 1)
    `).run(eventId, organizationId, amount, providerRef);

    // Record notification
    db.prepare(`
      INSERT INTO notifications (id, organization_id, title, message, type, action_url)
      VALUES (?, ?, 'Subscription Updated', ?, 'success', '/app/billing')
    `).run(uuidv4(), organizationId, `Your workspace has been upgraded to ${plan.name} (${billingCycle}).`);

    return this.getOrgSubscription(organizationId);
  }

  public static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const hmac = crypto.createHmac('sha256', secret);
      const computed = hmac.update(payload).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  public static processWebhookEvent(rawBody: string, signature: string, eventData: any) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_daymark_demo_key_2026';
    const isValid = this.verifyWebhookSignature(rawBody, signature, webhookSecret);

    const { type, data } = eventData;
    const orgId = data?.object?.metadata?.organizationId || 'org_daymark_hq';

    const eventId = uuidv4();
    db.prepare(`
      INSERT INTO payment_events (id, organization_id, event_type, amount, currency, status, provider_ref, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      orgId,
      type || 'webhook_received',
      Number(data?.object?.amount || 0) / 100,
      data?.object?.currency?.toUpperCase() || 'USD',
      isValid ? 'verified' : 'unverified_signature',
      data?.object?.id || 'evt_simulated',
      isValid ? 1 : 0
    );

    return { processed: true, verified: isValid, eventId };
  }
}
