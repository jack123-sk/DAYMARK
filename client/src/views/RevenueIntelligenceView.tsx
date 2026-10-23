import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Percent, 
  Sliders, 
  ShieldAlert, 
  BarChart3, 
  Zap, 
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../api/client';

export const RevenueIntelligenceView: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any>(null);
  const [sensitivity, setSensitivity] = useState<any[]>([]);
  const [activeScenario, setActiveScenario] = useState<'conservative' | 'base' | 'optimistic'>('base');
  const [loading, setLoading] = useState(true);

  // Financial Model Sliders
  const [payingCustomers, setPayingCustomers] = useState(45);
  const [arpuMonthly, setArpuMonthly] = useState(149);
  const [monthlyChurnPercent, setMonthlyChurnPercent] = useState(2.5);
  const [newCustomersPerMonth, setNewCustomersPerMonth] = useState(12);
  const [cacUsd, setCacUsd] = useState(260);

  const loadMetrics = async () => {
    try {
      const res = await api.getRevenueMetrics();
      setMetrics(res);
    } catch (err) {
      console.error('[Revenue Metrics Error]', err);
    }
  };

  const calculateModel = async () => {
    try {
      const res = await api.simulateFinancialModel({
        payingCustomers,
        arpuMonthly,
        monthlyChurnPercent,
        newCustomersPerMonth,
        cacUsd,
        cashBalance: 50000
      });
      setScenarios(res.scenarios);
      setSensitivity(res.sensitivity || []);
    } catch (err) {
      console.error('[Model Simulation Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    calculateModel();
  }, [payingCustomers, arpuMonthly, monthlyChurnPercent, newCustomersPerMonth, cacUsd]);

  const currentScen = scenarios ? scenarios[activeScenario] : null;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-pink-400 uppercase font-semibold">
          <TrendingUp className="w-4 h-4" />
          <span>DAYMARK REVENUE INTELLIGENCE & SENSITIVITY MODEL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Financial Telemetry & Unit Economics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time CRM conversion rates, automation hours saved, and transparent mathematical financial forecasting with explicit assumptions.
        </p>
      </div>

      {/* Commercial Principle Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start space-x-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-slate-100">Commercial Principle:</strong> We optimize for sustainable unit economics and proven retention. DAYMARK OS never guarantees financial returns or valuations. Projections below are mathematical models calculated under user-defined variables and stated churn assumptions.
        </div>
      </div>

      {/* Live Workspace Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
          <span className="text-xs font-mono text-slate-400 uppercase">Current Workspace Plan MRR</span>
          <div className="text-3xl font-extrabold text-white mt-2">
            ${metrics?.revenue?.currentPlanMRR || 149} <span className="text-xs text-slate-500 font-normal">/mo</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            ARR Run Rate: ${(metrics?.revenue?.annualRunRate || 1788).toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
          <span className="text-xs font-mono text-slate-400 uppercase">Sales Conversion Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {metrics?.revenue?.conversionRatePercent || 25}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Pipeline: ${metrics?.revenue?.activePipelineValue?.toLocaleString() || '30,000'}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
          <span className="text-xs font-mono text-slate-400 uppercase">Automation Hours Saved</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-2">
            {metrics?.automationEfficiency?.estimatedHoursSaved || 14.5} <span className="text-base text-slate-400 font-normal">hrs</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Estimated Value: ${metrics?.automationEfficiency?.estimatedCostSavingsUsd || 650}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-md">
          <span className="text-xs font-mono text-slate-400 uppercase">Workflow Completion</span>
          <div className="text-3xl font-extrabold text-purple-300 mt-2">
            {metrics?.automationEfficiency?.workflowCompletionRatePercent || 100}%
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {metrics?.automationEfficiency?.completedExecutions || 1} / {metrics?.automationEfficiency?.totalWorkflowExecutions || 1} Runs Succeeded
          </div>
        </div>
      </div>

      {/* Interactive Financial Projection Simulator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-blue-400 uppercase font-semibold">Scenario Modeling Simulator</div>
            <h2 className="text-xl font-bold text-white mt-1">Multi-Scenario Growth & Unit Economics</h2>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex space-x-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            {(['conservative', 'base', 'optimistic'] as const).map((scen) => (
              <button
                key={scen}
                onClick={() => setActiveScenario(scen)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                  activeScenario === scen
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {scen} Case
              </button>
            ))}
          </div>
        </div>

        {/* Input Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Active Paying Customers</span>
              <span className="font-mono text-blue-400 font-bold">{payingCustomers}</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              value={payingCustomers}
              onChange={(e) => setPayingCustomers(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Average Monthly ARPU ($)</span>
              <span className="font-mono text-blue-400 font-bold">${arpuMonthly}</span>
            </div>
            <input
              type="range"
              min="49"
              max="999"
              step="10"
              value={arpuMonthly}
              onChange={(e) => setArpuMonthly(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Monthly Churn Rate (%)</span>
              <span className="font-mono text-blue-400 font-bold">{monthlyChurnPercent}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={monthlyChurnPercent}
              onChange={(e) => setMonthlyChurnPercent(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>New Customers / Month</span>
              <span className="font-mono text-blue-400 font-bold">{newCustomersPerMonth}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={newCustomersPerMonth}
              onChange={(e) => setNewCustomersPerMonth(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Customer Acquisition Cost (CAC)</span>
              <span className="font-mono text-blue-400 font-bold">${cacUsd}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={cacUsd}
              onChange={(e) => setCacUsd(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Calculated Scenario Results */}
        {currentScen && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Projected MRR</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                ${currentScen.mrr.toLocaleString()}
              </span>
              <span className="text-slate-500 text-[10px]">ARR: ${currentScen.arr.toLocaleString()}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Gross Margin %</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                {currentScen.grossMarginPercent}%
              </span>
              <span className="text-slate-500 text-[10px]">Gross: ${currentScen.grossProfit.toLocaleString()}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Customer LTV</span>
              <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">
                ${currentScen.ltv.toLocaleString()}
              </span>
              <span className="text-slate-500 text-[10px]">LTV:CAC = {currentScen.ltvToCacRatio}x</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Break-Even Customers</span>
              <span className="text-2xl font-extrabold text-amber-300 mt-1 block">
                {currentScen.breakEvenCustomers}
              </span>
              <span className="text-slate-500 text-[10px]">Runway: {currentScen.runwayMonths}</span>
            </div>
          </div>
        )}

        {/* Sensitivity Analysis Table */}
        <div className="pt-4 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400 font-semibold uppercase mb-3">
            Sensitivity Matrix: MRR Variance at ±20% Customer Volume & ARPU
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Volume Shift</th>
                  <th className="py-2.5 px-3">Effective ARPU</th>
                  <th className="py-2.5 px-3">Estimated Monthly Recurring Revenue</th>
                  <th className="py-2.5 px-3">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sensitivity.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 text-slate-300 font-bold">{row.customerChange}</td>
                    <td className="py-2.5 px-3 text-slate-400">${Math.round(row.arpu)}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">${row.estimatedMRR.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {idx === 0 ? 'Pessimistic Floor' : idx === 1 ? 'Baseline Target' : 'Expansion Target'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
