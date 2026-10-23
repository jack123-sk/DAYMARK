import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Search,
  Target,
  Users,
  Headphones,
  Settings,
  TrendingUp
} from 'lucide-react';
import { api } from '../api/client';
import { AIAgent } from '../types';

export const AiAgentsView: React.FC = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [prompt, setPrompt] = useState('');
  const [executionLog, setExecutionLog] = useState<any[]>([]);
  const [activeResult, setActiveResult] = useState<any | null>(null);
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(true);

  const agentIcons: Record<string, any> = {
    research_agent: Search,
    marketing_assistant: Target,
    sales_assistant: Users,
    support_assistant: Headphones,
    operations_assistant: Settings,
    analytics_assistant: TrendingUp
  };

  const loadData = async () => {
    try {
      const [agRes, exRes] = await Promise.all([
        api.getAgents(),
        api.getAgentExecutions()
      ]);
      setAgents(agRes.agents || []);
      setExecutionLog(exRes.executions || []);
      if (agRes.agents && agRes.agents.length > 0 && !selectedAgent) {
        setSelectedAgent(agRes.agents[0]);
      }
    } catch (err) {
      console.error('[Agents Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !prompt.trim()) return;
    setExecuting(true);
    setActiveResult(null);

    try {
      const res = await api.executeAgent(selectedAgent.key, {
        prompt,
        contextData: { sampleCompany: 'NovaPulse Agency', dealValue: 4800 }
      });
      setActiveResult(res.result);
      await loadData();
    } catch (err: any) {
      alert(`Agent execution failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const setPromptTemplate = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 uppercase font-semibold">
          <Bot className="w-4 h-4" />
          <span>DAYMARK CONTROLLED AI AGENTS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Specialized Autonomous Assistants
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Six domain-specific agents with enforced tool boundaries, token metering, and human sign-off gates. No arbitrary execution or hallucinations.
        </p>
      </div>

      {/* Agents Grid (All 6 Agents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((ag) => {
          const Icon = agentIcons[ag.key] || Bot;
          const isSelected = selectedAgent?.key === ag.key;
          return (
            <div
              key={ag.id}
              onClick={() => {
                setSelectedAgent(ag);
                setActiveResult(null);
              }}
              className={`p-5 rounded-3xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-purple-600/10 border-purple-500/60 shadow-xl shadow-purple-500/10'
                  : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-slate-900 text-purple-400">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                  ONLINE
                </span>
              </div>

              <div className="font-bold text-sm text-white mt-3">{ag.name}</div>
              <p className="text-xs text-slate-400 mt-1 min-h-[36px] line-clamp-2">{ag.role}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Runs: <strong>{ag.execution_count}</strong></span>
                <span>Spent: <strong className="text-purple-300">${Number(ag.cost_spent).toFixed(3)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Execution Console */}
      {selectedAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prompt Console Form */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" /> Assistant Terminal: {selectedAgent.name}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Key: <code>{selectedAgent.key}</code>
              </span>
            </div>

            {/* Permissions Pill list */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase mb-1.5">Permitted Tools:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.permissions.map((perm, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-blue-300">
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Prompt Templates */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase mb-1.5">Example Prompts:</div>
              <div className="space-y-1.5">
                {[
                  selectedAgent.key === 'research_agent' && 'Analyze target pain points and TAM for boutique web design agencies',
                  selectedAgent.key === 'sales_assistant' && 'Qualify deal for NovaPulse ($4,800/mo) and draft scope proposal',
                  selectedAgent.key === 'marketing_assistant' && 'Generate 3 high-converting LinkedIn hooks for B2B workflow software',
                  selectedAgent.key === 'support_assistant' && 'Triage integration issue: custom webhook timeout error',
                  selectedAgent.key === 'operations_assistant' && 'Audit current organization workflow runtimes and bottleneck SLA',
                  selectedAgent.key === 'analytics_assistant' && 'Calculate CAC payback period and LTV on 2.1% monthly churn'
                ].filter(Boolean).map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptTemplate(t as string)}
                    className="w-full text-left p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono transition-colors truncate"
                  >
                    ↳ {t}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleExecute} className="space-y-3 pt-2">
              <textarea
                required
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Prompt the ${selectedAgent.name}...`}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />

              <button
                type="submit"
                disabled={executing}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Sparkles className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
                <span>{executing ? 'Agent Thinking & Validating...' : 'Dispatch Prompt to Agent'}</span>
              </button>
            </form>
          </div>

          {/* Execution Result & Reasoning Output */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0c1220] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Execution Inspector & Telemetry</span>
                {activeResult && (
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="text-slate-400">{activeResult.tokensUsed} tokens</span>
                    <span className="text-purple-300 font-bold">${activeResult.costUsd} USD</span>
                  </div>
                )}
              </div>

              {activeResult ? (
                <div className="mt-4 space-y-4">
                  {/* Reasoning telemetry */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Agent Reasoning Step:</div>
                    <p className="text-xs text-slate-300 font-mono">{activeResult.reasoning}</p>
                  </div>

                  {/* Tool Invocations */}
                  {activeResult.toolCalls.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Tool Calls Verified:</div>
                      {activeResult.toolCalls.map((tc: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 flex justify-between">
                          <span>{tc.tool}()</span>
                          <span className="text-slate-400">{JSON.stringify(tc.result)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structured Output */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 mb-2">Validated Output:</div>
                    <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {activeResult.output}
                    </div>
                  </div>

                  {/* Safety Gate Warning if external action required */}
                  {activeResult.requiresHumanApproval && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Consequential action detected: Human approval required before external dispatch.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-slate-500">
                  Select an assistant and enter a query to observe autonomous reasoning and token telemetry.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex justify-between mt-4">
              <span>Engine: Local Deterministic / Cloud Adapter</span>
              <span>Zero Browser Secret Leakage</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
