'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../context/AuthStore';
import {
  X,
  User,
  Shield,
  KeyRound,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  BadgeCheck,
  Building2,
  Clock,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowPasswordSection(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const roleDetails = {
    cutting_supervisor: {
      title: 'Cutting Floor Supervisor',
      station: '1. Cutting Floor & Order Issuance',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      themeBorder: 'border-blue-500/50',
    },
    cutting_verifier: {
      title: 'Quality & Gatekeeper Verifier',
      station: '2. Gatekeeper Verifier Terminal',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      themeBorder: 'border-amber-500/50',
    },
    sewing_supervisor: {
      title: 'Sewing Floor Assembly Lead',
      station: '3. Sewing Assembly Queue',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      themeBorder: 'border-emerald-500/50',
    },
  }[user.role] || {
    title: 'Manufacturing Operator',
    station: 'Factory Terminal',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
    themeBorder: 'border-slate-500/50',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be blank.');
      return;
    }

    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await updateProfile({
        full_name: fullName.trim(),
        current_password: showPasswordSection && newPassword ? currentPassword : undefined,
        new_password: showPasswordSection && newPassword ? newPassword : undefined,
      });

      setSuccessMsg('Profile settings updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-slate-950/80 p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-settings-title"
    >
      <div className="backdrop-blur-2xl bg-slate-900/95 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.85)] max-w-lg w-full border border-white/20 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-950/80 px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-xl text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-settings-title" className="text-base sm:text-lg font-black text-white">
                Operator Profile Settings
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Manage your credentials & workstation preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-bold flex items-start gap-2 shadow-md">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Identity & Workstation Overview Card */}
          <div className={`p-4 rounded-2xl bg-slate-950/70 border ${roleDetails.themeBorder} shadow-inner space-y-2.5`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                Verified Manufacturing Clearance
              </span>
              <span className="text-[10px] font-mono text-cyan-400/90 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                ID: OP-#{String(user.id).padStart(4, '0')}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-black text-white">{user.full_name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${roleDetails.badgeColor}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Assigned Workstation: <strong className="text-slate-200">{roleDetails.station}</strong></span>
            </div>
          </div>

          {/* Editable Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Operator Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Read-Only Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Operator Email Address <span className="text-slate-500 font-normal lowercase">(read-only)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-slate-950/60 text-slate-400 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Section Toggle */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              <span>{showPasswordSection ? 'Hide Password Change' : 'Change Security Password'}</span>
            </button>
          </div>

          {/* Expandable Password Form */}
          {showPasswordSection && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-white/10 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Action Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="touch-target px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="touch-target inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

