import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Bot, 
  GitBranch, 
  Lightbulb, 
  Play, 
  Check, 
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { demoLogin } = useAuth();
  const [teamSize, setTeamSize] = useState(8);
  const [hoursPerWeekPerPerson, setHoursPerWeekPerPerson] = useState(12);

  // ROI Calculator
  const totalHoursWastedMonthly = teamSize * hoursPerWeekPerPerson * 4;
  const estimatedCostWastedMonthly = totalHoursWastedMonthly * 45; // $45/hr average
  const daymarkSavingsMonthly = Math.round(estimatedCostWastedMonthly * 0.72); // 72% automation factor

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Public Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-extrabold text-white text-lg">D</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">DAYMARK <span className="text-xs text-blue-400 font-mono font-medium">OS</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <button onClick={() => onNavigate('/features')} className="hover:text-blue-400 transition-colors">Features</button>
            <button onClick={() => onNavigate('/pricing')} className="hover:text-blue-400 transition-colors">Pricing</button>
            <button onClick={() => onNavigate('/use-cases')} className="hover:text-blue-400 transition-colors">Use Cases</button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => demoLogin().then(() => onNavigate('/app/dashboard'))}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
          >
            <Play className="w-3 h-3 fill-emerald-400" />
            <span>1-Click Founder Demo</span>
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('/signup')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-cyan-500/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-blue-300 font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Global AI Business Automation Infrastructure</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-slate-400">v1.0 Production OS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
          Turn business opportunities into <span className="gradient-text">completed work</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          DAYMARK OS unifies opportunity discovery, autonomous proposal generation, human-approval workflows, and customer relationship management into one intelligent workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('/signup')}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => demoLogin().then(() => onNavigate('/app/dashboard'))}
            className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center space-x-2 transition-all"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Launch Live Interactive Demo</span>
          </button>
        </div>

        <div className="mt-8 flex items-center space-x-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> No credit card required</span>
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Human-in-the-loop safety</span>
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Multi-tenant data isolated</span>
        </div>

        {/* Live Interactive Workflow Preview Card */}
        <div className="mt-14 w-full bg-[#0c1220] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 font-mono pl-2">daymark-engine // live-intake-automation.ts</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Engine Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">STEP 1 • TRIGGER</div>
              <div className="font-semibold text-slate-100 text-sm mt-1">Inbound Enquiry</div>
              <div className="text-xs text-slate-400 mt-2">Validated Elena Rostova ($4,800 Retainer)</div>
              <div className="mt-3 flex items-center text-xs text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5 mr-1" /> Contact enriched
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">STEP 2 • AI AGENT</div>
              <div className="font-semibold text-slate-100 text-sm mt-1">Scope Synthesis</div>
              <div className="text-xs text-slate-400 mt-2">Sales Assistant drafted tailored proposal</div>
              <div className="mt-3 flex items-center text-xs text-cyan-400 font-medium">
                <Bot className="w-3.5 h-3.5 mr-1" /> 74% win probability
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 relative">
              <div className="text-xs text-amber-400 font-mono flex items-center justify-between">
                <span>STEP 3 • SAFETY GATE</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <div className="font-semibold text-amber-200 text-sm mt-1">Human Approval</div>
              <div className="text-xs text-slate-300 mt-2">Requires founder sign-off before dispatch</div>
              <div className="mt-3 text-xs text-amber-300 font-medium">
                Operator Verified ✓
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-mono">STEP 4 • CRM SYNC</div>
              <div className="font-semibold text-slate-100 text-sm mt-1">Deal Progression</div>
              <div className="text-xs text-slate-400 mt-2">Stage moved to Proposal ($4,800 Pipeline)</div>
              <div className="mt-3 flex items-center text-xs text-blue-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> MRR tracked
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section className="py-20 px-6 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">Interactive Unit Economics</span>
            <h2 className="text-3xl font-bold text-white mt-2">Calculate your team's automation savings</h2>
            <p className="text-sm text-slate-400 mt-2">See how much billable capacity your agency or business reclaims with DAYMARK OS.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#0d1322] border border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200 mb-2">
                  <span>Team Size (Staff)</span>
                  <span className="text-blue-400 font-mono text-base">{teamSize} members</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-slate-200 mb-2">
                  <span>Manual Hours / Person / Week</span>
                  <span className="text-blue-400 font-mono text-base">{hoursPerWeekPerPerson} hrs</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={hoursPerWeekPerPerson}
                  onChange={(e) => setHoursPerWeekPerPerson(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-500 mt-1 block">Time spent on intake emails, follow-ups, proposal drafts & CRM updates.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 via-slate-900/80 to-purple-900/20 border border-blue-500/20 text-center space-y-4">
              <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Projected Monthly Savings</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                ${daymarkSavingsMonthly.toLocaleString()}<span className="text-base text-slate-400 font-normal">/mo</span>
              </div>
              <div className="text-xs text-slate-300">
                Reclaims <span className="text-emerald-400 font-semibold">{Math.round(totalHoursWastedMonthly * 0.72)} hours</span> of billable team focus each month.
              </div>
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                Claim Your Savings Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Core Engines Breakdown */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">Unified Infrastructure</span>
          <h2 className="text-3xl font-bold text-white mt-2">The complete business automation stack</h2>
          <p className="text-sm text-slate-400 mt-2">Replace 6 fragmented point-solutions with one integrated operating system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'DAYMARK Opportunity Engine', desc: 'Identify verified B2B customer problems, compute composite scores, and plan customer discovery.', icon: Lightbulb, color: 'text-amber-400' },
            { title: 'AI Business Builder', desc: 'Transform natural language project descriptions into full business plans, positioning, and safe templates.', icon: Sparkles, color: 'text-cyan-400' },
            { title: 'Visual Workflow Builder', desc: 'Connect triggers, actions, and mandatory human sign-off gates to eliminate manual bottlenecks.', icon: GitBranch, color: 'text-blue-400' },
            { title: 'DAYMARK CRM', desc: 'Manage contacts, track deal pipelines on a Kanban board, and synchronize client activity automatically.', icon: Users, color: 'text-emerald-400' },
            { title: '6 Controlled AI Agents', desc: 'Research, Marketing, Sales, Support, Operations, and Analytics Assistants with explicit permissions.', icon: Bot, color: 'text-purple-400' },
            { title: 'Global Connect Directory', desc: 'Discover enterprise partners, suppliers, and buyers worldwide with approval-gated outreach.', icon: Globe, color: 'text-indigo-400' },
            { title: 'Revenue Intelligence', desc: 'Track MRR, CAC/LTV, hours saved, and run 3-scenario financial models (Conservative/Base/Optimistic).', icon: TrendingUp, color: 'text-pink-400' },
            { title: 'Blueprint Marketplace', desc: 'Install pre-vetted automation templates for agency onboarding, churn prevention, and lead qualification.', icon: Zap, color: 'text-yellow-400' },
            { title: 'Enterprise Governance', desc: 'Multi-tenant isolation, cryptographically signed webhooks, and exhaustive audit logs.', icon: ShieldCheck, color: 'text-teal-400' }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group">
                <div className={`p-3 rounded-xl bg-slate-800/80 w-fit mb-4 ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-100 text-base group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-12 px-6 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">D</div>
            <span className="font-semibold text-slate-200">DAYMARK OS</span>
            <span>— "Turn business opportunities into completed work."</span>
          </div>

          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('/features')} className="hover:text-slate-200">Features</button>
            <button onClick={() => onNavigate('/pricing')} className="hover:text-slate-200">Pricing</button>
            <button onClick={() => onNavigate('/privacy')} className="hover:text-slate-200">Privacy Policy</button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-slate-200">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
