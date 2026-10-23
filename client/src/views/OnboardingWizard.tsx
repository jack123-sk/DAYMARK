import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, Users, GitBranch, Lightbulb } from 'lucide-react';
import { api } from '../api/client';

export const OnboardingWizard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState('B2B Digital Marketing Agency');
  const [teamSize, setTeamSize] = useState('5-15 employees');
  const [primaryGoal, setPrimaryGoal] = useState('Automate lead intake & proposal drafting');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.completeOnboarding({ industry, teamSize, primaryGoal });
      onNavigate('/app/dashboard');
    } catch {
      onNavigate('/app/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-xl bg-[#0c1220] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-blue-400 font-bold uppercase">Workspace Setup</span>
            <span className="text-xs text-slate-500">• Step {step} of 3</span>
          </div>
          <div className="flex space-x-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1.5 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Industry */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl font-bold text-white">What is your primary customer segment?</h1>
              <p className="text-xs text-slate-400 mt-1">
                DAYMARK OS calibrates opportunity models and proposal engines for your industry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'B2B Digital Marketing Agency',
                'Web & Software Studio',
                'Management Consultancy',
                'Freight & Logistics Tech',
                'Direct-to-Consumer Brand',
                'Tech / SaaS Startup'
              ].map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setIndustry(ind)}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-medium transition-all ${
                    industry === ind
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{ind}</span>
                    {industry === ind && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Continue to Team Size</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: Team Size & Bottlenecks */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl font-bold text-white">What is your primary operational bottleneck?</h1>
              <p className="text-xs text-slate-400 mt-1">
                Select where your staff currently loses the most billable hours.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Automate lead intake & proposal drafting', desc: 'Enrich new CRM inquiries and auto-generate tailored proposals' },
                { title: 'Streamline client onboarding approvals', desc: 'Eliminate email back-and-forth with automated approval gates' },
                { title: 'Discover & score market opportunities', desc: 'Synthesize competitor data and customer interview plans with DAYMARK' },
                { title: 'Monitor client churn & health signals', desc: 'Proactively detect inactive accounts and alert account directors' }
              ].map((goal) => (
                <button
                  key={goal.title}
                  type="button"
                  onClick={() => setPrimaryGoal(goal.title)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    primaryGoal === goal.title
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{goal.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{goal.desc}</div>
                    </div>
                    {primaryGoal === goal.title && <Check className="w-4 h-4 text-blue-400 flex-shrink-0 ml-2" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Continue to Blueprints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Default Blueprint Activation */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-xl font-bold text-white">Activate your starter automation blueprint</h1>
              <p className="text-xs text-slate-400 mt-1">
                We have prepared your initial workflow with safety approvals enabled.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Agency Client Intake & Proposal FastPack</div>
                  <div className="text-[11px] text-slate-400">Pre-configured with 5 steps & human approval gate</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-300 space-y-1">
                <div>✓ Trigger: Inbound Enquiry Created</div>
                <div>✓ Action: Contact Domain Enrichment</div>
                <div>✓ Agent: Sales Assistant Proposal Generation</div>
                <div>✓ Safety Gate: Require Founder Sign-Off</div>
                <div>✓ Sync: Progress Deal to Proposal Stage</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xl shadow-blue-600/30 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Configuring OS...' : 'Launch DAYMARK OS'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
