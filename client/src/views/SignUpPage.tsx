import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Building, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface SignUpPageProps {
  onNavigate: (route: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.register({
        name,
        organizationName,
        email,
        password
      });
      login(res.token, res.user, res.organization);
      onNavigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="text-center mb-8 cursor-pointer" onClick={() => onNavigate('/')}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-extrabold text-white text-2xl mx-auto shadow-xl shadow-blue-500/20 mb-3">
          D
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create DAYMARK OS Workspace</h1>
        <p className="text-xs text-slate-400 mt-1">Start your 14-day free trial • Multi-tenant data isolated</p>
      </div>

      <div className="w-full max-w-md bg-[#0c1220] border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company / Workspace Name</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Apex Media Agency"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@apexmedia.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Create Password (min 8 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
            By registering, you agree to our{' '}
            <button type="button" onClick={() => onNavigate('/terms')} className="text-blue-400 hover:underline">Terms of Service</button> and{' '}
            <button type="button" onClick={() => onNavigate('/privacy')} className="text-blue-400 hover:underline">Privacy Policy</button>.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all mt-2"
          >
            <span>{loading ? 'Creating Workspace...' : 'Create Workspace & Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
