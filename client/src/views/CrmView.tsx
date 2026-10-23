import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Search, 
  TrendingUp, 
  CheckSquare, 
  Kanban, 
  UserCheck, 
  DollarSign, 
  X,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { Contact, Lead, CrmTask } from '../types';

export const CrmView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'contacts' | 'tasks'>('pipeline');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [crmStats, setCrmStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('First Name,Last Name,Email,Phone,Company,Title\nAlex,Chen,alex@apexmedia.io,+14155550192,Apex Media,Founder\nSarah,Connor,sarah@skynetsec.com,+14155550193,SkyNet Sec,CTO');

  // Contact Form
  const [cFirst, setCFirst] = useState('');
  const [cLast, setCLast] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cCompany, setCCompany] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [cStage, setCStage] = useState('lead');

  // Lead Form
  const [lTitle, setLTitle] = useState('');
  const [lContact, setLContact] = useState('');
  const [lEmail, setLEmail] = useState('');
  const [lCompany, setLCompany] = useState('');
  const [lValue, setLValue] = useState(5000);
  const [lStage, setLStage] = useState<'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'>('new');
  const [lProbability, setLProbability] = useState(30);

  // Task Form
  const [tTitle, setTTitle] = useState('');
  const [tPriority, setTPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tRelated, setTRelated] = useState('');

  const loadData = async () => {
    try {
      const [cRes, lRes, tRes, sRes] = await Promise.all([
        api.getContacts(),
        api.getLeads(),
        api.getTasks(),
        api.getCrmStats()
      ]);
      setContacts(cRes.contacts || []);
      setLeads(lRes.leads || []);
      setTasks(tRes.tasks || []);
      setCrmStats(sRes);
    } catch (err) {
      console.error('[CRM Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createContact({
        firstName: cFirst,
        lastName: cLast,
        email: cEmail,
        phone: cPhone,
        company: cCompany,
        title: cTitle,
        stage: cStage
      });
      setShowContactModal(false);
      setCFirst('');
      setCLast('');
      setCEmail('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLead({
        title: lTitle,
        contactName: lContact,
        contactEmail: lEmail,
        company: lCompany,
        value: lValue,
        stage: lStage,
        probability: lProbability
      });
      setShowLeadModal(false);
      setLTitle('');
      setLContact('');
      setLCompany('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTask({
        title: tTitle,
        priority: tPriority,
        relatedTo: tRelated
      });
      setShowTaskModal(false);
      setTTitle('');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLeadStage = async (leadId: string, newStage: any) => {
    try {
      await api.updateLead(leadId, { stage: newStage });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleTask = async (task: CrmTask) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImportCsv = async () => {
    try {
      const res = await api.importContactsCsv(csvText);
      alert(`Imported ${res.importedCount} contacts successfully!`);
      setShowCsvModal(false);
      await loadData();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/crm/contacts/export-csv', '_blank');
  };

  const kanbanStages: Array<{ key: Lead['stage']; label: string; color: string }> = [
    { key: 'new', label: 'New Inquiry', color: 'border-slate-700 bg-slate-900/60' },
    { key: 'qualified', label: 'Qualified Fit', color: 'border-blue-500/30 bg-blue-500/5' },
    { key: 'proposal', label: 'Proposal Sent', color: 'border-cyan-500/30 bg-cyan-500/5' },
    { key: 'negotiation', label: 'In Negotiation', color: 'border-amber-500/30 bg-amber-500/5' },
    { key: 'won', label: 'Closed Won', color: 'border-emerald-500/40 bg-emerald-500/10' }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & KPI Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase font-semibold">
            <Users className="w-4 h-4" />
            <span>DAYMARK CRM & SALES ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Customer Relationships & Deal Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track leads, advance deals across visual Kanban stages, import contacts, and record automated touchpoints.
          </p>
        </div>

        {/* Top Action CTAs */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowLeadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Deal</span>
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Contact</span>
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Task</span>
          </button>
        </div>
      </div>

      {/* CRM Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-3xl bg-[#0c1220] border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-slate-400 block">Total Pipeline:</span>
          <strong className="text-lg text-white font-bold mt-0.5 block">
            ${crmStats ? crmStats.totalPipelineValue.toLocaleString() : '30,000'}
          </strong>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <span className="text-slate-400 block">Weighted Probability:</span>
          <strong className="text-lg text-emerald-400 font-bold mt-0.5 block">
            ${crmStats ? crmStats.weightedPipelineValue.toLocaleString() : '21,400'}
          </strong>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <span className="text-slate-400 block">Active Contacts:</span>
          <strong className="text-lg text-blue-400 font-bold mt-0.5 block">
            {contacts.length}
          </strong>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <span className="text-slate-400 block">Pending Tasks:</span>
          <strong className="text-lg text-amber-400 font-bold mt-0.5 block">
            {tasks.filter(t => t.status !== 'completed').length}
          </strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-2">
          {[
            { id: 'pipeline', label: 'Deals Kanban Pipeline', icon: Kanban, count: leads.length },
            { id: 'contacts', label: 'Contacts Directory', icon: UserCheck, count: contacts.length },
            { id: 'tasks', label: 'Tasks & Follow-ups', icon: CheckSquare, count: tasks.filter(t => t.status !== 'completed').length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'contacts' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCsvModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 font-semibold flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 font-semibold flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Deals Kanban Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanStages.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage.key);
            const stageValue = stageLeads.reduce((acc, curr) => acc + Number(curr.value), 0);
            return (
              <div key={stage.key} className={`p-4 rounded-3xl border ${stage.color} flex flex-col min-h-[460px]`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <span className="font-bold text-xs text-white uppercase font-mono">{stage.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-800">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 pt-2 mb-3">
                  ${stageValue.toLocaleString()}
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-2xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 shadow-md space-y-2 text-left"
                    >
                      <div className="font-bold text-xs text-slate-100">{lead.title}</div>
                      <div className="text-[11px] text-slate-400">{lead.company} • {lead.contact_name}</div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <span className="font-mono font-bold text-emerald-400">${Number(lead.value).toLocaleString()}</span>
                        
                        {/* Quick Stage Mover Dropdown */}
                        <select
                          value={lead.stage}
                          onChange={(e) => handleUpdateLeadStage(lead.id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-mono focus:outline-none"
                        >
                          <option value="new">Move: New</option>
                          <option value="qualified">Move: Qualified</option>
                          <option value="proposal">Move: Proposal</option>
                          <option value="negotiation">Move: Negotiation</option>
                          <option value="won">Move: Won ✓</option>
                          <option value="lost">Move: Lost ✕</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Contacts Directory */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Company & Title</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Lead Score</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{c.company}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.title}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.phone || '—'}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                        {c.lead_score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={async () => {
                          if (confirm('Delete contact?')) {
                            await api.deleteContact(c.id);
                            loadData();
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tasks Checklist */}
      {activeTab === 'tasks' && (
        <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-sm text-white">Follow-up Tasks & Action Checklist</span>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs"
            >
              + Create Task
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <div className={`text-xs font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </div>
                      {task.related_to && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Related: {task.related_to}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={async () => {
                        await api.deleteTask(task.id);
                        loadData();
                      }}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Create New Deal / Lead</span>
              <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  value={lTitle}
                  onChange={(e) => setLTitle(e.target.value)}
                  placeholder="e.g. Annual Agency Automation License"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={lCompany}
                  onChange={(e) => setLCompany(e.target.value)}
                  placeholder="e.g. Apex Marketing Labs"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Primary Contact</label>
                  <input
                    type="text"
                    required
                    value={lContact}
                    onChange={(e) => setLContact(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                    placeholder="elena@apex.io"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    required
                    value={lValue}
                    onChange={(e) => setLValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={lProbability}
                    onChange={(e) => setLProbability(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md mt-2"
              >
                Create Deal in Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Import Contacts from CSV</span>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste standard comma-separated text containing First Name, Last Name, Email, Phone, Company, Title:
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200 focus:outline-none"
            />

            <button
              onClick={handleImportCsv}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
            >
              Parse & Import Contacts
            </button>
          </div>
        </div>
      )}

      {/* Create Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Add CRM Contact</span>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={cFirst}
                    onChange={(e) => setCFirst(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={cLast}
                    onChange={(e) => setCLast(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={cCompany}
                    onChange={(e) => setCCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md mt-2"
              >
                Save Contact
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Add Follow-Up Task</span>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Description</label>
                <input
                  type="text"
                  required
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  placeholder="e.g. Schedule discovery interview with Marcus Vance"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Related Company / Lead</label>
                <input
                  type="text"
                  value={tRelated}
                  onChange={(e) => setTRelated(e.target.value)}
                  placeholder="HyperGrowth Media"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Priority</label>
                <select
                  value={tPriority}
                  onChange={(e) => setTPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md mt-2"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
