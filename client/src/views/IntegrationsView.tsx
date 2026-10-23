import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Lock, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../api/client';

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadIntegrations = async () => {
    try {
      const res = await api.getIntegrations();
      setIntegrations(res.integrations || []);
    } catch (err) {
      console.error('[Integrations Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleTestConnection = async (integrationId: string) => {
    setTestingId(integrationId);
    try {
      const res = await api.testIntegration(integrationId);
      setTestResult(prev => ({ ...prev, [integrationId]: `✓ Verified (${res.latencyMs}ms)` }));
    } catch (err: any) {
      setTestResult(prev => ({ ...prev, [integrationId]: `✕ Failed: ${err.message}` }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
          <Settings className="w-4 h-4" />
          <span>CONNECTED PLATFORMS & GATEWAYS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Integration Hub & Credentials Security
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Zero browser key leakage. All provider secrets are stored strictly on the server and verified via health ping checks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400">{item.category}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  item.configured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {item.mode.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-base text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Engine:</span>
                  <span className="text-cyan-300">{item.activeProvider || item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Isolation:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Server-side Only
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400">
                {testResult[item.id] || (item.configured ? 'Connected' : 'Demo Mode Active')}
              </span>

              <button
                onClick={() => handleTestConnection(item.id)}
                disabled={testingId === item.id}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-all"
              >
                <Zap className={`w-3.5 h-3.5 text-blue-400 ${testingId === item.id ? 'animate-spin' : ''}`} />
                <span>{testingId === item.id ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
