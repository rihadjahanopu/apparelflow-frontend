'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/AuthStore';
import { UserRole } from '../types';
import {
  Layers,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  Scissors,
  ShieldCheck,
  Factory,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Props {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const { loginWithCredentials, registerOperator } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('cutting_supervisor');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Preset Autofill
  const handleAutofill = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg(null);
    toast('Demo credentials auto-filled!', { icon: '🔑' });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both your email and password.');
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithCredentials(loginEmail.trim(), loginPassword.trim());
      setSuccessMsg('Authentication certified. Accessing manufacturing terminal...');
      toast.success('Authentication certified! Welcome to ApparelFlow ERP.');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please verify credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim() || !regRole) {
      const msg = 'Please complete all operator registration fields.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (regPassword.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      await registerOperator(regEmail.trim(), regPassword.trim(), regFullName.trim(), regRole);
      setSuccessMsg('Operator registered successfully. Unlocking terminal...');
      toast.success('Operator registered successfully! Terminal unlocked.');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Email may already be in use.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden text-slate-100">
      {/* Ambient Cybernetic Lighting Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Industrial Header (Branding only) */}
      <header className="w-full backdrop-blur-xl bg-slate-950/80 border-b border-white/10 px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white border border-white/20 shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl font-black tracking-tight text-white truncate">
                ApparelFlow
              </span>
              <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                ERP v2.4
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium hidden md:block truncate">
              Cutting Operations & Gatekeeper Verification Terminal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] text-slate-400 bg-slate-900/80 border border-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Terminal Access Restricted: Authentication Required</span>
          <span className="sm:hidden text-amber-300 font-bold">Terminal Locked</span>
        </div>
      </header>

      {/* Main Login / Register Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-lg backdrop-blur-2xl bg-slate-900/85 rounded-3xl border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="bg-slate-950/80 p-5 sm:p-6 border-b border-white/10 flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-white/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Operator Terminal Login
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Please enter your credentials to access factory floor operations.
              </p>
            </div>
          </div>

          {/* Tab Switcher: Sign In vs Register */}
          <div className="flex border-b border-white/10 bg-slate-950/60 p-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Operator</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-7 space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-200 text-xs font-bold flex items-start gap-2 shadow-lg animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-bold shadow-lg animate-in fade-in">
                ✓ {successMsg}
              </div>
            )}

            {mode === 'login' ? (
              /* ================= SIGN IN FORM ================= */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Operator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. supervisor@apparelflow.com"
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-10 pr-3.5 py-3 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Operator Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-300" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full touch-target py-3 px-4 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In & Unlock Terminal</span>
                    </>
                  )}
                </button>

                {/* Click-to-Fill Demo Credentials (makes testing frictionless while still requiring user to submit credentials!) */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Demo Credentials:
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      (Click to autofill)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Supervisor autofill */}
                    <button
                      type="button"
                      onClick={() => handleAutofill('supervisor@apparelflow.com', 'Password123!')}
                      className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-950/30 hover:bg-blue-900/50 hover:border-blue-400/60 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Supervisor</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                        Marcus Vance
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Password123!
                      </div>
                    </button>

                    {/* Verifier autofill */}
                    <button
                      type="button"
                      onClick={() => handleAutofill('verifier@apparelflow.com', 'Password123!')}
                      className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/50 hover:border-amber-400/60 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verifier</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                        Elena Rostova
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Password123!
                      </div>
                    </button>

                    {/* Sewing Lead autofill */}
                    <button
                      type="button"
                      onClick={() => handleAutofill('sewing@apparelflow.com', 'Password123!')}
                      className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/50 hover:border-emerald-400/60 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Factory className="w-3.5 h-3.5" />
                        <span>Sewing Lead</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                        Devon Chen
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Password123!
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* ================= REGISTER NEW OPERATOR FORM ================= */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. john@apparelflow.com"
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Password (Min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-3.5 pr-11 py-2.5 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                      title={showRegPassword ? 'Hide password' : 'Show password'}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-300" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Manufacturing Role & Clearance
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cutting_supervisor">Cutting Supervisor (Create orders & BOM)</option>
                    <option value="cutting_verifier">Gatekeeper Verifier (Traffic Light verification & hard stop)</option>
                    <option value="sewing_supervisor">Sewing Supervisor (Access verified queue)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full touch-target py-3 px-4 rounded-xl text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <span>Registering Operator...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register & Unlock Terminal</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Industrial Footer */}
      <footer className="backdrop-blur-xl bg-slate-950/80 border-t border-white/10 text-xs py-3.5 px-4 sm:px-8 text-center text-slate-500 font-mono">
        ApparelFlow ERP • Strict Multiplier & Gatekeeper Hard-Stop Enforced • ISO 9001 Compliant
      </footer>
    </div>
  );
};

