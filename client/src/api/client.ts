const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('daymark_token');
  const orgId = localStorage.getItem('daymark_org_id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (orgId) {
    headers['x-organization-id'] = orgId;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    throw new ApiError(response.status, errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  recoverPassword: (email: string) => request<any>('/auth/recover-password', { method: 'POST', body: JSON.stringify({ email }) }),
  completeOnboarding: (data: any) => request<any>('/auth/onboarding', { method: 'POST', body: JSON.stringify(data) }),

  // DAYMARK Opportunity Engine
  getOpportunities: () => request<{ opportunities: any[] }>('/opportunities'),
  createOpportunity: (data: any) => request<{ opportunity: any }>('/opportunities', { method: 'POST', body: JSON.stringify(data) }),
  updateOpportunity: (id: string, data: any) => request<{ opportunity: any }>(`/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOpportunity: (id: string) => request<any>(`/opportunities/${id}`, { method: 'DELETE' }),

  // AI Business Builder
  getProjects: () => request<{ projects: any[] }>('/projects'),
  generateProject: (data: any) => request<{ project: any }>('/projects/generate', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => request<{ project: any }>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<any>(`/projects/${id}`, { method: 'DELETE' }),

  // CRM
  getContacts: () => request<{ contacts: any[] }>('/crm/contacts'),
  createContact: (data: any) => request<{ contact: any }>('/crm/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id: string, data: any) => request<{ contact: any }>(`/crm/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id: string) => request<any>(`/crm/contacts/${id}`, { method: 'DELETE' }),
  importContactsCsv: (csvText: string) => request<any>('/crm/contacts/import-csv', { method: 'POST', body: JSON.stringify({ csvText }) }),

  getLeads: () => request<{ leads: any[] }>('/crm/leads'),
  createLead: (data: any) => request<{ lead: any }>('/crm/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: any) => request<{ lead: any }>(`/crm/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id: string) => request<any>(`/crm/leads/${id}`, { method: 'DELETE' }),

  getTasks: () => request<{ tasks: any[] }>('/crm/tasks'),
  createTask: (data: any) => request<{ task: any }>('/crm/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => request<{ task: any }>(`/crm/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<any>(`/crm/tasks/${id}`, { method: 'DELETE' }),
  getCrmStats: () => request<any>('/crm/stats'),

  // Workflows
  getWorkflows: () => request<{ workflows: any[] }>('/workflows'),
  createWorkflow: (data: any) => request<{ workflow: any }>('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (id: string, data: any) => request<{ workflow: any }>(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkflow: (id: string) => request<any>(`/workflows/${id}`, { method: 'DELETE' }),
  executeWorkflow: (id: string, body: any = {}) => request<{ result: any }>(`/workflows/${id}/execute`, { method: 'POST', body: JSON.stringify(body) }),
  getExecutions: () => request<{ executions: any[] }>('/workflows/executions'),
  approveExecution: (id: string, comments?: string) => request<any>(`/workflows/executions/${id}/approve`, { method: 'POST', body: JSON.stringify({ comments }) }),
  rejectExecution: (id: string, comments?: string) => request<any>(`/workflows/executions/${id}/reject`, { method: 'POST', body: JSON.stringify({ comments }) }),

  // AI Agents
  getAgents: () => request<{ agents: any[] }>('/agents'),
  executeAgent: (key: string, data: any) => request<{ result: any }>(`/agents/${key}/execute`, { method: 'POST', body: JSON.stringify(data) }),
  getAgentExecutions: () => request<{ executions: any[] }>('/agents/executions'),

  // Global Connect
  getCompanies: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<{ companies: any[] }>(`/connect/companies?${q}`);
  },
  draftOutreach: (data: any) => request<{ draft: any }>('/connect/outreach', { method: 'POST', body: JSON.stringify(data) }),
  updateCompanyStatus: (id: string, status: string) => request<any>(`/connect/companies/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Revenue Intelligence
  getRevenueMetrics: () => request<any>('/revenue/metrics'),
  simulateFinancialModel: (inputs: any) => request<any>('/revenue/financial-model', { method: 'POST', body: JSON.stringify(inputs) }),

  // Marketplace
  getMarketplaceItems: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<{ items: any[] }>(`/marketplace/items?${q}`);
  },
  installMarketplaceItem: (id: string) => request<any>(`/marketplace/items/${id}/install`, { method: 'POST' }),
  uninstallMarketplaceItem: (id: string) => request<any>(`/marketplace/items/${id}/uninstall`, { method: 'POST' }),

  // Billing
  getPlans: () => request<{ plans: any[] }>('/billing/plans'),
  getSubscription: () => request<any>('/billing/subscription'),
  changePlan: (planTier: string, billingCycle: string = 'monthly') => request<any>('/billing/change-plan', { method: 'POST', body: JSON.stringify({ planTier, billingCycle }) }),
  simulateWebhook: (eventType?: string, amount?: number) => request<any>('/billing/simulate-webhook', { method: 'POST', body: JSON.stringify({ eventType, amount }) }),

  // Team
  getTeamMembers: () => request<{ members: any[] }>('/team/members'),
  inviteMember: (data: any) => request<any>('/team/invite', { method: 'POST', body: JSON.stringify(data) }),
  updateMemberRole: (id: string, role: string) => request<any>(`/team/members/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  removeMember: (id: string) => request<any>(`/team/members/${id}`, { method: 'DELETE' }),

  // Integrations
  getIntegrations: () => request<{ integrations: any[] }>('/integrations/status'),
  testIntegration: (integrationId: string) => request<any>('/integrations/test', { method: 'POST', body: JSON.stringify({ integrationId }) }),

  // Audit Logs & Notifications
  getAuditLogs: (limit: number = 100) => request<{ logs: any[] }>(`/audit-logs?limit=${limit}`),
  getNotifications: () => request<{ notifications: any[] }>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
};
