export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  status: string;
}

export interface Opportunity {
  id: string;
  title: string;
  industry: string;
  target_segment: string;
  problem_statement: string;
  solution_hypothesis: string;
  market_size_arr: number;
  confidence_score: number;
  feasibility_score: number;
  willingness_to_pay_score: number;
  composite_score: number;
  status: 'hypothesized' | 'validating' | 'confirmed' | 'archived';
  validation_notes?: string;
  risks?: string;
  interview_guide?: string;
  created_at: string;
}

export interface BusinessProject {
  id: string;
  name: string;
  description: string;
  industry: string;
  target_audience: string;
  generated_assets: {
    businessPlan: {
      executiveSummary: string;
      mission: string;
      problemStatement: string;
      solution: string;
      revenueModel: string;
    };
    customerPersonas: Array<{
      role: string;
      painPoint: string;
      buyingTrigger: string;
      budgetAuthority: string;
    }>;
    positioning: {
      headline: string;
      tagline: string;
      differentiators: string[];
    };
    pricingHypotheses: Array<{
      tier: string;
      price: string;
      audience: string;
      features: string[];
    }>;
    marketingCampaignDrafts: Array<{
      channel: string;
      hook: string;
      targetAudience: string;
    }>;
    landingPage: {
      heroTitle: string;
      heroSubtitle: string;
      ctaText: string;
      features: Array<{ title: string; desc: string }>;
    };
    operationalChecklist: Array<{
      step: number;
      task: string;
      timeEst: string;
      done: boolean;
    }>;
    businessRisks: Array<{
      risk: string;
      severity: string;
      mitigation: string;
    }>;
  };
  status: string;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  stage: string;
  lead_score: number;
  tags: string[];
  source: string;
  notes?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  title: string;
  contact_name: string;
  contact_email: string;
  company: string;
  value: number;
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  notes?: string;
  created_at: string;
}

export interface CrmTask {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  related_to?: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  steps: Array<{
    id: string;
    type: string;
    name: string;
    config: Record<string, any>;
    order: number;
  }>;
  is_active: number | boolean;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name?: string;
  trigger_event: string;
  status: 'running' | 'waiting_approval' | 'completed' | 'failed';
  step_results: Array<{
    stepId: string;
    name: string;
    type: string;
    status: 'success' | 'failed' | 'waiting_approval' | 'skipped';
    output: any;
    error?: string;
    executedAt: string;
  }>;
  pending_approval?: {
    stepId: string;
    stepIndex: number;
    title: string;
    actionRequired: string;
    context: any;
    requestedAt: string;
  };
  idempotency_key?: string;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface AIAgent {
  id: string;
  key: string;
  name: string;
  role: string;
  permissions: string[];
  status: string;
  execution_count: number;
  cost_spent: number;
}

export interface GlobalCompany {
  id: string;
  name: string;
  industry: string;
  region: string;
  country: string;
  size: string;
  relevance_score: number;
  verified: number;
  partnership_type: string;
  contact_email: string;
  website: string;
  outreach_status: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  author: string;
  installs: number;
  rating: number;
  price: string;
  manifest: {
    version?: string;
    requiredPermissions?: string[];
  };
  verified: number;
  is_installed: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_read: number;
  action_url?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface SubscriptionData {
  subscription: {
    plan_tier: string;
    status: string;
    billing_cycle: string;
    current_period_end: string;
  };
  plan: {
    id: string;
    name: string;
    tier: string;
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
  };
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
  invoices: Array<{
    id: string;
    event_type: string;
    amount: number;
    currency: string;
    status: string;
    provider_ref: string;
    created_at: string;
  }>;
}
