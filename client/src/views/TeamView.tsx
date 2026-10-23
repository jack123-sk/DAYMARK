import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Shield, X, Mail } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const TeamView: React.FC = () => {
  const { user, organization } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const loadMembers = async () => {
    try {
      const res = await api.getTeamMembers();
      setMembers(res.members || []);
    } catch (err) {
      console.error('[Team Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inviteMember({
        email: inviteEmail,
        name: inviteName,
        role: inviteRole
      });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      await loadMembers();
    } catch (err: any) {
      alert(`Invitation error: ${err.message}`);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove member from organization?')) return;
    try {
      await api.removeMember(id);
      await loadMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 uppercase font-semibold">
            <UserCheck className="w-4 h-4" />
            <span>ORGANIZATION GOVERNANCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Team Members & Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authorized operators in your organization workspace: Owner, Admin, Member, Viewer.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="font-bold text-sm text-white">Active Members ({members.length})</span>
          <span className="text-xs font-mono text-slate-400">Organization: {organization?.name}</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {members.map((m) => (
            <div key={m.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  {m.name ? m.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="font-semibold text-xs text-white">{m.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{m.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  m.role === 'owner'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : m.role === 'admin'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {m.role}
                </span>

                {m.role !== 'owner' && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Invite Team Member</span>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="sarah@agency.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono"
                >
                  <option value="admin">Admin (Can manage workflows & billing)</option>
                  <option value="member">Member (Can run workflows & CRM)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md mt-2"
              >
                Send Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
