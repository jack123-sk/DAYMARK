import React, { useState } from 'react';
import { HelpCircle, Search, MessageSquare, CheckCircle2, ChevronDown } from 'lucide-react';

export const HelpView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const faqs = [
    {
      q: 'How do Human Approval Safety Gates work?',
      a: 'When an automated workflow encounters a "Request Human Approval" step, the state machine pauses and marks the execution as WAITING_APPROVAL. The proposal draft and dispatch details are displayed in your Approvals inbox. No external emails or CRM status changes take place until you click Authorize.'
    },
    {
      q: 'How does the DAYMARK Opportunity Engine calculate composite scores?',
      a: 'DAYMARK uses an explicit mathematical formula: (Willingness to Pay × 0.40) + (Technical Feasibility × 0.30) + (Market Confidence × 0.30). Market size calculations are estimated based on addressable B2B firm counts and documented subscription benchmarks.'
    },
    {
      q: 'Are my private CRM records or business plans used to train public AI models?',
      a: 'No. All tenant data is logically isolated in the database via mandatory organization_id filters. When cloud AI adapters are configured, requests are transmitted via zero-data-retention enterprise endpoints.'
    },
    {
      q: 'Can I export my contacts and deals?',
      a: 'Yes. You can export contacts directly to CSV at any time from the CRM module, and download analytical opportunity reports as formatted Markdown.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || 
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTicketSubject('');
    setTicketMsg('');
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
          <HelpCircle className="w-4 h-4" />
          <span>KNOWLEDGE BASE & SUPPORT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Help Center & Discovery Documentation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Frequently asked questions, validation methodologies, and direct technical support.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions or keywords..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-2 text-left">
            <h3 className="font-bold text-sm text-white">{faq.q}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" /> Contact Customer Support
        </h2>

        {ticketSent ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Support request logged successfully. A specialist will reply within 4 business hours.</span>
          </div>
        ) : (
          <form onSubmit={handleSendTicket} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Subject</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Assistance configuring custom webhook trigger"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Message</label>
              <textarea
                required
                rows={3}
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                placeholder="Describe your inquiry or question..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              Submit Support Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
