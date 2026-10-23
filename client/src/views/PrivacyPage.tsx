import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
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
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-3xl font-bold text-white">DAYMARK Privacy Policy</h1>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. Multi-Tenant Data Isolation</h2>
          <p>
            DAYMARK OS operates under strict logical multi-tenancy. All database tables, customer relationship records, workflow execution states, and AI prompt logs are filtered through mandatory organizational tenant identifiers (<code>organization_id</code>). We enforce parameterized queries to prevent cross-tenant data leakage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. AI Data Usage & Zero Model Training</h2>
          <p>
            Your proprietary CRM notes, proposal drafts, opportunity research, and client contact information are never used to train public foundational AI models. When model credentials are configured, prompts are transmitted strictly via zero-data-retention enterprise API endpoints.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Third-Party Integrations & Approval Gates</h2>
          <p>
            External outbound actions—such as customer email dispatches or payment provider updates—are held in our execution queue pending verified human sign-off. We never scrape websites in violation of their Terms of Service or harvest private contact credentials.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. Data Deletion & Portability</h2>
          <p>
            You retain 100% ownership of your business data. Contacts may be exported at any time via CSV, and you may permanently delete your organization workspace upon request.
          </p>
        </section>
      </main>
    </div>
  );
};
