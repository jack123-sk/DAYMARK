import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Download, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  TrendingUp, 
  AlertTriangle, 
  X,
  Search
} from 'lucide-react';
import { api } from '../api/client';
import { Opportunity } from '../types';

export const OpportunityEngineView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  // Form state for creating opportunity
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('B2B Professional Services');
  const [targetSegment, setTargetSegment] = useState('Boutique Marketing Agencies (5-25 staff)');
  const [problemStatement, setProblemStatement] = useState('');
  const [solutionHypothesis, setSolutionHypothesis] = useState('');
  const [marketSizeArr, setMarketSizeArr] = useState(450000000);
  const [willingnessToPay, setWillingnessToPay] = useState(85);
  const [feasibility, setFeasibility] = useState(80);
  const [confidence, setConfidence] = useState(85);
  const [risks, setRisks] = useState('');

  const loadOpps = async () => {
    try {
      const res = await api.getOpportunities();
      setOpportunities(res.opportunities || []);
      if (res.opportunities && res.opportunities.length > 0 && !selectedOpp) {
        setSelectedOpp(res.opportunities[0]);
      }
    } catch (err) {
      console.error('[Nexora Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpps();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createOpportunity({
        title,
        industry,
        targetSegment,
        problemStatement,
        solutionHypothesis,
        marketSizeArr,
        willingnessToPayScore: willingnessToPay,
        feasibilityScore: feasibility,
        confidenceScore: confidence,
        risks
      });
      setShowCreateModal(false);
      await loadOpps();
      setSelectedOpp(res.opportunity);
      // Reset
      setTitle('');
      setProblemStatement('');
      setSolutionHypothesis('');
    } catch (err: any) {
      alert(`Creation failed: ${err.message}`);
    }
  };

  const handleExport = (id: string) => {
    window.open(`/api/opportunities/${id}/export`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity hypothesis?')) return;
    try {
      await api.deleteOpportunity(id);
      await loadOpps();
      if (selectedOpp?.id === id) {
        setSelectedOpp(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredOpps = opportunities.filter(o => 
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.industry.toLowerCase().includes(search.toLowerCase()) ||
    o.target_segment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase font-semibold">
            <Lightbulb className="w-4 h-4" />
            <span>NEXORA OPPORTUNITY ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Market Hypothesis & Validation Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explicit weighted scoring: Willingness to Pay (40%) • Technical Feasibility (30%) • Market Confidence (30%)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Opportunity Hypothesis</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Opportunities List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by segment, industry, keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-3">
            {filteredOpps.map((opp) => {
              const isSelected = selectedOpp?.id === opp.id;
              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5'
                      : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{opp.industry}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Score: {opp.composite_score}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white mt-2 leading-snug line-clamp-2">
                    {opp.title}
                  </div>

                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {opp.problem_statement}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>TAM: ${Number(opp.market_size_arr).toLocaleString()}</span>
                    <span className="capitalize text-slate-400 font-sans font-medium">{opp.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Hypothesis & Validation Workspace */}
        <div className="lg:col-span-7">
          {selectedOpp ? (
            <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-6">
              {/* Top Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300">
                    Composite Score: {selectedOpp.composite_score} / 100
                  </span>
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Status: <strong className="text-white">{selectedOpp.status}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 flex items-center space-x-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Customer Interview Guide</span>
                  </button>
                  <button
                    onClick={() => handleExport(selectedOpp.id)}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:text-white text-slate-300"
                    title="Export Markdown Brief"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedOpp.id)}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:text-red-400 text-slate-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-500 uppercase">{selectedOpp.target_segment}</span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedOpp.title}</h2>
              </div>

              {/* Scoring breakdown matrix */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center font-mono">
                <div>
                  <div className="text-[11px] text-slate-400">Willingness to Pay (40%)</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{selectedOpp.willingness_to_pay_score} / 100</div>
                </div>
                <div className="border-x border-slate-800">
                  <div className="text-[11px] text-slate-400">Feasibility (30%)</div>
                  <div className="text-lg font-bold text-blue-400 mt-1">{selectedOpp.feasibility_score} / 100</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Confidence (30%)</div>
                  <div className="text-lg font-bold text-purple-400 mt-1">{selectedOpp.confidence_score} / 100</div>
                </div>
              </div>

              {/* Problem & Solution Cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Problem Discovery:</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedOpp.problem_statement}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Solution Hypothesis:</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedOpp.solution_hypothesis}</p>
                </div>

                {selectedOpp.risks && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Feasibility & Risk Analysis:
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedOpp.risks}</p>
                  </div>
                )}
              </div>

              {/* Market Size & Validation Notes */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Estimated Serviceable TAM: </span>
                  <strong className="text-white font-mono">${Number(selectedOpp.market_size_arr).toLocaleString()} ARR</strong>
                </div>
                <span className="text-slate-500 text-[11px]">Formula-backed estimate</span>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#0c1220] border border-slate-800 text-center text-slate-500">
              Select an opportunity hypothesis on the left to review validation data.
            </div>
          )}
        </div>
      </div>

      {/* Customer Discovery Interview Modal */}
      {showInterviewModal && selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" /> Customer Discovery Interview Guide
              </span>
              <button onClick={() => setShowInterviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Conduct structured interviews with at least 5 target {selectedOpp.target_segment} decision-makers using this calibrated guide.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {[
                `1. How does your team currently manage client onboarding and scope definition?`,
                `2. What is the most painful bottleneck when attempting to solve this with current point tools?`,
                `3. How many billable or administrative hours does your team lose to manual coordination each week?`,
                `4. If an automated software system handled this with human sign-off, what monthly budget would be justified?`
              ].map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-medium">
                  {q}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowInterviewModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Create New Opportunity Hypothesis</span>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Invoice Intake Automation for Logistics Forwarders"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Industry</label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Segment</label>
                  <input
                    type="text"
                    required
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Problem Statement</label>
                <textarea
                  required
                  rows={2}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="What acute operational bottleneck does this customer segment suffer daily?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Proposed Solution Hypothesis</label>
                <textarea
                  required
                  rows={2}
                  value={solutionHypothesis}
                  onChange={(e) => setSolutionHypothesis(e.target.value)}
                  placeholder="How does your automated workflow eliminate this bottleneck?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Scoring Sliders */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Criteria Scoring Matrix</div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Willingness to Pay (Weight: 40%)</span>
                    <span className="font-mono text-emerald-400">{willingnessToPay}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={willingnessToPay}
                    onChange={(e) => setWillingnessToPay(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Technical Feasibility (Weight: 30%)</span>
                    <span className="font-mono text-blue-400">{feasibility}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={feasibility}
                    onChange={(e) => setFeasibility(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Market Confidence (Weight: 30%)</span>
                    <span className="font-mono text-purple-400">{confidence}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Save & Calculate Opportunity Score
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
