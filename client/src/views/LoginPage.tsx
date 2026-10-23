import React, { useState } from 'react';
import { Play, ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user, res.organization);
      onNavigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin();
      onNavigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="text-center mb-8 cursor-pointer" onClick={() => onNavigate('/')}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-extrabold text-white text-2xl mx-auto shadow-xl shadow-blue-500/20 mb-3">
          D
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">DAYMARK OS</h1>
        <p className="text-xs text-slate-400 mt-1">Sign in to your automation workspace</p>
      </div>

      <div className="w-full max-w-md bg-[#0c1220] border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        {/* Instant Demo Sandbox Shortcut */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div className="text-xs font-semibold text-emerald-400 mb-1">Instant Evaluator Access</div>
          <p className="text-[11px] text-slate-300 mb-3">Pre-loaded with sample CRM deals, workflows, and 6 active AI assistants.</p>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>1-Click Launch (Founder Account)</span>
          </button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-xs text-slate-500 font-mono uppercase">Or Enter Credentials</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have a workspace yet?{' '}
          <button
            onClick={() => onNavigate('/signup')}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Create free account
          </button>
        </div>
      </div>
    </div>
  );
};
