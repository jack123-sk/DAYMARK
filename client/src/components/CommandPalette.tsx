import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Lightbulb, 
  Sparkles, 
  GitBranch, 
  Users, 
  Bot, 
  Globe, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: 'Executive Dashboard', route: '/app/dashboard', icon: TrendingUp, cat: 'Core' },
    { label: 'Nexora Opportunity Engine', route: '/app/opportunities', icon: Lightbulb, cat: 'Core' },
    { label: 'AI Business Builder', route: '/app/builder', icon: Sparkles, cat: 'Core' },
    { label: 'Workflow Automations & Approvals', route: '/app/workflows', icon: GitBranch, cat: 'Core' },
    { label: 'DAYMARK CRM (Contacts & Deals)', route: '/app/crm', icon: Users, cat: 'Core' },
    { label: 'Specialized AI Agents (6 Assistants)', route: '/app/agents', icon: Bot, cat: 'Core' },
    { label: 'Global Connect Directory', route: '/app/connect', icon: Globe, cat: 'Core' },
    { label: 'Revenue Intelligence & Projections', route: '/app/revenue', icon: TrendingUp, cat: 'Core' },
    { label: 'Agent Marketplace & Blueprints', route: '/app/marketplace', icon: ShoppingBag, cat: 'Core' },
    { label: 'Billing & Subscription Tiers', route: '/app/billing', icon: CreditCard, cat: 'Settings' },
    { label: 'Audit Security Logs', route: '/app/audit-logs', icon: ShieldCheck, cat: 'Settings' },
    { label: 'Integration Settings (API Keys)', route: '/app/integrations', icon: Settings, cat: 'Settings' },
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl mx-4 bg-[#0d1322] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-blue-400 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent border-0 focus:outline-none text-slate-100 placeholder-slate-500 text-sm"
            placeholder="Type a command or jump to module... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No matching modules or actions found.
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.route}
                  onClick={() => {
                    onNavigate(cmd.route);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm hover:bg-blue-600/15 hover:text-blue-300 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-blue-500/20 text-slate-300 group-hover:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-200 group-hover:text-white">{cmd.label}</span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-blue-400/80 uppercase tracking-wider font-mono">
                    {cmd.cat}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
