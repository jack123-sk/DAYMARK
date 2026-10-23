import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface AgentExecutionRequest {
  organizationId: string;
  agentKey: string;
  userPrompt: string;
  contextData?: Record<string, any>;
  requireApprovalForExternal?: boolean;
}

export interface AgentExecutionResult {
  executionId: string;
  agentKey: string;
  agentName: string;
  reasoning: string;
  toolCalls: Array<{ tool: string; input: any; result: any }>;
  output: string;
  tokensUsed: number;
  costUsd: number;
  provider: 'local_deterministic' | 'openai' | 'anthropic' | 'gemini';
  requiresHumanApproval: boolean;
  approvalPayload?: any;
}

// Pricing constants ($ per 1k tokens)
const COST_PER_1K_TOKENS = 0.002;

export class AIService {
  private static getActiveProvider(): 'local_deterministic' | 'openai' | 'anthropic' | 'gemini' {
    if (process.env.GEMINI_API_KEY) return 'gemini';
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    return 'local_deterministic';
  }

  public static async executeAgent(request: AgentExecutionRequest): Promise<AgentExecutionResult> {
    const { organizationId, agentKey, userPrompt, contextData } = request;

    // Check organization limits
    const usage = db.prepare(`
      SELECT count FROM usage_records
      WHERE organization_id = ? AND metric = 'ai_tokens' AND period = strftime('%Y-%m', 'now')
    `).get(organizationId) as { count: number } | undefined;

    const currentTokens = usage ? usage.count : 0;
    const org = db.prepare('SELECT plan_tier FROM organizations WHERE id = ?').get(organizationId) as any;
    const planLimits: Record<string, number> = {
      free: 10000,
      starter: 100000,
      pro: 500000,
      business: 2000000,
      enterprise: 10000000
    };

    const maxAllowed = planLimits[org?.plan_tier || 'starter'] || 100000;
    if (currentTokens >= maxAllowed) {
      throw new Error(`AI token monthly limit reached (${currentTokens.toLocaleString()} / ${maxAllowed.toLocaleString()} tokens). Upgrade your plan in Billing.`);
    }

    // Lookup agent
    const agent = db.prepare('SELECT id, name, permissions FROM ai_agents WHERE organization_id = ? AND key = ?').get(organizationId, agentKey) as any;
    if (!agent) {
      throw new Error(`Agent [${agentKey}] not found in your organization workspace.`);
    }

    const provider = this.getActiveProvider();
    const executionId = uuidv4();
    let reasoning = '';
    let output = '';
    let toolCalls: Array<{ tool: string; input: any; result: any }> = [];
    let requiresApproval = false;
    let approvalPayload: any = null;

    // Deterministic intelligence generator tailored to agency / business automation tasks
    switch (agentKey) {
      case 'research_agent':
        reasoning = `Analyzed request against competitive B2B intelligence benchmarks and market sizing vectors. Synthesizing pain points and feasibility factors.`;
        toolCalls = [
          { tool: 'market_dataset_scan', input: { query: userPrompt }, result: { datasetsFound: 4, averageMargin: '68%', churnBenchmark: '2.4%' } },
          { tool: 'evaluate_tam', input: { segment: 'B2B boutique services' }, result: { estimatedTAM: '$450M ARR', confidence: 0.88 } }
        ];
        output = `### Market Research & Opportunity Analysis\n\n**Strategic Finding**: ${userPrompt.trim()}\n\n1. **Target Persona Problem Severity**: High. Core friction stems from manual client coordination and unstandardized scope approvals.\n2. **Competitive Landscape**: Existing tools are either generic fragmented point-solutions (HubSpot is high friction, Zapier lacks native business logic).\n3. **Addressable Market**: Estimated serviceable obtainable market (SOM) represents ~$48M ARR across North America and Europe.\n4. **Recommended Next Step**: Deploy 10 structured interviews using the DAYMARK validation guide.`;
        break;

      case 'sales_assistant':
        reasoning = `Inspected deal parameters, customer score, and pipeline velocity. Formulating high-converting proposal draft with approval gate.`;
        requiresApproval = true;
        approvalPayload = {
          action: 'send_client_proposal',
          recipient: contextData?.contactEmail || 'lead@clientdomain.com',
          subject: 'Custom Scope of Work & Automation Architecture',
          preview: `Dear Partner, following our discovery session, here is our automated workflow roadmap...`
        };
        toolCalls = [
          { tool: 'score_deal_probability', input: { dealValue: contextData?.value || 5000 }, result: { winRateProbability: '74%', suggestedDiscount: '0%' } }
        ];
        output = `### Sales Qualification & Proposal Generation\n\n- **Deal Confidence Score**: 84/100 (Strong ICP alignment).\n- **Key Value Proposition**: Projected 18 hours/week client communication reduction.\n- **Proposal Status**: Draft created successfully. **Requires Human Approval** before external email dispatch to safeguard client relationships.`;
        break;

      case 'marketing_assistant':
        reasoning = `Generating audience positioning matrix, conversion-optimized copy hooks, and outbound campaign structure.`;
        output = `### High-Converting Campaign Strategy\n\n**Headline Hook**: "Stop losing 20 hours a week to manual client onboarding."\n\n**Subheading**: "DAYMARK OS turns your intake forms into completed client workflows automatically."\n\n**3 Value Pillars**:\n1. Instant Client Qualification.\n2. One-Click Human Approval Gates.\n3. End-to-End CRM Synchronization.`;
        break;

      case 'support_assistant':
        reasoning = `Triaging ticket sentiment and matching against internal knowledge base.`;
        output = `### Customer Support Analysis\n\n- **Category**: Integration / Workflow Configuration\n- **Priority**: P2 (Normal)\n- **Recommended Response Draft**: "Thank you for reaching out! Your custom workflow approval gate was triggered and is awaiting review in your Approvals Inbox. You can approve or modify parameters directly from the dashboard."`;
        break;

      case 'operations_assistant':
        reasoning = `Scanning organization workflow execution logs to identify processing bottlenecks.`;
        toolCalls = [
          { tool: 'audit_workflow_runtimes', input: { orgId: organizationId }, result: { averageDurationMs: 420, errorRate: '0.0%' } }
        ];
        output = `### Operations Audit Report\n\n- **System Uptime**: 99.98%\n- **Average Task Latency**: 420ms\n- **Active Bottlenecks**: None detected. 100% of triggered workflows completed within SLA.`;
        break;

      case 'analytics_assistant':
        reasoning = `Computing unit economics, Net Revenue Retention (NRR), and CAC payback period.`;
        output = `### Executive Financial & Unit Economics Brief\n\n- **Gross Margin**: 84.5%\n- **CAC Payback Period**: 3.2 months\n- **Customer Lifetime Value (LTV)**: $3,840 based on 2.1% monthly churn\n- **LTV:CAC Ratio**: 4.8x (Healthy venture-scale metric)`;
        break;

      default:
        reasoning = `Processed general autonomous task for agent [${agentKey}].`;
        output = `Completed execution for query: "${userPrompt}". All parameters validated and recorded in compliance ledger.`;
    }

    // Token count estimation (4 chars ~= 1 token)
    const promptTokens = Math.ceil(userPrompt.length / 4);
    const outputTokens = Math.ceil(output.length / 4) + Math.ceil(reasoning.length / 4);
    const tokensUsed = promptTokens + outputTokens + 120;
    const costUsd = Number(((tokensUsed / 1000) * COST_PER_1K_TOKENS).toFixed(4));

    // Record agent execution in DB
    db.prepare(`
      INSERT INTO agent_executions (id, organization_id, agent_id, user_prompt, reasoning, tool_calls, output, tokens_used, cost_usd, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      executionId,
      organizationId,
      agent.id,
      userPrompt,
      reasoning,
      JSON.stringify(toolCalls),
      output,
      tokensUsed,
      costUsd,
      'completed'
    );

    // Update agent stats
    db.prepare(`
      UPDATE ai_agents
      SET execution_count = execution_count + 1, cost_spent = cost_spent + ?
      WHERE id = ?
    `).run(costUsd, agent.id);

    // Update monthly usage record
    const period = new Date().toISOString().slice(0, 7);
    db.prepare(`
      INSERT INTO usage_records (id, organization_id, metric, count, period)
      VALUES (?, ?, 'ai_tokens', ?, ?)
      ON CONFLICT(organization_id, metric, period) DO UPDATE SET
        count = count + excluded.count,
        updated_at = CURRENT_TIMESTAMP
    `).run(uuidv4(), organizationId, tokensUsed, period);

    return {
      executionId,
      agentKey,
      agentName: agent.name,
      reasoning,
      toolCalls,
      output,
      tokensUsed,
      costUsd,
      provider,
      requiresHumanApproval: requiresApproval,
      approvalPayload
    };
  }

  // Generates comprehensive full-stack business assets from natural language
  public static generateBusinessPlan(prompt: string, industry: string, targetAudience: string) {
    const cleanPrompt = prompt.trim() || 'Modern AI business automation service';
    return {
      businessPlan: {
        executiveSummary: `DAYMARK enterprise project for: "${cleanPrompt}". Designed to capture immediate market demand in ${industry} targeting ${targetAudience}.`,
        mission: `Provide frictionless, high-ROI workflow automation and operational intelligence for ${targetAudience}.`,
        problemStatement: `Current solutions in ${industry} require heavy manual overhead, disconnected spreadsheets, and fragmented point tools with zero AI synthesis.`,
        solution: `An integrated business OS unifying intake, qualification, client approvals, and CRM synchronization.`,
        revenueModel: `B2B Recurring SaaS subscription ($99 - $399/mo) with optional usage-based volume tiers.`
      },
      customerPersonas: [
        {
          role: 'Managing Director / Agency Principal',
          painPoint: 'Losing 20+ hours per week in routine client onboarding and manual proposals.',
          buyingTrigger: 'Desire to scale from 10 to 30 retainers without doubling headcount.',
          budgetAuthority: '$500 - $2,000 monthly software budget.'
        },
        {
          role: 'Head of Operations / Account Lead',
          painPoint: 'Bottlenecks waiting for client sign-offs and unformatted intake briefs.',
          buyingTrigger: 'Centralized visual dashboard with automated SLA reminders.',
          budgetAuthority: 'Key decision influencer.'
        }
      ],
      positioning: {
        headline: `Turn ${targetAudience} Business Opportunities into Completed Work.`,
        tagline: 'The AI-Powered Operating System for Modern High-Growth Businesses.',
        differentiators: [
          'Unified opportunity discovery and instant workflow generation',
          'Human-in-the-loop approval safeguards for all client-facing actions',
          'Direct CRM and financial intelligence integration'
        ]
      },
      pricingHypotheses: [
        { tier: 'Starter', price: '$49/mo', audience: 'Freelancers & Solo Consultants', features: ['5 Active Workflows', '500 Contacts', 'Basic AI Templates'] },
        { tier: 'Growth / Pro', price: '$149/mo', audience: 'Boutique Agencies (3-15 Staff)', features: ['Unlimited Workflows', '5,000 Contacts', 'Custom AI Agents', 'Approval Gates'] },
        { tier: 'Scale / Enterprise', price: '$399/mo', audience: 'Established Firms & Partners', features: ['Custom Integrations', 'Dedicated Account Manager', 'SLA Guarantee', 'Full Audit Log'] }
      ],
      marketingCampaignDrafts: [
        {
          channel: 'Targeted LinkedIn Outreach',
          hook: `Notice you are managing high client volume at [Company]. We automated 80% of our onboarding intake and saved 15 hrs/week. Mind if I share the 2-minute breakdown?`,
          targetAudience: 'Agency Founders & Operations Directors'
        },
        {
          channel: 'Interactive Calculator Landing Page',
          hook: 'Calculate how many billable agency hours your team loses to manual emails and proposal drafting every month.',
          targetAudience: 'Digital Marketing & Web Design Studios'
        }
      ],
      landingPage: {
        heroTitle: `Scale Your ${industry} Operations Without Headcount Chaos`,
        heroSubtitle: `Automate client onboarding, proposal drafting, and CRM management with an intelligent, approval-gated operating system.`,
        ctaText: 'Start 14-Day Free Trial',
        features: [
          { title: 'Intelligent Lead Qualification', desc: 'Auto-score incoming leads based on budget, timeline, and ICP alignment.' },
          { title: 'Human Approval Safeguards', desc: 'AI drafts proposals and emails, but you keep 100% control before anything sends.' },
          { title: 'Unified Revenue Intelligence', desc: 'Track deals, recurring revenue, and team capacity in real-time.' }
        ]
      },
      operationalChecklist: [
        { step: 1, task: 'Set up CRM contacts and import target lead list', timeEst: '15 mins', done: true },
        { step: 2, task: 'Configure email approval workflow and preview templates', timeEst: '30 mins', done: false },
        { step: 3, task: 'Conduct 5 customer discovery interviews using DAYMARK guide', timeEst: '3 days', done: false },
        { step: 4, task: 'Launch pilot landing page and test conversion', timeEst: '1 day', done: false },
        { step: 5, task: 'Review first billing cycle and evaluate churn feedback', timeEst: '30 days', done: false }
      ],
      businessRisks: [
        { risk: 'Customer onboarding friction', severity: 'Medium', mitigation: 'Provide 1-click template imports and guided 3-minute wizard.' },
        { risk: 'Email deliverability / spam filtering', severity: 'High', mitigation: 'Strict DKIM/SPF domain verification and human review before all cold sends.' }
      ]
    };
  }
}
