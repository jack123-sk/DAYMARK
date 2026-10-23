import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Check, Clock } from 'lucide-react';
import { api } from '../api/client';
import { NotificationItem } from '../types';

export const NotificationsView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('[Notifications Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      await loadNotifications();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await loadNotifications();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 uppercase font-semibold">
            <Bell className="w-4 h-4" />
            <span>ALERTS & DISPATCHES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stay informed on pending approvals, new lead alerts, and system milestones.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 font-semibold flex items-center space-x-1.5"
        >
          <Check className="w-3.5 h-3.5 text-blue-400" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-3">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No notifications in workspace.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                n.is_read
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/80 border-slate-700/80 shadow-md'
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-white">{n.title}</div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                <div className="text-[10px] text-slate-500 font-mono mt-2">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
