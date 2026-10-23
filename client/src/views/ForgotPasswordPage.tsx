import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { api } from '../api/client';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.recoverPassword(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0c1220] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <button
          onClick={() => onNavigate('/login')}
          className="flex items-center text-xs text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
        </button>

        <h1 className="text-xl font-bold text-white mb-2">Password Recovery</h1>
        <p className="text-xs text-slate-400 mb-6">
          Enter your registered work email and we will dispatch a cryptographically signed recovery token.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-emerald-300">Instructions Sent</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, check your inbox for instructions to reset your password.
            </p>
            <button
              onClick={() => onNavigate('/login')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Registered Work Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              {loading ? 'Processing...' : 'Send Recovery Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
