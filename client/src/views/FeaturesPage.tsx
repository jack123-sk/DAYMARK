import React from 'react';
import { Lightbulb, Sparkles, GitBranch, Users, Bot, Globe, TrendingUp, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';

interface FeaturesPageProps {
  onNavigate: (route: string) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const deepFeatures = [
    {
      title: 'DAYMARK Opportunity Engine',
      tagline: 'Discover, score, and validate market demand before writing code.',
      icon: Lightbulb,
      color: 'text-amber-400',
      bullets: [
        'Multi-vector hypothesis scoring (Willingness to Pay, Technical Feasibility, Market Confidence)',
        'Built-in structured customer discovery interview script generator',
        'Transparent TAM/SAM market sizing assumptions with zero simulated fluff',
        'One-click exportable analytical opportunity markdown briefs'
      ]
    },
    {
      title: 'AI Business Builder',
      tagline: 'Transform natural language concepts into execution-ready assets.',
      icon: Sparkles,
      color: 'text-cyan-400',
      bullets: [
        'Generates comprehensive business plans, customer personas, and positioning frameworks',
        'Drafts high-converting landing page copy, FAQs, and pricing hypotheses',
        'Constructs operational checklists with realistic milestone estimates',
        'Safe template preview system without executing untrusted arbitrary code'
      ]
    },
    {
      title: 'Workflow Automation & Safety Gates',
      tagline: 'Real visual workflow execution with human approval protection.',
      icon: GitBranch,
      color: 'text-blue-400',
      bullets: [
        'Supports triggers (CRM leads, discovery events, webhooks, schedules)',
        'Mandatory Human-in-the-Loop approval step pauses execution before consequential sends',
        'Idempotency key enforcement to prevent duplicate actions or billing events',
        'Detailed step-by-step execution logs with real-time state tracking'
      ]
    },
    {
      title: 'Integrated CRM & Deal Pipeline',
      tagline: 'Built specifically for high-velocity agencies and B2B services.',
      icon: Users,
      color: 'text-emerald-400',
      bullets: [
        'Contacts, Companies, Deals, Tasks, and Activity logs with full CRUD',
        'Interactive Kanban pipeline board (New, Qualified, Proposal, Negotiation, Won, Lost)',
        'Native CSV import and export for contact lists',
        'Weighted sales pipeline calculations and conversion velocity summaries'
      ]
    },
    {
      title: '6 Controlled AI Assistants',
      tagline: 'Purpose-built agents with explicit permissions and cost accounting.',
      icon: Bot,
      color: 'text-purple-400',
      bullets: [
        'Research, Marketing, Sales, Support, Operations, and Analytics Assistants',
        'Enforced tool boundaries, timeout handling, and token budget ceilings',
        'Transparent execution cost tracking down to the fraction of a cent ($USD)',
        'Zero API key browser exposure and graceful local deterministic fallback'
      ]
    },
    {
      title: 'Revenue Intelligence & Projections',
      tagline: 'Real unit economics, MRR analytics, and sensitivity simulations.',
      icon: TrendingUp,
      color: 'text-pink-400',
      bullets: [
        'Calculates real MRR, ARR, churn rate, and verified customer pipeline value',
        'Automation hours saved tracker with explicit mathematical formulas and hourly rates',
        'Interactive 3-Scenario Financial Projection Model (Conservative, Base, Optimistic)',
        'CAC Payback and LTV sensitivity analysis'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <nav className="border-b border-slate-800/80 bg-[#070b14]/90 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">D</div>
          <span className="font-bold text-lg text-white">DAYMARK <span className="text-xs text-blue-400 font-mono">OS</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => onNavigate('/')} className="text-sm text-slate-300 hover:text-white">Home</button>
          <button onClick={() => onNavigate('/pricing')} className="text-sm text-slate-300 hover:text-white">Pricing</button>
          <button onClick={() => onNavigate('/signup')} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-16 px-6 max-w-4xl mx-auto text-center">
        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">Architecture & Capabilities</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3">An engine engineered for completed work</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
          Explore the eight foundational modules powering DAYMARK OS. Designed from the database schema up to eliminate manual bottlenecks while safeguarding human control.
        </p>
      </header>

      {/* Grid of features */}
      <main className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
        {deepFeatures.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="p-8 rounded-3xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className={`p-3.5 rounded-2xl bg-slate-900 w-fit mb-4 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">{f.title}</h2>
                <p className="text-xs text-slate-400 mt-1 mb-6">{f.tagline}</p>

                <ul className="space-y-3">
                  {f.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">Production Ready</span>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center"
                >
                  Experience Module <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
