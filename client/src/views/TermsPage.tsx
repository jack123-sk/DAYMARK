import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <nav className="border-b border-slate-800/80 bg-[#070b14]/90 px-6 py-4 flex items-center justify-between">
        <button onClick={() => onNavigate('/')} className="flex items-center text-xs text-slate-300 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
        </button>
        <span className="text-xs font-mono text-slate-500">Legal • Last Updated: October 2026</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-8 leading-relaxed text-slate-300 text-sm">
        <div className="flex items-center space-x-3 text-blue-400">
          <FileText className="w-8 h-8" />
          <h1 className="text-3xl font-bold text-white">DAYMARK Terms of Service</h1>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. Commercial Principle & No Income Guarantees</h2>
          <p>
            DAYMARK OS provides business automation infrastructure, opportunity hypothesis scoring, and CRM capabilities. We optimize for genuine customer value and operational efficiency. We explicitly do not guarantee any specific revenue target, customer count, deal close rate, or valuation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. Permitted Use & Anti-Abuse Provisions</h2>
          <p>
            Users agree not to use DAYMARK OS for unsolicited bulk communications (spam), phishing, deceptive lead generation, or attempting to compromise third-party systems. Any violation results in immediate workspace revocation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Human Review of Autonomous Actions</h2>
          <p>
            While our AI assistant adapters draft proposals, summarize discovery, and structure operational milestones, you agree that you are solely responsible for reviewing and authorizing all consequential external dispatches, contracts, and financial payments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. Subscriptions, Invoicing & Cancellations</h2>
          <p>
            Paid subscriptions renew on the designated monthly or annual billing cycle. You may downgrade or cancel your subscription at any time via the Billing dashboard.
          </p>
        </section>
      </main>
    </div>
  );
};
