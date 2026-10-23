import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Layers, 
  Users, 
  Target, 
  Globe, 
  CreditCard, 
  ListChecks, 
  AlertTriangle, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { api } from '../api/client';
import { BusinessProject } from '../types';

export const BusinessBuilderView: React.FC = () => {
  const [projects, setProjects] = useState<BusinessProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<BusinessProject | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'personas' | 'positioning' | 'landing' | 'pricing' | 'checklist' | 'risks'>('plan');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Intake Prompt Form State
  const [prompt, setPrompt] = useState('Build an automated client intake, proposal drafting, and SLA tracking OS for independent marketing agencies');
  const [projectName, setProjectName] = useState('AgencyFlow Automation Hub');
  const [industry, setIndustry] = useState('B2B Marketing & Creative');
  const [targetAudience, setTargetAudience] = useState('Digital Agency Founders & Ops Directors');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.projects || []);
      if (res.projects && res.projects.length > 0 && !selectedProject) {
        setSelectedProject(res.projects[0]);
      }
    } catch (err) {
      console.error('[Projects Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !projectName.trim()) return;
    setGenerating(true);

    try {
      const res = await api.generateProject({
        name: projectName,
        prompt,
        industry,
        targetAudience
      });
      await loadProjects();
      setSelectedProject(res.project);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      await loadProjects();
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>DAYMARK AI BUSINESS BUILDER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Autonomous Business & Campaign Synthesis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Describe any business in natural language. Our controlled models generate structured business plans, customer personas, pricing tiers, landing pages, and operational checklists.
        </p>
      </div>

      {/* Generation Intake Prompt Bar */}
      <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 shadow-xl space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. AgencyFlow Automation Hub"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Industry</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. B2B Professional Services"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
              <input
                type="text"
                required
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Boutique Agencies (5-20 staff)"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Business Vision & Core Offering (Natural Language)</label>
            <div className="relative">
              <textarea
                required
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your business problem, proposed solution, and commercial proposition..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 leading-relaxed pr-24"
              />
              <button
                type="submit"
                disabled={generating}
                className="absolute right-3 bottom-4 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>{generating ? 'Synthesizing...' : 'Generate Assets'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Workspace: Project Selector & Asset Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Projects List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-slate-400 font-semibold uppercase px-1">Saved Projects</div>
          {projects.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0c1220] border border-slate-800 text-center text-xs text-slate-500">
              No business projects generated yet. Enter a prompt above to build one.
            </div>
          ) : (
            projects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/5'
                      : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{proj.industry}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {new Date(proj.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white mt-1.5 truncate">{proj.name}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Tabbed Assets Viewer */}
        <div className="lg:col-span-8">
          {selectedProject ? (
            <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-6">
              {/* Project Title Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedProject.industry} • {selectedProject.target_audience}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedProject.generated_assets, null, 2))}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 flex items-center space-x-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{copiedNotice ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedProject.id)}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:text-red-400 text-slate-400"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
                {[
                  { id: 'plan', label: 'Business Plan', icon: Layers },
                  { id: 'personas', label: 'Customer Personas', icon: Users },
                  { id: 'positioning', label: 'Positioning & Copy', icon: Target },
                  { id: 'landing', label: 'Landing Page Preview', icon: Globe },
                  { id: 'pricing', label: 'Pricing Hypotheses', icon: CreditCard },
                  { id: 'checklist', label: 'Launch Checklist', icon: ListChecks },
                  { id: 'risks', label: 'Risk Assessment', icon: AlertTriangle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Business Plan */}
              {activeTab === 'plan' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Executive Summary</div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {selectedProject.generated_assets.businessPlan.executiveSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mission Statement</div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedProject.generated_assets.businessPlan.mission}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue Model</div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedProject.generated_assets.businessPlan.revenueModel}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Customer Personas */}
              {activeTab === 'personas' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                  {selectedProject.generated_assets.customerPersonas.map((p, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                          P{idx + 1}
                        </div>
                        <div className="font-bold text-sm text-white">{p.role}</div>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1.5">
                        <div><strong className="text-slate-400">Core Pain Point:</strong> {p.painPoint}</div>
                        <div><strong className="text-slate-400">Buying Trigger:</strong> {p.buyingTrigger}</div>
                        <div><strong className="text-slate-400">Budget Authority:</strong> {p.budgetAuthority}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Positioning */}
              {activeTab === 'positioning' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Headline & Tagline</div>
                    <div className="text-lg font-bold text-white">{selectedProject.generated_assets.positioning.headline}</div>
                    <p className="text-xs text-slate-300">{selectedProject.generated_assets.positioning.tagline}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Differentiators</div>
                    <ul className="space-y-2">
                      {selectedProject.generated_assets.positioning.differentiators.map((diff, i) => (
                        <li key={i} className="flex items-center text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mr-2 flex-shrink-0" />
                          <span>{diff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 4: Safe Landing Page Preview */}
              {activeTab === 'landing' && (
                <div className="p-6 rounded-3xl bg-[#070b14] border border-slate-700/80 space-y-6 text-center animate-in fade-in duration-150">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-mono">
                    Safe Template Preview
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white max-w-xl mx-auto leading-tight">
                    {selectedProject.generated_assets.landingPage.heroTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                    {selectedProject.generated_assets.landingPage.heroSubtitle}
                  </p>
                  <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30">
                    {selectedProject.generated_assets.landingPage.ctaText}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800 text-left">
                    {selectedProject.generated_assets.landingPage.features.map((f, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                        <div className="text-xs font-bold text-white mb-1">{f.title}</div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Pricing Hypotheses */}
              {activeTab === 'pricing' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-150">
                  {selectedProject.generated_assets.pricingHypotheses.map((price, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{price.tier}</div>
                        <div className="text-2xl font-extrabold text-blue-400 mt-2">{price.price}</div>
                        <div className="text-[11px] text-slate-400 mt-1 mb-4">{price.audience}</div>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {price.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 6: Operational Checklist */}
              {activeTab === 'checklist' && (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  {selectedProject.generated_assets.operationalChecklist.map((item) => (
                    <div key={item.step} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                          {item.step}
                        </span>
                        <span className="text-xs font-medium text-slate-200">{item.task}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{item.timeEst}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 7: Risk Assessment */}
              {activeTab === 'risks' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {selectedProject.generated_assets.businessRisks.map((risk, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{risk.risk}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                          risk.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {risk.severity} Severity
                        </span>
                      </div>
                      <div className="text-xs text-slate-300"><strong className="text-slate-400">Mitigation Strategy:</strong> {risk.mitigation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#0c1220] border border-slate-800 text-center text-slate-500">
              Select or generate a business project to inspect synthesized assets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
