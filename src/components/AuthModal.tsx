'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../context/AuthStore';
import { UserRole } from '../types';
import { X, LogIn, UserPlus, KeyRound, Mail, Lock, UserCheck, ShieldCheck, Scissors, Factory, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithCredentials, registerOperator, isLoading } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('cutting_supervisor');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Preset autofill for quick testing
  const autofillPreset = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithCredentials(loginEmail.trim(), loginPassword.trim());
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim() || !regRole) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerOperator(regEmail.trim(), regPassword.trim(), regFullName.trim(), regRole);
      setSuccessMsg('Account created and logged in successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-slate-950/80 p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="backdrop-blur-2xl bg-slate-900/95 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)] max-w-md w-full border border-white/20 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-950/80 px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-xl text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base sm:text-lg font-black text-white">
                Manufacturing Floor Identity
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                JWT Authentication & Role Access Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle (Sign In vs Register) */}
        <div className="flex border-b border-white/10 bg-slate-950/50 p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`touch-target flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
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
            className={`touch-target flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Operator</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-bold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold animate-in fade-in">
              {successMsg}
            </div>
          )}

          {mode === 'login' ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Operator Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="supervisor@apparelflow.com"
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-3 pr-11 py-3 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Fill Preset Cards with visible credentials */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Demo Credentials (Click to Instant Fill & Test):
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => autofillPreset('supervisor@apparelflow.com', 'Password123!')}
                    className="p-2 sm:p-2.5 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Marcus Vance (Cutting Supervisor)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        supervisor@apparelflow.com • <span className="text-cyan-300 font-bold">Password123!</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-300 group-hover:text-white px-2 py-0.5 rounded bg-blue-500/20">
                      Auto Fill
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => autofillPreset('verifier@apparelflow.com', 'Password123!')}
                    className="p-2 sm:p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/60 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Elena Rostova (Gatekeeper Verifier)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        verifier@apparelflow.com • <span className="text-amber-300 font-bold">Password123!</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 group-hover:text-white px-2 py-0.5 rounded bg-amber-500/20">
                      Auto Fill
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => autofillPreset('sewing@apparelflow.com', 'Password123!')}
                    className="p-2 sm:p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Devon Chen (Sewing Floor Lead)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        sewing@apparelflow.com • <span className="text-emerald-300 font-bold">Password123!</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 group-hover:text-white px-2 py-0.5 rounded bg-emerald-500/20">
                      Auto Fill
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="touch-target w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Terminal'}</span>
              </button>
            </form>
          ) : (
            /* Register New Operator Form */
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
                  placeholder="e.g. Tariqul Islam"
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Factory Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. tariqul@apparelflow.com"
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-2.5 sm:pl-3 pr-11 py-2.5 sm:py-3 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4 text-slate-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Assign Factory Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cutting_supervisor">Cutting Floor Supervisor (Marcus Vance role)</option>
                  <option value="cutting_verifier">Quality Gatekeeper Verifier (Elena Rostova role)</option>
                  <option value="sewing_supervisor">Sewing Assembly Lead (Devon Chen role)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="touch-target w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Operator...' : 'Create Account & Sign In'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

