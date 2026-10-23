import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, User, Filter } from 'lucide-react';
import { api } from '../api/client';
import { AuditLog } from '../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const res = await api.getAuditLogs(100);
      setLogs(res.logs || []);
    } catch (err) {
      console.error('[Audit Logs Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user_email.toLowerCase().includes(search.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>SECURITY & COMPLIANCE LEDGER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Immutable Audit Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Every state modification, workflow trigger, approval decision, and invitation is recorded with actor IP and timestamps.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter logs by action, user, or detail..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Actor Email</th>
              <th className="py-3 px-4">Resource Type</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">Client IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/40">
                <td className="py-3 px-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                <td className="py-3 px-4 font-bold text-white">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">{log.user_email}</td>
                <td className="py-3 px-4 text-slate-400 capitalize">{log.resource_type}</td>
                <td className="py-3 px-4 text-slate-200 font-sans max-w-xs truncate">{log.details || '—'}</td>
                <td className="py-3 px-4 text-slate-500">{log.ip_address || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
