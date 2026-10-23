import React, { useState } from 'react';
import { Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (route: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [annual, setAnnual] = useState(false);

  const tiers = [
    {
      name: 'Free / Community',
      price: '$0',
      period: 'forever',
      desc: 'For solo creators exploring AI business automation and hypothesis scoring.',
      limits: '1 Project • 50 Runs/mo • 10k AI Tokens • 1 Seat',
      features: [
        '1 Active Business Project',
        'Basic Nexora Hypothesis Scoring',
        '50 Workflow Runs per month',
        '10,000 AI Tokens monthly',
        'Basic CRM Contacts (100 max)',
        'Community Knowledge Base'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Starter Automation',
      price: annual ? '$39' : '$49',
      period: 'per month',
      desc: 'For boutique consultants automating lead intake and client scoping.',
      limits: '5 Projects • 500 Runs/mo • 150k AI Tokens • 3 Seats',
      features: [
        '5 Active Business Projects',
        'Full Nexora Opportunity Engine',
        '500 Workflow Runs per month',
        '150,000 AI Tokens monthly',
        '1,000 CRM Contacts & Deals',
        'Email & Webhook Triggers',
        'Standard Email Support'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false
    },
    {
      name: 'Professional Agency OS',
      price: annual ? '$119' : '$149',
      period: 'per month',
      desc: 'Our flagship tier for marketing, web, and growth agencies scaling client retainers.',
      limits: '25 Projects • 3,000 Runs/mo • 750k AI Tokens • 10 Seats',
      features: [
        '25 Active Business Projects',
        'Human-in-the-Loop Approval Gates',
        '3,000 Workflow Runs per month',
        '750,000 AI Tokens monthly',
        '10,000 CRM Contacts & Kanban Board',
        'Full 6-Agent AI Assistant Suite',
        'Global Connect Partner Directory',
        'Revenue Intelligence & Sensitivity Modeling',
        'Priority SLA Support'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Business Scale',
      price: annual ? '$319' : '$399',
      period: 'per month',
      desc: 'For multi-partner firms requiring advanced automation throughput and audit trails.',
      limits: '100 Projects • 15,000 Runs/mo • 3M Tokens • 30 Seats',
      features: [
        '100 Active Business Projects',
        '15,000 Workflow Runs per month',
        '3,000,000 AI Tokens monthly',
        '50,000 CRM Contacts & Custom Fields',
        '30 Team Member Seats with RBAC',
        'Enterprise Audit Logging',
        'Custom Webhooks & SMTP Integration',
        'Dedicated Customer Success Lead'
      ],
      cta: 'Upgrade to Business',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#070b14]/90 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">D</div>
          <span className="font-bold text-lg text-white">DAYMARK <span className="text-xs text-blue-400 font-mono">OS</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => onNavigate('/')} className="text-sm text-slate-300 hover:text-white">Home</button>
          <button onClick={() => onNavigate('/features')} className="text-sm text-slate-300 hover:text-white">Features</button>
          <button onClick={() => onNavigate('/signup')} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">Get Started Free</button>
        </div>
      </nav>

      {/* Hero & Billing Toggle */}
      <header className="py-16 px-6 max-w-4xl mx-auto text-center">
        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">Predictable Investment</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3">Simple pricing with no hidden surprises</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-4 max-w-2xl mx-auto">
          Scale your business automation with confidence. All plans include multi-tenant data isolation, verified webhook reconciliation, and zero arbitrary markups.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-slate-400'}`}>Monthly billing</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-1 flex items-center transition-colors focus:outline-none"
          >
            <div className={`w-4 h-4 rounded-full bg-blue-500 transition-transform ${annual ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-1.5 ${annual ? 'text-white' : 'text-slate-400'}`}>
            Annual billing <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold uppercase">Save 20%</span>
          </span>
        </div>
      </header>

      {/* Pricing Cards Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={`p-6 rounded-3xl flex flex-col justify-between transition-all relative ${
              tier.popular
                ? 'bg-[#0f172a] border-2 border-blue-500 shadow-2xl shadow-blue-500/10'
                : 'bg-[#0c1220] border border-slate-800 hover:border-slate-700'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-bold text-white tracking-wider uppercase shadow-md">
                Most Popular for Agencies
              </div>
            )}

            <div>
              <div className="text-lg font-bold text-white">{tier.name}</div>
              <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{tier.desc}</p>

              <div className="mt-4 flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                <span className="text-xs text-slate-400 font-mono">/{tier.period}</span>
              </div>

              <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                {tier.limits}
              </div>

              <div className="my-6 border-t border-slate-800" />

              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Included Capabilities:</div>
              <ul className="space-y-2.5">
                {tier.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onNavigate('/signup')}
              className={`mt-8 w-full py-3 rounded-xl font-semibold text-xs transition-all ${
                tier.popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </main>
    </div>
  );
};
