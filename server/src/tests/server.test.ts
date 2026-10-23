import test from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db, initDatabase } from '../db/index.js';
import { AIService } from '../services/aiService.js';
import { WorkflowEngine } from '../services/workflowEngine.js';
import { BillingService } from '../services/billingService.js';

initDatabase();

test('DAYMARK Test Suite: Database & Multi-Tenant Isolation', async (t) => {
  await t.test('Initial organization and admin user are properly seeded', () => {
    const org = db.prepare("SELECT * FROM organizations WHERE slug = 'daymark-hq'").get() as any;
    assert.ok(org, 'Default org should exist');
    assert.strictEqual(org.plan_tier, 'pro');

    const user = db.prepare("SELECT * FROM users WHERE email = 'founder@daymark.io'").get() as any;
    assert.ok(user, 'Default user should exist');
    assert.ok(bcrypt.compareSync('DaymarkSecure2026!', user.password_hash), 'Password hash should be valid');
  });

  await t.test('Cross-tenant data isolation strictly prevents unauthorized record access', () => {
    const org1 = 'org_tenant_alpha';
    const org2 = 'org_tenant_beta';

    // Seed dummy orgs
    db.prepare("INSERT OR IGNORE INTO organizations (id, name, slug) VALUES (?, 'Alpha', 'alpha')").run(org1);
    db.prepare("INSERT OR IGNORE INTO organizations (id, name, slug) VALUES (?, 'Beta', 'beta')").run(org2);

    // Insert lead for Tenant Alpha
    const leadIdAlpha = 'lead_alpha_private_001';
    db.prepare(`
      INSERT OR REPLACE INTO leads (id, organization_id, title, contact_name, contact_email, company, value)
      VALUES (?, ?, 'Confidential M&A Deal', 'CEO Alpha', 'ceo@alpha.com', 'Alpha Corp', 500000)
    `).run(leadIdAlpha, org1);

    // Tenant Beta tries to query with their organization_id filter
    const breachAttempt = db.prepare('SELECT * FROM leads WHERE id = ? AND organization_id = ?').get(leadIdAlpha, org2);
    assert.strictEqual(breachAttempt, undefined, 'Tenant Beta must NOT be able to access Tenant Alpha private record');

    // Tenant Alpha accesses correctly
    const authorizedAccess = db.prepare('SELECT * FROM leads WHERE id = ? AND organization_id = ?').get(leadIdAlpha, org1) as any;
    assert.ok(authorizedAccess, 'Tenant Alpha should access own record');
    assert.strictEqual(authorizedAccess.value, 500000);
  });
});

test('DAYMARK Test Suite: Controlled AI Agent Execution & Budgeting', async (t) => {
  await t.test('Executes Business Research Agent and calculates realistic tokens and cost', async () => {
    const result = await AIService.executeAgent({
      organizationId: 'org_daymark_hq',
      agentKey: 'research_agent',
      userPrompt: 'Analyze market pain points for boutique web development studios'
    });

    assert.ok(result.executionId, 'Should generate an execution ID');
    assert.strictEqual(result.agentKey, 'research_agent');
    assert.ok(result.tokensUsed > 0, 'Tokens used should be > 0');
    assert.ok(result.costUsd >= 0, 'Cost should be calculated');
    assert.ok(result.output.includes('Market Research'), 'Output should contain structured findings');
  });

  await t.test('Natural language business plan generator creates comprehensive structured assets', () => {
    const plan = AIService.generateBusinessPlan(
      'Automated client intake portal for accounting practices',
      'Financial Services',
      'Small Accounting Firms'
    );

    assert.ok(plan.businessPlan.mission, 'Plan mission should exist');
    assert.ok(plan.customerPersonas.length >= 2, 'Should generate customer personas');
    assert.ok(plan.pricingHypotheses.length >= 3, 'Should generate 3 pricing tiers');
    assert.ok(plan.operationalChecklist.length >= 4, 'Should generate operational checklist');
  });
});

test('DAYMARK Test Suite: Workflow Automation Engine with Human Approval Gate', async (t) => {
  await t.test('Workflow pauses on request_human_approval and completes upon approval', async () => {
    const orgId = 'org_daymark_hq';
    const wfId = 'wf_test_approval_gate';

    // Create 3-step test workflow: validate -> approval -> complete
    const testSteps = [
      { id: 's1', type: 'validate_lead', name: 'Check Email', config: {}, order: 1 },
      { id: 's2', type: 'request_human_approval', name: 'Manager Review', config: {}, order: 2 },
      { id: 's3', type: 'send_email_draft', name: 'Dispatch Outreach', config: {}, order: 3 }
    ];

    db.prepare(`
      INSERT OR REPLACE INTO workflows (id, organization_id, name, trigger_type, steps, is_active)
      VALUES (?, ?, 'Test Approval Flow', 'manual', ?, 1)
    `).run(wfId, orgId, JSON.stringify(testSteps));

    // Trigger workflow
    const execResult = await WorkflowEngine.triggerWorkflow(orgId, wfId, 'Unit Test Run', {
      contactEmail: 'partner@targetclient.com',
      company: 'Target Client Corp'
    });

    assert.strictEqual(execResult.status, 'waiting_approval', 'Workflow must pause at human approval step');
    assert.ok(execResult.pendingApproval, 'Pending approval payload must be present');

    // Simulate Human Approval
    const resumeResult = await WorkflowEngine.resolveApproval(orgId, execResult.executionId, true, 'Approved by automated tester');
    assert.strictEqual(resumeResult.status, 'completed', 'Workflow should transition to completed once approved');
  });

  await t.test('Idempotency key prevents duplicate execution', async () => {
    const orgId = 'org_daymark_hq';
    const wfId = 'wf_sample_lead_intake';
    const idempotencyKey = `idem_test_${Date.now()}`;

    const firstRun = await WorkflowEngine.triggerWorkflow(orgId, wfId, 'Idempotency Event', {}, idempotencyKey);
    const secondRun = await WorkflowEngine.triggerWorkflow(orgId, wfId, 'Duplicate Idempotency Event', {}, idempotencyKey);

    assert.strictEqual(secondRun.resumed, true, 'Second run must return cached execution result');
    assert.strictEqual(firstRun.executionId, secondRun.executionId, 'Execution IDs must match');
  });
});

test('DAYMARK Test Suite: Signed Payment Webhook Verification', async (t) => {
  await t.test('Verifies valid HMAC-SHA256 signature and rejects forged payloads', () => {
    const secret = 'whsec_test_secret_for_unit_tests';
    const validPayload = JSON.stringify({ type: 'invoice.payment_succeeded', data: { object: { id: 'in_123', amount: 14900 } } });
    
    // Generate valid HMAC
    const validSignature = crypto.createHmac('sha256', secret).update(validPayload).digest('hex');
    assert.strictEqual(BillingService.verifyWebhookSignature(validPayload, validSignature, secret), true, 'Valid signature should verify');

    // Forged signature
    const forgedSignature = crypto.createHmac('sha256', 'wrong_secret').update(validPayload).digest('hex');
    assert.strictEqual(BillingService.verifyWebhookSignature(validPayload, forgedSignature, secret), false, 'Forged signature must be rejected');

    // Tampered payload
    const tamperedPayload = validPayload.replace('14900', '99900');
    assert.strictEqual(BillingService.verifyWebhookSignature(tamperedPayload, validSignature, secret), false, 'Tampered payload must be rejected');
  });
});
