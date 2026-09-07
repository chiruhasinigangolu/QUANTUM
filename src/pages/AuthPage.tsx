import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Key, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api, type User } from '../lib/api.js';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(searchParams.get('tab') === 'register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.signup({ username, email, password });
      } else {
        res = await api.login({ email: email || username, password });
      }
      onLoginSuccess(res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (demoUser: 'alice' | 'bob') => {
    setIsRegister(false);
    setEmail(demoUser);
    setPassword('demo1234');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-2xl bg-ops-card border border-ops-border shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-ops-phosphor/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-ops-surface border border-ops-border flex items-center justify-center text-ops-phosphor shadow-glow mx-auto">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-mono font-bold text-white tracking-tight">
            {isRegister ? 'INITIALIZE KEYRING' : 'ACCESS FORENSIC LEDGER'}
          </h2>
          <p className="text-xs text-ops-muted font-mono">
            {isRegister
              ? 'secp256k1 ECDSA cryptographic keypair will be generated for your identity.'
              : 'Sign in with your credentials or demo user account.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-ops-surface border border-ops-borderSubtle mb-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`py-2 rounded-lg transition-colors ${
              !isRegister
                ? 'bg-ops-card text-ops-phosphor font-bold border border-ops-border'
                : 'text-ops-muted hover:text-white'
            }`}
          >
            LOG IN
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`py-2 rounded-lg transition-colors ${
              isRegister
                ? 'bg-ops-card text-ops-phosphor font-bold border border-ops-border'
                : 'text-ops-muted hover:text-white'
            }`}
          >
            SIGN UP
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-ops-red/10 border border-ops-red/40 text-ops-red text-xs font-mono">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {isRegister && (
            <div>
              <label className="block text-ops-muted mb-1 text-[11px]">USERNAME</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-ops-dim absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. carol_forensics"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-ops-surface border border-ops-border text-white placeholder-ops-dim focus:outline-none focus:border-ops-phosphor"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-ops-muted mb-1 text-[11px]">
              {isRegister ? 'EMAIL ADDRESS' : 'EMAIL OR USERNAME'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ops-dim absolute left-3 top-2.5" />
              <input
                type={isRegister ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isRegister ? 'carol@lab.org' : 'alice or alice@quantum.forensics'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-ops-surface border border-ops-border text-white placeholder-ops-dim focus:outline-none focus:border-ops-phosphor"
              />
            </div>
          </div>

          <div>
            <label className="block text-ops-muted mb-1 text-[11px]">PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ops-dim absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-ops-surface border border-ops-border text-white placeholder-ops-dim focus:outline-none focus:border-ops-phosphor"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-ops-phosphor text-black font-mono font-bold hover:bg-ops-phosphorBright shadow-glow transition-all flex items-center justify-center space-x-1.5 mt-6"
          >
            {loading ? (
              <span>PROCESSING ECDSA FINGERPRINT...</span>
            ) : (
              <>
                <span>{isRegister ? 'GENERATE KEYPAIR & REGISTER' : 'AUTHENTICATE'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill Shortcuts */}
        <div className="mt-8 pt-6 border-t border-ops-borderSubtle font-mono">
          <p className="text-[11px] text-ops-dim text-center uppercase tracking-wider mb-3">
            EVALUATOR SHORTCUTS:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('alice')}
              className="py-1.5 px-2 rounded-lg bg-ops-surface border border-ops-border hover:border-ops-phosphor/40 text-ops-muted hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-3 h-3 text-ops-phosphor" />
              <span>Fill Alice (demo1234)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('bob')}
              className="py-1.5 px-2 rounded-lg bg-ops-surface border border-ops-border hover:border-ops-phosphor/40 text-ops-muted hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>Fill Bob (demo1234)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
