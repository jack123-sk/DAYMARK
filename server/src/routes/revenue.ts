import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Retrieve live analytics & operational metrics
router.get('/metrics', (req: Request, res: Response): void => {
  const orgId = req.organization!.id;

  // CRM Pipeline metrics
  const leads = db.prepare('SELECT value, stage, probability FROM leads WHERE organization_id = ?').all(orgId) as any[];
  let totalPipelineValue = 0;
  let wonDealsValue = 0;
  let wonCount = 0;

  for (const l of leads) {
    totalPipelineValue += Number(l.value);
    if (l.stage === 'won') {
      wonDealsValue += Number(l.value);
      wonCount++;
    }
  }

  const conversionRate = leads.length > 0 ? Number(((wonCount / leads.length) * 100).toFixed(1)) : 0;

  // Workflow completions & Automation Hours Saved
  const execs = db.prepare('SELECT status FROM workflow_executions WHERE organization_id = ?').all(orgId) as any[];
  const completedExecs = execs.filter((e: any) => e.status === 'completed').length;
  const workflowCompletionRate = execs.length > 0 ? Number(((completedExecs / execs.length) * 100).toFixed(1)) : 100;
  
  // Assumption: Each automated end-to-end workflow execution saves ~0.75 hours of human manual coordination
  const estimatedHoursSaved = Number((completedExecs * 0.75).toFixed(1));

  // AI Usage & Cost
  const aiStats = db.prepare('SELECT SUM(tokens_used) as total_tokens, SUM(cost_usd) as total_cost FROM agent_executions WHERE organization_id = ?').get(orgId) as any;
  const aiTokensUsed = aiStats?.total_tokens || 0;
  const aiCostUsd = Number((aiStats?.total_cost || 0).toFixed(2));

  // Active Subscription MRR
  const sub = db.prepare('SELECT plan_tier, billing_cycle FROM subscriptions WHERE organization_id = ?').get(orgId) as any;
  const planPrices: Record<string, number> = { free: 0, starter: 49, pro: 149, business: 399, enterprise: 999 };
  const currentPlanMRR = planPrices[sub?.plan_tier || 'starter'] || 49;

  res.json({
    revenue: {
      currentPlanMRR,
      annualRunRate: currentPlanMRR * 12,
      activePipelineValue: totalPipelineValue,
      wonDealsValue,
      totalLeads: leads.length,
      conversionRatePercent: conversionRate,
      assumptions: {
        crmDataPeriod: 'All time in current workspace',
        currency: 'USD'
      }
    },
    automationEfficiency: {
      totalWorkflowExecutions: execs.length,
      completedExecutions: completedExecs,
      workflowCompletionRatePercent: workflowCompletionRate,
      estimatedHoursSaved,
      hourlyValueRateAssumption: 45, // $45/hour benchmark for agency operations
      estimatedCostSavingsUsd: Math.round(estimatedHoursSaved * 45),
      disclaimer: 'Automation hours saved are calculated as 0.75 hours per completed workflow run based on standardized human execution benchmarks.'
    },
    aiConsumption: {
      aiTokensUsed,
      aiCostUsd,
      activeModelProvider: process.env.OPENAI_API_KEY ? 'OpenAI GPT-4o' : process.env.GEMINI_API_KEY ? 'Google Gemini 1.5' : 'DAYMARK Deterministic Engine (Zero API Overhead)'
    }
  });
});

// Interactive Financial Projection Model with Scenarios & Sensitivity Analysis
router.post('/financial-model', (req: Request, res: Response): void => {
  const {
    payingCustomers = 50,
    arpuMonthly = 149,
    monthlyChurnPercent = 2.5,
    newCustomersPerMonth = 15,
    cacUsd = 280,
    processingFeePercent = 2.9,
    aiInfraPerCustomer = 8,
    teamSalariesMonthly = 6000,
    marketingBudgetMonthly = 2500,
    cashBalance = 45000
  } = req.body;

  const calculateScenario = (custMultiplier: number, cacMultiplier: number, churnMultiplier: number) => {
    const activeCust = Math.round(payingCustomers * custMultiplier);
    const newCust = Math.round(newCustomersPerMonth * custMultiplier);
    const mrr = activeCust * arpuMonthly;
    const arr = mrr * 12;
    const churnRate = (monthlyChurnPercent * churnMultiplier) / 100;
    const monthlyChurnCount = Math.round(activeCust * churnRate);
    const netCustomerGrowth = newCust - monthlyChurnCount;

    // Direct Cost of Goods Sold (Payment processing + AI/server infra)
    const paymentFees = mrr * (processingFeePercent / 100);
    const infraCosts = activeCust * aiInfraPerCustomer;
    const cogs = paymentFees + infraCosts;
    const grossProfit = mrr - cogs;
    const grossMarginPercent = mrr > 0 ? Number(((grossProfit / mrr) * 100).toFixed(1)) : 0;

    // Operating Expenses (Opex)
    const effectiveCac = cacUsd * cacMultiplier;
    const monthlyAcquisitionSpend = newCust * effectiveCac;
    const totalOpex = teamSalariesMonthly + marketingBudgetMonthly + monthlyAcquisitionSpend;

    // Operating Profit (EBITDA estimate)
    const operatingProfitMonthly = grossProfit - totalOpex;

    // Unit Economics: LTV
    // LTV = ARPU * Gross Margin % / Churn Rate
    const ltv = churnRate > 0 ? Math.round((arpuMonthly * (grossMarginPercent / 100)) / churnRate) : 0;
    const ltvToCac = effectiveCac > 0 ? Number((ltv / effectiveCac).toFixed(1)) : 0;

    // Break-even customer count: Fixed Costs / (ARPU * Gross Margin - Variable Infra)
    const contributionPerCustomer = (arpuMonthly * (1 - processingFeePercent / 100)) - aiInfraPerCustomer;
    const breakEvenCustomers = contributionPerCustomer > 0 ? Math.ceil((teamSalariesMonthly + marketingBudgetMonthly) / contributionPerCustomer) : 0;

    // Runway in months
    const monthlyBurn = operatingProfitMonthly < 0 ? Math.abs(operatingProfitMonthly) : 0;
    const runwayMonths = monthlyBurn > 0 ? Number((cashBalance / monthlyBurn).toFixed(1)) : 'Infinite (Profitable)';

    return {
      activeCustomers: activeCust,
      newCustomersPerMonth: newCust,
      netCustomerGrowth,
      mrr,
      arr,
      grossProfit: Math.round(grossProfit),
      grossMarginPercent,
      totalOpex: Math.round(totalOpex),
      operatingProfitMonthly: Math.round(operatingProfitMonthly),
      ltv,
      effectiveCac: Math.round(effectiveCac),
      ltvToCacRatio: ltvToCac,
      breakEvenCustomers,
      runwayMonths
    };
  };

  const conservative = calculateScenario(0.65, 1.3, 1.4);
  const base = calculateScenario(1.0, 1.0, 1.0);
  const optimistic = calculateScenario(1.5, 0.8, 0.75);

  // Sensitivity Matrix (varying ARPU from -20% to +20% and Customers from -20% to +20%)
  const sensitivity = [
    { customerChange: '-20%', arpu: arpuMonthly * 0.8, estimatedMRR: Math.round(payingCustomers * 0.8 * arpuMonthly * 0.8) },
    { customerChange: '0%', arpu: arpuMonthly, estimatedMRR: Math.round(payingCustomers * arpuMonthly) },
    { customerChange: '+20%', arpu: arpuMonthly * 1.2, estimatedMRR: Math.round(payingCustomers * 1.2 * arpuMonthly * 1.2) }
  ];

  res.json({
    scenarios: {
      conservative,
      base,
      optimistic
    },
    sensitivity,
    disclaimer: 'Financial model outcomes are theoretical mathematical projections based on user-entered parameters and stated churn/CAC assumptions. No revenues or valuations are guaranteed.'
  });
});

export default router;
