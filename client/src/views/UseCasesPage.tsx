import React from 'react';
import { Users, Briefcase, Truck, ShoppingCart, Code2, ArrowRight } from 'lucide-react';

interface UseCasesPageProps {
  onNavigate: (route: string) => void;
}

export const UseCasesPage: React.FC<UseCasesPageProps> = ({ onNavigate }) => {
  const useCases = [
    {
      category: 'Primary Initial Segment (Beachhead)',
      title: 'Digital Marketing & Web Development Agencies',
      icon: Users,
      badge: 'Highest ROI Segment',
      color: 'border-blue-500/40 bg-blue-500/5',
      problem: 'Agencies spend 25+ billable hours/week copying client intake briefs, manually qualifying leads, and drafting repetitive scope proposals.',
      solution: 'DAYMARK OS automatically enriches incoming inquiries, drafts custom technical proposals using the Sales Assistant, and gates every dispatch behind founder sign-off before progressing deals in the CRM.',
      metrics: '72% faster proposal cycle • 18 hours/week saved per account director.'
    },
    {
      category: 'Strategic Expansion',
      title: 'Boutique Management & Growth Consultancies',
      icon: Briefcase,
      badge: 'High Willingness to Pay',
      color: 'border-slate-800 bg-slate-900/50',
      problem: 'Partners spend countless unbillable hours conducting preliminary secondary market research and compiling executive interview guides.',
      solution: 'Nexora Opportunity Engine generates structured hypothesis scoring cards, TAM sizing estimates, and structured interview guides in under 3 minutes.',
      metrics: '4x faster client onboarding • 90%+ client discovery alignment.'
    },
    {
      category: 'Enterprise Operations',
      title: 'Freight Brokers & Regional Logistics Forwarders',
      icon: Truck,
      badge: 'High Automation Volume',
      color: 'border-slate-800 bg-slate-900/50',
      problem: 'Heterogeneous carrier bills of lading require manual operator verification, causing invoice reconciliation delays and late payment disputes.',
      solution: 'Automated document extraction pipeline paired with human exception approvals directly synching to organizational accounting queues.',
      metrics: '3-day payment cycle reduction • Zero unreviewed dispatches.'
    },
    {
      category: 'E-Commerce & Digital Brands',
      title: 'Direct-to-Consumer Product Sellers',
      icon: ShoppingCart,
      badge: 'Scalable Templates',
      color: 'border-slate-800 bg-slate-900/50',
      problem: 'Solo sellers struggle to synthesize competitive product positioning, customer support FAQ coverage, and launch checklists.',
      solution: 'AI Business Builder produces complete marketing copy drafts, support FAQ matrices, and operational milestone checklists from natural language prompts.',
      metrics: 'Launch ready in 48 hours instead of 4 weeks.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <nav className="border-b border-slate-800/80 bg-[#070b14]/90 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">D</div>
          <span className="font-bold text-lg text-white">DAYMARK <span className="text-xs text-blue-400 font-mono">OS</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => onNavigate('/')} className="text-sm text-slate-300 hover:text-white">Home</button>
          <button onClick={() => onNavigate('/features')} className="text-sm text-slate-300 hover:text-white">Features</button>
          <button onClick={() => onNavigate('/pricing')} className="text-sm text-slate-300 hover:text-white">Pricing</button>
          <button onClick={() => onNavigate('/signup')} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">Start Free</button>
        </div>
      </nav>

      <header className="py-16 px-6 max-w-4xl mx-auto text-center">
        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase font-mono">Tailored Automation</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3">Built for real business workflows</h1>
        <p className="text-sm sm:text-base text-slate-400 mt-4 max-w-2xl mx-auto">
          We designed DAYMARK OS specifically around acute, frequent operational bottlenecks where automation creates immediate, measurable ROI.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-8">
        {useCases.map((uc, i) => {
          const Icon = uc.icon;
          return (
            <div key={i} className={`p-8 rounded-3xl border ${uc.color} transition-all`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-slate-900 text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-500 uppercase">{uc.category}</span>
                    <h2 className="text-xl font-bold text-white">{uc.title}</h2>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold font-mono">
                  {uc.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">The Painful Bottleneck:</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{uc.problem}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">The DAYMARK OS Solution:</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{uc.solution}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs font-medium text-slate-300">
                  <span className="text-blue-400 font-semibold font-mono">Validated Impact:</span> {uc.metrics}
                </div>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl flex items-center transition-all"
                >
                  Deploy This Solution <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
