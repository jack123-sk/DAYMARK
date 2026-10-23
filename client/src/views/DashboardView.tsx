import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  GitBranch, 
  Lightbulb, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Bot, 
  Zap, 
  Play
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user, organization } = useAuth();
  const [crmStats, setCrmStats] = useState<any>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [crm, rev, execs, opps] = await Promise.all([
        api.getCrmStats(),
        api.getRevenueMetrics(),
        api.getExecutions(),
        api.getOpportunities()
      ]);
      setCrmStats(crm);
      setRevenueMetrics(rev);
      setExecutions(execs.executions || []);
      setOpportunities(opps.opportunities || []);
    } catch (err) {
      console.error('[Dashboard Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingApprovals = executions.filter(e => e.status === 'waiting_approval');

  const handleQuickTrigger = async () => {
    setTriggeringWorkflow(true);
    setBannerNotice(null);
    try {
      const res = await api.executeWorkflow('wf_sample_lead_intake', {
        triggerEvent: `Manual Quick Intake: Apex Partner Discovery`,
        payload: {
          contactEmail: 'contact@apexpartner.com',
          company: 'Apex Partner Ltd',
          value: 7500
        }
      });
      setBannerNotice(`Workflow executed! Status: ${res.result.status}. Check execution log below.`);
      await loadData();
    } catch (err: any) {
      setBannerNotice(`Execution notice: ${err.message}`);
    } finally {
      setTriggeringWorkflow(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Notice */}
      {bannerNotice && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-slate-400 hover:text-white font-mono text-xs">✕</button>
        </div>
      )}

      {/* Pending Human Approval Alert Banner */}
      {pendingApprovals.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-amber-500/5">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-100 flex items-center gap-2">
                <span>Human-in-the-Loop Approval Required</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold">
                  {pendingApprovals.length} ACTION PENDING
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                An autonomous proposal draft was generated and paused to prevent unverified client dispatches.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/app/workflows')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <span>Review & Authorize in Workflows</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Executive Welcome & Mode Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold">Executive Cockpit</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {organization?.name} • Multi-Tenant Isolated Workspace • Active Engine v1.0
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleQuickTrigger}
            disabled={triggeringWorkflow}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 text-blue-400 ${triggeringWorkflow ? 'animate-spin' : ''}`} />
            <span>{triggeringWorkflow ? 'Running Workflow...' : 'Simulate Inbound Lead Run'}</span>
          </button>
          <button
            onClick={() => onNavigate('/app/builder')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New AI Project</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Sales Pipeline</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            ${crmStats ? crmStats.totalPipelineValue.toLocaleString() : '30,000'}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>Weighted: ${crmStats ? crmStats.weightedPipelineValue.toLocaleString() : '21,400'}</span>
            <span className="text-emerald-400 font-semibold font-mono">
              {crmStats ? crmStats.totalLeadsCount : 4} Active Deals
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Hours Saved</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {revenueMetrics?.automationEfficiency?.estimatedHoursSaved || 14.5} <span className="text-base text-slate-400 font-normal">hrs</span>
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>~${revenueMetrics?.automationEfficiency?.estimatedCostSavingsUsd || 650} saved</span>
            <span className="text-slate-400 font-mono">0.75h/run</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Nexora Opportunities</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
            {opportunities.length || 2} <span className="text-base text-slate-400 font-normal">Hypotheses</span>
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>Top Score: 90.2 / 100</span>
            <span className="text-amber-400 font-mono text-[11px]">B2B Agency</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">AI Assistant Cost</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-purple-300">
            ${revenueMetrics?.aiConsumption?.aiCostUsd || '0.14'}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>6 Assistants Ready</span>
            <span className="text-emerald-400 font-mono text-[11px]">Zero Token Waste</span>
          </div>
        </div>
      </div>

      {/* Main Split Section: Quick Actions & Opportunity Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline & Automation Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Workflows Card */}
          <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <GitBranch className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Workflow Executions</h2>
              </div>
              <button onClick={() => onNavigate('/app/workflows')} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                View all executions →
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800/60">
              {executions.slice(0, 4).map((exec) => (
                <div key={exec.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{exec.trigger_event}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Workflow: {exec.workflow_name || 'Inbound Lead Triage'}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono ${
                      exec.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : exec.status === 'waiting_approval'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {exec.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => onNavigate('/app/workflows')}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Module Launchpad */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Nexora Engine', desc: 'Score hypotheses', route: '/app/opportunities', icon: Lightbulb, color: 'text-amber-400' },
              { label: 'Business Builder', desc: 'Generate assets', route: '/app/builder', icon: Sparkles, color: 'text-cyan-400' },
              { label: 'CRM Pipeline', desc: 'Manage deals', route: '/app/crm', icon: Users, color: 'text-emerald-400' },
              { label: 'Global Connect', desc: 'Find B2B buyers', route: '/app/connect', icon: Zap, color: 'text-indigo-400' }
            ].map((mod, i) => {
              const Icon = mod.icon;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate(mod.route)}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-all hover:scale-[1.02] group"
                >
                  <Icon className={`w-5 h-5 ${mod.color} mb-2`} />
                  <div className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{mod.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{mod.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Nexora Opportunity Spotlight */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-[#0c1220] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold text-amber-400 uppercase flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Nexora Top Pick
              </span>
              <span className="text-xs font-extrabold text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10">
                Score: 90.2
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-4 leading-snug">
              AI Workflow Automation for Boutique Marketing Agencies
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Agencies lose 25+ billable hours/week juggling disparate client onboarding forms, proposals, and CRM updates.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Willingness to Pay:</span>
                <span className="text-emerald-400">90 / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Feasibility:</span>
                <span className="text-blue-400">88 / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Market TAM:</span>
                <span className="text-white">$450M ARR</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 space-y-2">
            <button
              onClick={() => onNavigate('/app/opportunities')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
            >
              <span>Explore Opportunity Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('/app/revenue')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Simulate Financial Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
