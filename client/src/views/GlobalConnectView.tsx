import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  Building, 
  Mail, 
  ShieldCheck, 
  X,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import { GlobalCompany } from '../types';

export const GlobalConnectView: React.FC = () => {
  const [companies, setCompanies] = useState<GlobalCompany[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [loading, setLoading] = useState(true);

  // Outreach Draft Modal
  const [selectedCompany, setSelectedCompany] = useState<GlobalCompany | null>(null);
  const [outreachDraft, setOutreachDraft] = useState<any | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  const loadCompanies = async () => {
    try {
      const res = await api.getCompanies({
        search,
        region,
        industry
      });
      setCompanies(res.companies || []);
    } catch (err) {
      console.error('[Global Connect Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [search, region, industry]);

  const handleOpenDraft = async (c: GlobalCompany) => {
    setSelectedCompany(c);
    setDrafting(true);
    setDispatchedSuccess(false);

    try {
      const res = await api.draftOutreach({
        companyId: c.id,
        companyName: c.name,
        contactEmail: c.contact_email,
        partnershipType: c.partnership_type
      });
      setOutreachDraft(res.draft);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDrafting(false);
    }
  };

  const handleApproveAndDispatch = async () => {
    if (!selectedCompany) return;
    try {
      await api.updateCompanyStatus(selectedCompany.id, 'outreach_approved_and_queued');
      setDispatchedSuccess(true);
      await loadCompanies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
          <Globe className="w-4 h-4" />
          <span>DAYMARK GLOBAL CONNECT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          B2B Enterprise Partner & Client Directory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Lawful, verified commercial directory for discovery, supplier partnerships, and agency reselling. Mandatory review before external outreach.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, country, partner type..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
          >
            <option value="all">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="Asia Pacific">Asia Pacific</option>
            <option value="Australia/NZ">Australia/NZ</option>
            <option value="Nordics">Nordics</option>
          </select>

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
          >
            <option value="all">All Industries</option>
            <option value="Enterprise SaaS">Enterprise SaaS</option>
            <option value="Growth Agency">Growth Agency</option>
            <option value="Supply Chain Tech">Supply Chain Tech</option>
            <option value="Creative Agency">Creative Agency</option>
            <option value="Financial Software">Financial Software</option>
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((c) => (
          <div key={c.id} className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{c.country} • {c.region}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                  {c.relevance_score}% Match
                </span>
              </div>

              <div className="mt-3">
                <div className="font-bold text-base text-white">{c.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.industry} • Size: {c.size} staff</div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Partnership Type:</span>
                  <span className="font-semibold text-slate-200">{c.partnership_type}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Verified Contact:</span>
                  <span className="text-cyan-400">{c.contact_email}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                c.outreach_status === 'uncontacted' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {c.outreach_status.replace(/_/g, ' ')}
              </span>

              <button
                onClick={() => handleOpenDraft(c)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Draft Outreach</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Outreach Approval & Review Modal */}
      {selectedCompany && outreachDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0d1322] border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" /> B2B Partner Outreach Sign-Off
              </span>
              <button onClick={() => setSelectedCompany(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {dispatchedSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="text-base font-bold text-emerald-300">Outreach Approved & Queued</div>
                <p className="text-xs text-slate-300">
                  Your personalized outreach draft has been authorized and queued for delivery to <strong>{selectedCompany.contact_email}</strong>.
                </p>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="mt-4 px-6 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div><strong className="text-slate-400">Target Partner:</strong> {outreachDraft.companyName}</div>
                  <div><strong className="text-slate-400">Recipient:</strong> {outreachDraft.recipient}</div>
                  <div><strong className="text-slate-400">Subject:</strong> {outreachDraft.subject}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Generated Draft Body (Editable):</label>
                  <textarea
                    rows={6}
                    value={outreachDraft.body}
                    onChange={(e) => setOutreachDraft({ ...outreachDraft, body: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 font-sans focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <span>Mandatory Sign-off: No unsolicited mass spam. We require individual authorization.</span>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveAndDispatch}
                    className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize & Queue Outreach</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
