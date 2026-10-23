import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Play, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Check, 
  X, 
  Bot, 
  Mail, 
  Users, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { api } from '../api/client';
import { Workflow, WorkflowExecution } from '../types';

export const WorkflowAutomationView: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [approvalModal, setApprovalModal] = useState<WorkflowExecution | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [resolvingApproval, setResolvingApproval] = useState(false);

  const loadData = async () => {
    try {
      const [wfRes, exRes] = await Promise.all([
        api.getWorkflows(),
        api.getExecutions()
      ]);
      setWorkflows(wfRes.workflows || []);
      setExecutions(exRes.executions || []);
      if (wfRes.workflows && wfRes.workflows.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(wfRes.workflows[0]);
      }
    } catch (err) {
      console.error('[Workflow Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecute = async (workflowId: string) => {
    setRunning(true);
    try {
      const res = await api.executeWorkflow(workflowId, {
        triggerEvent: `Manual Test Execution: ${new Date().toLocaleTimeString()}`,
        payload: {
          contactEmail: 'founder@hypermedia.com',
          company: 'HyperMedia Agency',
          value: 6400
        }
      });
      await loadData();
      if (res.result.status === 'waiting_approval') {
        // Open approval modal immediately
        const exec = (await api.getExecutions()).executions.find(e => e.id === res.result.executionId);
        if (exec) setApprovalModal(exec);
      }
    } catch (err: any) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleResolveApproval = async (approved: boolean) => {
    if (!approvalModal) return;
    setResolvingApproval(true);
    try {
      if (approved) {
        await api.approveExecution(approvalModal.id, approvalComments || 'Operator Verified');
      } else {
        await api.rejectExecution(approvalModal.id, approvalComments || 'Operator Rejected');
      }
      setApprovalModal(null);
      setApprovalComments('');
      await loadData();
    } catch (err: any) {
      alert(`Approval resolution failed: ${err.message}`);
    } finally {
      setResolvingApproval(false);
    }
  };

  const handleToggleActive = async (wf: Workflow) => {
    try {
      await api.updateWorkflow(wf.id, { isActive: !wf.is_active });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const pendingExecutions = executions.filter(e => e.status === 'waiting_approval');

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 uppercase font-semibold">
            <GitBranch className="w-4 h-4" />
            <span>DAYMARK WORKFLOW AUTOMATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Visual Automation & Human Approval Safety Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic state machines with mandatory human approval gates before consequential client communication or CRM stage progression.
          </p>
        </div>

        {selectedWorkflow && (
          <button
            onClick={() => handleExecute(selectedWorkflow.id)}
            disabled={running}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Running Workflow Engine...' : 'Execute Workflow Now'}</span>
          </button>
        )}
      </div>

      {/* Pending Human Approval Drawer Banner */}
      {pendingExecutions.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-amber-500/5">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-100 flex items-center gap-2">
                <span>Action Required: Operator Sign-Off Pending</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-extrabold">
                  {pendingExecutions.length} Awaiting Review
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Execution paused at safety gate: <em>Review generated proposal & outbound outreach parameters</em>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setApprovalModal(pendingExecutions[0])}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <span>Inspect & Sign-Off</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Workflows List & Step Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workflows Definitions */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-slate-400 font-semibold uppercase px-1">Active Workflow Blueprints</div>
          {workflows.map((wf) => {
            const isSelected = selectedWorkflow?.id === wf.id;
            return (
              <div
                key={wf.id}
                onClick={() => setSelectedWorkflow(wf)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500/60 shadow-lg shadow-blue-500/5'
                    : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Trigger: {wf.trigger_type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(wf);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      wf.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {wf.is_active ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </div>

                <div className="font-bold text-sm text-white mt-2 leading-snug">{wf.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{wf.description}</div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{wf.steps.length} sequential steps</span>
                  <span className="text-blue-400 font-medium">Click to inspect →</span>
                </div>
              </div>
            );
          })}

          {/* Execution History Feed */}
          <div className="pt-4">
            <div className="text-xs font-mono text-slate-400 font-semibold uppercase px-1 mb-2">Recent Execution History</div>
            <div className="space-y-2">
              {executions.slice(0, 5).map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExecution(ex)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    selectedExecution?.id === ex.id
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-200 truncate">{ex.trigger_event}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(ex.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    ex.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : ex.status === 'waiting_approval'
                      ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {ex.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Pipeline Step Architecture */}
        <div className="lg:col-span-7">
          {selectedWorkflow ? (
            <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedWorkflow.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedWorkflow.description}</p>
                </div>
                <button
                  onClick={() => handleExecute(selectedWorkflow.id)}
                  disabled={running}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test Run</span>
                </button>
              </div>

              {/* Visual Connected Step Chain */}
              <div className="space-y-4">
                {selectedWorkflow.steps.map((step, idx) => {
                  const isApproval = step.type === 'request_human_approval';
                  return (
                    <div key={step.id} className="relative">
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isApproval
                          ? 'bg-amber-500/5 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                              isApproval ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-xs text-white">{step.name}</div>
                              <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">Type: {step.type}</div>
                            </div>
                          </div>

                          {isApproval ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Safety Sign-Off Gate
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500">Autonomous Action</span>
                          )}
                        </div>
                      </div>

                      {/* Connecting Line */}
                      {idx < selectedWorkflow.steps.length - 1 && (
                        <div className="w-0.5 h-4 bg-slate-800 mx-auto my-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Execution Inspector Drawer if selected */}
              {selectedExecution && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>Execution Result Inspection: {selectedExecution.trigger_event}</span>
                    <button onClick={() => setSelectedExecution(null)} className="text-slate-500 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300 font-mono max-h-48 overflow-y-auto">
                    {selectedExecution.step_results.map((r, i) => (
                      <div key={i} className="p-2 rounded bg-slate-900/60 flex items-start justify-between gap-2">
                        <span>{r.name}:</span>
                        <span className={r.status === 'success' ? 'text-emerald-400' : 'text-amber-400'}>
                          {typeof r.output === 'string' ? r.output : JSON.stringify(r.output)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#0c1220] border border-slate-800 text-center text-slate-500">
              Select a workflow blueprint on the left to inspect its visual pipeline.
            </div>
          )}
        </div>
      </div>

      {/* Human Approval Review Modal */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0d1322] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Human Approval Gate Review</span>
              </div>
              <button onClick={() => setApprovalModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
              <strong>Safety Principle:</strong> DAYMARK OS prevents AI agents from executing external dispatches (emails, contracts, payments) without verified operator sign-off.
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400 font-mono">Execution ID: {approvalModal.id}</div>
              <div className="text-slate-200"><strong>Trigger:</strong> {approvalModal.trigger_event}</div>
              <div className="text-slate-200"><strong>Proposed Action:</strong> Draft client proposal & dispatch welcome email</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Operator Notes / Audit Comment</label>
              <input
                type="text"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="e.g. Verified client domain and approved proposal scope."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => handleResolveApproval(false)}
                disabled={resolvingApproval}
                className="w-1/2 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold text-xs transition-all"
              >
                Reject & Abort
              </button>
              <button
                onClick={() => handleResolveApproval(true)}
                disabled={resolvingApproval}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{resolvingApproval ? 'Processing...' : 'Authorize & Continue'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
