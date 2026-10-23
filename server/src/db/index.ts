import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'daymark.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys for high performance and durability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    -- Organizations (Tenants)
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      plan_tier TEXT NOT NULL DEFAULT 'starter',
      subscription_status TEXT NOT NULL DEFAULT 'active',
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Memberships
    CREATE TABLE IF NOT EXISTS organization_members (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, user_id)
    );

    -- Opportunities (DAYMARK Engine)
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      industry TEXT NOT NULL,
      target_segment TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      solution_hypothesis TEXT NOT NULL,
      market_size_arr REAL NOT NULL DEFAULT 0,
      confidence_score REAL NOT NULL DEFAULT 70,
      feasibility_score REAL NOT NULL DEFAULT 75,
      willingness_to_pay_score REAL NOT NULL DEFAULT 80,
      composite_score REAL NOT NULL DEFAULT 75,
      status TEXT NOT NULL DEFAULT 'hypothesized', -- hypothesized, validating, confirmed, archived
      validation_notes TEXT,
      risks TEXT,
      interview_guide TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Business Projects (AI Business Builder)
    CREATE TABLE IF NOT EXISTS business_projects (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      industry TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      generated_assets TEXT NOT NULL, -- JSON blob of plan, personas, positioning, landing page, etc.
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- CRM Contacts
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      title TEXT,
      stage TEXT NOT NULL DEFAULT 'lead',
      lead_score INTEGER NOT NULL DEFAULT 50,
      tags TEXT, -- JSON array of tags
      source TEXT NOT NULL DEFAULT 'Website inbound',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- CRM Leads / Deals
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      company TEXT NOT NULL,
      value REAL NOT NULL DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'new', -- new, qualified, proposal, negotiation, won, lost
      probability INTEGER NOT NULL DEFAULT 20,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- CRM Tasks
    CREATE TABLE IF NOT EXISTS crm_tasks (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
      priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
      related_to TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Workflow Definitions
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      trigger_type TEXT NOT NULL, -- manual, crm_lead_created, opportunity_discovered, schedule, webhook
      trigger_config TEXT, -- JSON
      steps TEXT NOT NULL, -- JSON array of steps
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Workflow Executions
    CREATE TABLE IF NOT EXISTS workflow_executions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
      trigger_event TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running', -- running, waiting_approval, completed, failed
      step_results TEXT NOT NULL DEFAULT '[]', -- JSON array of step execution outputs
      pending_approval TEXT, -- JSON approval payload if paused
      idempotency_key TEXT UNIQUE,
      started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      error TEXT
    );

    -- AI Agents Config
    CREATE TABLE IF NOT EXISTS ai_agents (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      permissions TEXT NOT NULL, -- JSON
      status TEXT NOT NULL DEFAULT 'active',
      execution_count INTEGER NOT NULL DEFAULT 0,
      cost_spent REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Agent Executions
    CREATE TABLE IF NOT EXISTS agent_executions (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
      user_prompt TEXT NOT NULL,
      reasoning TEXT NOT NULL,
      tool_calls TEXT NOT NULL DEFAULT '[]',
      output TEXT NOT NULL,
      tokens_used INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Global Connect Companies
    CREATE TABLE IF NOT EXISTS global_companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      region TEXT NOT NULL,
      country TEXT NOT NULL,
      size TEXT NOT NULL,
      relevance_score INTEGER NOT NULL DEFAULT 85,
      verified INTEGER NOT NULL DEFAULT 1,
      partnership_type TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      website TEXT NOT NULL,
      outreach_status TEXT NOT NULL DEFAULT 'uncontacted',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Subscriptions
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      organization_id TEXT UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      plan_tier TEXT NOT NULL DEFAULT 'starter',
      status TEXT NOT NULL DEFAULT 'active',
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      current_period_end TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Usage Records
    CREATE TABLE IF NOT EXISTS usage_records (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      metric TEXT NOT NULL, -- workflow_runs, ai_tokens, crm_contacts, projects
      count INTEGER NOT NULL DEFAULT 0,
      period TEXT NOT NULL, -- YYYY-MM
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, metric, period)
    );

    -- Payment Events
    CREATE TABLE IF NOT EXISTS payment_events (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'success',
      provider_ref TEXT,
      verified INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, alert
      is_read INTEGER NOT NULL DEFAULT 0,
      action_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id TEXT,
      user_email TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Marketplace Listings
    CREATE TABLE IF NOT EXISTS marketplace_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      author TEXT NOT NULL,
      installs INTEGER NOT NULL DEFAULT 120,
      rating REAL NOT NULL DEFAULT 4.9,
      price TEXT NOT NULL DEFAULT 'Free',
      manifest TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      is_installed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for high performance and tenant isolation
    CREATE INDEX IF NOT EXISTS idx_members_org ON organization_members(organization_id);
    CREATE INDEX IF NOT EXISTS idx_members_user ON organization_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_opportunities_org ON opportunities(organization_id);
    CREATE INDEX IF NOT EXISTS idx_projects_org ON business_projects(organization_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
    CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_org ON crm_tasks(organization_id);
    CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);
    CREATE INDEX IF NOT EXISTS idx_executions_org ON workflow_executions(organization_id);
    CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organization_id);
  `);

  seedInitialData();
}

function seedInitialData() {
  const existingOrg = db.prepare('SELECT id FROM organizations LIMIT 1').get();
  if (existingOrg) return;

  console.log('[DB] Seeding initial database with sample organization and demo data...');
  const orgId = 'org_daymark_hq';
  const userId = 'usr_founder_01';
  const hashedPw = bcrypt.hashSync('DaymarkSecure2026!', 10);

  // Default Org & User
  db.prepare(`
    INSERT INTO organizations (id, name, slug, plan_tier, subscription_status)
    VALUES (?, ?, ?, ?, ?)
  `).run(orgId, 'Daymark Automations Inc.', 'daymark-hq', 'pro', 'active');

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, avatar)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, 'founder@daymark.io', hashedPw, 'Arun (Founder)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  db.prepare(`
    INSERT INTO organization_members (id, organization_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), orgId, userId, 'owner');

  db.prepare(`
    INSERT INTO subscriptions (id, organization_id, plan_tier, status, billing_cycle, current_period_end)
    VALUES (?, ?, ?, ?, ?, datetime('now', '+30 days'))
  `).run(uuidv4(), orgId, 'pro', 'active', 'monthly');

  // Seed 6 Core AI Agents
  const agents = [
    { key: 'research_agent', name: 'Business Research Agent', role: 'Analyzes target markets, competitive positioning, and customer pain points.', permissions: JSON.stringify(['web_search', 'extract_data', 'draft_report']) },
    { key: 'marketing_assistant', name: 'Marketing Assistant', role: 'Generates high-converting copy, email campaigns, and positioning frameworks.', permissions: JSON.stringify(['draft_campaigns', 'landing_page_gen', 'seo_metadata']) },
    { key: 'sales_assistant', name: 'Sales Assistant', role: 'Qualifies incoming leads, drafts personalized proposals, and predicts deal probability.', permissions: JSON.stringify(['crm_read', 'crm_update', 'draft_email']) },
    { key: 'support_assistant', name: 'Customer Support Assistant', role: 'Drafts responses to customer inquiries with SLA priority scoring.', permissions: JSON.stringify(['faq_lookup', 'ticket_triage', 'draft_reply']) },
    { key: 'operations_assistant', name: 'Operations Assistant', role: 'Audits workflow bottlenecks and optimizes resource utilization.', permissions: JSON.stringify(['workflow_audit', 'task_creation']) },
    { key: 'analytics_assistant', name: 'Business Analytics Assistant', role: 'Models MRR forecasting, churn rates, and unit economics.', permissions: JSON.stringify(['revenue_query', 'export_financials']) }
  ];

  for (const ag of agents) {
    db.prepare(`
      INSERT INTO ai_agents (id, organization_id, key, name, role, permissions, execution_count, cost_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), orgId, ag.key, ag.name, ag.role, ag.permissions, Math.floor(Math.random() * 20) + 5, Number((Math.random() * 4 + 1).toFixed(2)));
  }

  // Seed Opportunities in DAYMARK Engine
  const opps = [
    {
      id: uuidv4(),
      title: 'AI Workflow Automation for Boutique Marketing Agencies',
      industry: 'B2B Professional Services',
      target_segment: 'Independent digital marketing agencies (5-25 staff)',
      problem_statement: 'Agencies spend 25+ hours/week manually consolidating campaign data and sending onboarding client intake forms.',
      solution_hypothesis: 'Unified intake-to-report pipeline automating CRM updates, proposal drafting, and client approval tracking.',
      market_size_arr: 450000000,
      confidence_score: 92,
      feasibility_score: 88,
      willingness_to_pay_score: 90,
      composite_score: 90.2,
      status: 'confirmed',
      validation_notes: 'Spoke with 14 agency owners; 12 confirmed willing to pay $199-$399/mo for automated intake and approval workflows.',
      risks: 'Client portal adoption friction; email spam filter triggers on cold proposals.'
    },
    {
      id: uuidv4(),
      title: 'Automated Compliance & Invoice Processing for Logistics Brokers',
      industry: 'Freight & Logistics',
      target_segment: 'Regional freight forwarders handling >200 bills of lading/month',
      problem_statement: 'Carriers submit heterogeneous invoice formats leading to 4-day invoice reconciliation delays and late payment fines.',
      solution_hypothesis: 'Document extraction engine paired with automated exception approval workflow.',
      market_size_arr: 820000000,
      confidence_score: 78,
      feasibility_score: 82,
      willingness_to_pay_score: 85,
      composite_score: 81.4,
      status: 'validating',
      validation_notes: 'Benchmarking 3 logistics partners in Chicago and Rotterdam.',
      risks: 'OCR parsing edge cases on handwritten or faded bill-of-lading scans.'
    }
  ];

  for (const op of opps) {
    db.prepare(`
      INSERT INTO opportunities (id, organization_id, title, industry, target_segment, problem_statement, solution_hypothesis, market_size_arr, confidence_score, feasibility_score, willingness_to_pay_score, composite_score, status, validation_notes, risks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(op.id, orgId, op.title, op.industry, op.target_segment, op.problem_statement, op.solution_hypothesis, op.market_size_arr, op.confidence_score, op.feasibility_score, op.willingness_to_pay_score, op.composite_score, op.status, op.validation_notes, op.risks);
  }

  // Seed CRM Contacts
  const contacts = [
    { first: 'Elena', last: 'Rostova', email: 'elena@novapulse.io', company: 'NovaPulse Agency', title: 'Managing Director', stage: 'qualified', score: 88, tags: JSON.stringify(['Agency', 'High-Intent', 'Pilot']), source: 'Inbound referral' },
    { first: 'Marcus', last: 'Vance', email: 'marcus@hypergrowth.co', company: 'HyperGrowth Media', title: 'Head of Operations', stage: 'proposal', score: 94, tags: JSON.stringify(['Enterprise', 'Contract Review']), source: 'LinkedIn discovery' },
    { first: 'Siddharth', last: 'Mehta', email: 'sid@apextechlabs.com', company: 'Apex Tech Labs', title: 'Founder & CEO', stage: 'negotiation', score: 91, tags: JSON.stringify(['Tier 1', 'Fast Track']), source: 'Global Connect' },
    { first: 'Claire', last: 'Dupont', email: 'claire@lumina-studio.fr', company: 'Lumina Creative', title: 'Creative Partner', stage: 'lead', score: 65, tags: JSON.stringify(['SME', 'Creative']), source: 'Product Hunt' }
  ];

  for (const c of contacts) {
    db.prepare(`
      INSERT INTO contacts (id, organization_id, first_name, last_name, email, company, title, stage, lead_score, tags, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), orgId, c.first, c.last, c.email, c.company, c.title, c.stage, c.score, c.tags, c.source);
  }

  // Seed Deals/Leads
  const leads = [
    { title: 'NovaPulse Annual Automation License', contact: 'Elena Rostova', email: 'elena@novapulse.io', company: 'NovaPulse Agency', value: 4800, stage: 'qualified', prob: 60 },
    { title: 'HyperGrowth 20-Seat Team Deployment', contact: 'Marcus Vance', email: 'marcus@hypergrowth.co', company: 'HyperGrowth Media', value: 9600, stage: 'proposal', prob: 75 },
    { title: 'Apex Custom Agent Orchestration', contact: 'Siddharth Mehta', email: 'sid@apextechlabs.com', company: 'Apex Tech Labs', value: 14400, stage: 'negotiation', prob: 85 },
    { title: 'Lumina Starter Expansion', contact: 'Claire Dupont', email: 'claire@lumina-studio.fr', company: 'Lumina Creative', value: 1200, stage: 'new', prob: 30 }
  ];

  for (const l of leads) {
    db.prepare(`
      INSERT INTO leads (id, organization_id, title, contact_name, contact_email, company, value, stage, probability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), orgId, l.title, l.contact, l.email, l.company, l.value, l.stage, l.prob);
  }

  // Seed Workflows
  const sampleWorkflowId = 'wf_sample_lead_intake';
  const sampleSteps = [
    { id: 's1', type: 'validate_lead', name: 'Validate Contact & Enrichment', config: { checkEmail: true, minScore: 50 }, order: 1 },
    { id: 's2', type: 'generate_ai_summary', name: 'AI Opportunity Scoping', config: { model: 'daymark-fast', includeCompetitors: true }, order: 2 },
    { id: 's3', type: 'request_human_approval', name: 'Review Proposal Draft Before Send', config: { channel: 'dashboard', timeoutHours: 24 }, order: 3 },
    { id: 's4', type: 'send_email_draft', name: 'Send Verified Outreach to Client', config: { template: 'agency_welcome' }, order: 4 },
    { id: 's5', type: 'update_crm_stage', name: 'Progress CRM Stage to Proposal', config: { targetStage: 'proposal' }, order: 5 }
  ];

  db.prepare(`
    INSERT INTO workflows (id, organization_id, name, description, trigger_type, trigger_config, steps, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sampleWorkflowId,
    orgId,
    'High-Priority Inbound Lead Triage & Personalized Outreach',
    'Validates incoming leads, scores company fit, drafts an executive proposal, requires founder approval, and dispatches email.',
    'crm_lead_created',
    JSON.stringify({ minDealValue: 1000 }),
    JSON.stringify(sampleSteps),
    1
  );

  // Seed Workflow Execution
  db.prepare(`
    INSERT INTO workflow_executions (id, organization_id, workflow_id, trigger_event, status, step_results, pending_approval, idempotency_key, started_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'), datetime('now', '-1 hours'))
  `).run(
    uuidv4(),
    orgId,
    sampleWorkflowId,
    'New Lead: HyperGrowth Media ($9,600)',
    'completed',
    JSON.stringify([
      { stepId: 's1', name: 'Validate Contact & Enrichment', status: 'success', output: 'Enriched domain hypergrowth.co (24 employees, $3.2M ARR)' },
      { stepId: 's2', name: 'AI Opportunity Scoping', status: 'success', output: 'Identified bottleneck in client onboarding approval cycles.' },
      { stepId: 's3', name: 'Review Proposal Draft Before Send', status: 'success', output: 'Approved by Arun (Founder) at 2026-10-23 15:30 UTC' },
      { stepId: 's4', name: 'Send Verified Outreach to Client', status: 'success', output: 'Email dispatched via SMTP (Message ID: #msg-98214)' },
      { stepId: 's5', name: 'Progress CRM Stage to Proposal', status: 'success', output: 'Lead stage moved to PROPOSAL' }
    ]),
    null,
    'idem_seed_exec_01'
  );

  // Seed Global Directory Companies
  const globalCorps = [
    { name: 'Klaro Systems UK', industry: 'Enterprise SaaS', region: 'Europe', country: 'United Kingdom', size: '50-100', relevance: 94, type: 'Solution Partner', email: 'alliances@klaro.co.uk', website: 'https://klaro.co.uk' },
    { name: 'Aether Logistics Singapore', industry: 'Supply Chain Tech', region: 'Asia Pacific', country: 'Singapore', size: '100-250', relevance: 89, type: 'Enterprise Buyer', email: 'procurement@aetherlogistics.sg', website: 'https://aetherlogistics.sg' },
    { name: 'Starlight Digital Sydney', industry: 'Growth Agency', region: 'Australia/NZ', country: 'Australia', size: '20-50', relevance: 96, type: 'Agency Reseller', email: 'partners@starlightdigital.com.au', website: 'https://starlightdigital.com.au' },
    { name: 'Nexus Nordic FinTech', industry: 'Financial Software', region: 'Nordics', country: 'Sweden', size: '25-50', relevance: 88, type: 'Technology Integrator', email: 'connect@nexusnordic.se', website: 'https://nexusnordic.se' },
    { name: 'Vanguard Media Toronto', industry: 'Creative Agency', region: 'North America', country: 'Canada', size: '15-30', relevance: 92, type: 'Pilot Customer', email: 'operations@vanguardmedia.ca', website: 'https://vanguardmedia.ca' }
  ];

  for (const gc of globalCorps) {
    db.prepare(`
      INSERT INTO global_companies (id, name, industry, region, country, size, relevance_score, verified, partnership_type, contact_email, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), gc.name, gc.industry, gc.region, gc.country, gc.size, gc.relevance, 1, gc.type, gc.email, gc.website);
  }

  // Seed Marketplace Blueprints
  const marketplaceItems = [
    {
      id: 'mp_agency_fastpack',
      title: 'B2B Agency Client Onboarding & Proposal Agent',
      category: 'Agency Operations',
      description: 'End-to-end client intake, scope auto-drafting, contract approval gate, and automated Slack/Email handoff.',
      author: 'Daymark Core Labs',
      installs: 412,
      rating: 4.95,
      price: 'Included in Pro',
      manifest: JSON.stringify({ version: '1.2.0', requiredPermissions: ['crm_write', 'email_send', 'approval_gate'] })
    },
    {
      id: 'mp_churn_guardian',
      title: 'Customer Churn Prevention & Health Sentinel',
      category: 'Customer Success',
      description: 'Detects inactivity across client workspaces, calculates churn risk score, and alerts account managers with tailored retention offers.',
      author: 'RevOps Collective',
      installs: 289,
      rating: 4.88,
      price: 'Included in Starter',
      manifest: JSON.stringify({ version: '1.0.4', requiredPermissions: ['analytics_read', 'notification_send'] })
    },
    {
      id: 'mp_competitive_intel',
      title: 'Autonomous Competitor Pricing & Feature Spy',
      category: 'Market Intelligence',
      description: 'Tracks pricing changes, job postings, and feature announcements across top 10 competitors and generates weekly executive briefs.',
      author: 'DAYMARK Strategy Group',
      installs: 350,
      rating: 4.92,
      price: 'Included in Pro',
      manifest: JSON.stringify({ version: '2.0.1', requiredPermissions: ['web_search', 'report_export'] })
    }
  ];

  for (const mp of marketplaceItems) {
    db.prepare(`
      INSERT INTO marketplace_items (id, title, category, description, author, installs, rating, price, manifest, verified, is_installed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(mp.id, mp.title, mp.category, mp.description, mp.author, mp.installs, mp.rating, mp.price, mp.manifest, 1, 1);
  }

  // Seed Initial Audit Logs
  db.prepare(`
    INSERT INTO audit_logs (id, organization_id, user_id, user_email, action, resource_type, resource_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), orgId, userId, 'founder@daymark.io', 'ORGANIZATION_INITIALIZED', 'organization', orgId, 'Daymark Automations workspace provisioned with initial Pro plan.', '127.0.0.1');

  // Seed Notifications
  db.prepare(`
    INSERT INTO notifications (id, organization_id, user_id, title, message, type, action_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), orgId, userId, 'Welcome to DAYMARK OS', 'Your AI business automation environment is active with all 8 operational modules ready.', 'success', '/app/dashboard');

  console.log('[DB] Seeding completed successfully.');
}
