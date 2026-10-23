import React, { useState } from 'react';
import { User, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC = () => {
  const { user, organization } = useAuth();
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 uppercase font-semibold">
          <User className="w-4 h-4" />
          <span>ACCOUNT SETTINGS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Profile & Security Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal credentials, workspace preferences, and multi-factor session options.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Your Name</label>
          <input
            type="text"
            defaultValue={user?.name || ''}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Work Email</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-500 font-mono"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Email updates require organizational re-verification.</span>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Current Organization Role</label>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-200">{organization?.name}</span>
            <span className="px-2 py-0.5 rounded font-mono uppercase text-[10px] font-bold bg-blue-500/20 text-blue-300">
              {user?.role}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all mt-4"
        >
          Save Profile Settings
        </button>
      </form>
    </div>
  );
};
