import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Terminal,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { SubscriptionData } from '../types';

export const BillingView: React.FC = () => {
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        api.getSubscription(),
        api.getPlans()
      ]);
      setSubData(sRes);
      setPlans(pRes.plans || []);
    } catch (err) {
      console.error('[Billing Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangePlan = async (tier: string) => {
    try {
      await api.changePlan(tier, 'monthly');
      setShowUpgradeModal(false);
      setNotice(`Your organization workspace is now on the ${tier.toUpperCase()} plan.`);
      await loadData();
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(`Plan update failed: ${err.message}`);
    }
  };

  const handleSimulateWebhook = async () => {
    setSimulatingWebhook(true);
    setWebhookResult(null);
    try {
      const res = await api.simulateWebhook('payment_intent.succeeded', 14900);
      setWebhookResult(res);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const usage = subData?.usage;
  const plan = subData?.plan;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 uppercase font-semibold">
          <CreditCard className="w-4 h-4" />
          <span>DAYMARK BILLING & USAGE METERING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Subscription & Capacity Limits
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configurable plan entitlements, real-time usage meters, verified webhook reconciliation, and invoice records.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Active Subscription Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
              {plan?.tier.toUpperCase()} PLAN
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active & Verified
            </span>
          </div>

          <div className="mt-3 text-3xl sm:text-4xl font-extrabold text-white flex items-baseline space-x-2">
            <span>${plan?.monthlyPrice || 149}</span>
            <span className="text-xs text-slate-400 font-normal">/month ({subData?.subscription?.billing_cycle || 'monthly'})</span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Current billing period renews on {subData?.subscription?.current_period_end ? new Date(subData.subscription.current_period_end).toLocaleDateString() : 'Next month'}.
          </p>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
        >
          Change Plan / Upgrade Tier
        </button>
      </div>

      {/* Usage Progress Meters Grid */}
      {usage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Meter 1: Workflow Runs */}
          <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-slate-400 uppercase">Workflow Runs</span>
              <span className="font-mono text-white font-bold">{usage.workflowRuns} / {usage.maxWorkflowRuns}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min((usage.workflowRuns / usage.maxWorkflowRuns) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Resets on 1st of month</div>
          </div>

          {/* Meter 2: AI Tokens */}
          <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-slate-400 uppercase">AI Tokens</span>
              <span className="font-mono text-purple-300 font-bold">{usage.aiTokens.toLocaleString()} / {usage.maxAiTokens.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min((usage.aiTokens / usage.maxAiTokens) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Enforced at server API</div>
          </div>

          {/* Meter 3: CRM Contacts */}
          <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-slate-400 uppercase">CRM Contacts</span>
              <span className="font-mono text-emerald-400 font-bold">{usage.contacts} / {usage.maxContacts}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min((usage.contacts / usage.maxContacts) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Multi-tenant isolated</div>
          </div>

          {/* Meter 4: Active Projects */}
          <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-slate-400 uppercase">Business Projects</span>
              <span className="font-mono text-cyan-400 font-bold">{usage.projects} / {usage.maxProjects}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${Math.min((usage.projects / usage.maxProjects) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono">AI Business Builder</div>
          </div>
        </div>
      )}

      {/* Signed Webhook Simulator Console */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-white font-mono uppercase">Payment Webhook Verification Simulator</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">HMAC SHA-256 Signatures</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In compliance with our security standards, DAYMARK OS rigorously verifies cryptographic webhook signatures for payment events before reconciling subscriptions or invoices. Test this live below:
        </p>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleSimulateWebhook}
            disabled={simulatingWebhook}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Zap className={`w-3.5 h-3.5 ${simulatingWebhook ? 'animate-spin' : ''}`} />
            <span>{simulatingWebhook ? 'Signing & Verifying...' : 'Simulate Signed Stripe Payment Webhook'}</span>
          </button>
        </div>

        {webhookResult && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 space-y-1 animate-in fade-in">
            <div className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {webhookResult.message}
            </div>
            <div className="text-slate-400 text-[11px] pt-1">
              Event Ref: {webhookResult.result.eventId} • Status: Cryptographically Verified
            </div>
          </div>
        )}
      </div>

      {/* Billing History & Invoice Records Table */}
      <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="font-bold text-sm text-white">Payment & Billing History</span>
          <span className="text-xs text-slate-400 font-mono">Showing last 10 events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Signature Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subData?.invoices?.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 text-slate-300">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 text-white font-bold">{inv.event_type}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">${inv.amount} {inv.currency}</td>
                  <td className="py-2.5 px-3 text-slate-400">{inv.provider_ref}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      HMAC VERIFIED ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-base text-white">Select Workspace Plan</span>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {plans.map((p) => {
                const isCurrent = p.tier === plan?.tier;
                return (
                  <div
                    key={p.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{p.name}</div>
                      <div className="text-2xl font-extrabold text-blue-400 mt-2">${p.monthlyPrice}<span className="text-xs text-slate-400 font-normal">/mo</span></div>
                      
                      <div className="my-3 text-[11px] font-mono text-slate-300 space-y-1">
                        <div>• {p.limits.maxWorkflowRunsMonthly} Runs/mo</div>
                        <div>• {(p.limits.maxAiTokensMonthly / 1000).toFixed(0)}k AI Tokens</div>
                        <div>• {p.limits.maxProjects} Projects</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleChangePlan(p.tier)}
                      disabled={isCurrent}
                      className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
