import React from 'react';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Sparkles, 
  GitBranch, 
  Users, 
  Bot, 
  Globe, 
  TrendingUp, 
  ShoppingBag, 
  Bell, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  UserCheck, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, pendingApprovalsCount = 0 }) => {
  const { user, organization, logout } = useAuth();

  const primaryNav = [
    { label: 'Dashboard', route: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Opportunity Engine', route: '/app/opportunities', icon: Lightbulb, badge: 'Nexora' },
    { label: 'Business Builder', route: '/app/builder', icon: Sparkles, badge: 'AI' },
    { label: 'Workflow Automation', route: '/app/workflows', icon: GitBranch, alertCount: pendingApprovalsCount },
    { label: 'CRM & Pipeline', route: '/app/crm', icon: Users },
    { label: 'AI Agents Suite', route: '/app/agents', icon: Bot, count: '6' },
    { label: 'Global Connect', route: '/app/connect', icon: Globe },
    { label: 'Revenue Intelligence', route: '/app/revenue', icon: TrendingUp },
    { label: 'Agent Marketplace', route: '/app/marketplace', icon: ShoppingBag },
  ];

  const secondaryNav = [
    { label: 'Notifications', route: '/app/notifications', icon: Bell },
    { label: 'Billing & Plan', route: '/app/billing', icon: CreditCard },
    { label: 'Team & Roles', route: '/app/team', icon: UserCheck },
    { label: 'Integrations', route: '/app/integrations', icon: Settings },
    { label: 'Audit Security Logs', route: '/app/audit-logs', icon: ShieldCheck },
    { label: 'Profile Settings', route: '/app/profile', icon: Settings },
    { label: 'Help & Knowledge', route: '/app/help', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Top Workspace Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-3 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-lg tracking-wider">D</span>
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                DAYMARK <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">OS</span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-[130px]">
                {organization?.name || 'Workspace'}
              </div>
            </div>
          </button>
        </div>

        {/* Plan & Entitlement Status Pill */}
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {organization?.planTier || 'Starter'} Tier
            </span>
          </div>
          <button 
            onClick={() => onNavigate('/app/billing')}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center"
          >
            Manage <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Automation Modules
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.alertCount !== undefined && item.alertCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 animate-bounce">
                    {item.alertCount}
                  </span>
                )}
                {item.badge && !item.alertCount && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <nav className="p-3 pt-0 space-y-1">
          <div className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Workspace Settings
          </div>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center space-x-3 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-blue-400 border border-slate-700/60'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer with Quick Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
