import React, { useState } from 'react';
import { Search, Bell, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenCommandPalette, 
  notifications, 
  onMarkNotificationRead,
  onNavigate 
}) => {
  const { organization } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search / Command palette trigger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-3 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all w-64 md:w-80 shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span className="flex-1 text-left">Search actions, leads, docs...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded font-mono border border-slate-700">⌘K</kbd>
        </button>

        <div className="hidden lg:flex items-center space-x-2 text-xs text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Shield className="w-3 h-3" />
          <span>Tenant Isolated (ACID SQLite)</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Quick Launch CTA */}
        <button
          onClick={() => onNavigate('/app/builder')}
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Project</span>
        </button>

        {/* Notifications toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c1220] border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-semibold text-sm">Notifications & Alerts</span>
                <span className="text-xs text-blue-400 font-mono">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No new notifications in workspace.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`py-3 px-2 rounded-lg transition-colors flex items-start justify-between gap-2 ${
                        n.is_read ? 'opacity-60 hover:opacity-100' : 'bg-slate-900/40'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-100">{n.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => onMarkNotificationRead(n.id)}
                          title="Mark read"
                          className="p-1 text-slate-500 hover:text-blue-400"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('/app/notifications');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View full notifications center →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
