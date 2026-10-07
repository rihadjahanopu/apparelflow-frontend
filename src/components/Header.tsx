'use client';

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/AuthStore';
import { UserRole } from '../types';
import {
  Layers,
  Activity,
  UserCircle,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ProfileModal } from './ProfileModal';

interface Props {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<Props> = ({ onRefresh, isRefreshing }) => {
  const { user, activeRole, logout } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const effectiveRole: UserRole = (user?.role as UserRole) || activeRole || 'cutting_supervisor';

  const roleTitleMap: Record<UserRole, string> = {
    cutting_supervisor: 'Cutting Floor Supervisor',
    cutting_verifier: 'Quality & Gatekeeper Verifier',
    sewing_supervisor: 'Sewing Floor Assembly Lead',
  };

  const roleBadgeStyle: Record<UserRole, string> = {
    cutting_supervisor: 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    cutting_verifier: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    sewing_supervisor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white border border-white/20 shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl font-black tracking-tight text-white drop-shadow-sm truncate">
                  ApparelFlow
                </span>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 sm:px-2 py-0.5 rounded-full shadow-inner shrink-0">
                  ERP v2.4
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium hidden md:block truncate">
                Cutting Operations & Gatekeeper Verification Terminal
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {user ? (
              <>
                {/* Desktop User Persona Pill (>= sm) */}
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 hover:border-cyan-500/50 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl shadow-inner transition-all cursor-pointer group text-left"
                  title="Operator Profile Settings"
                >
                  <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="truncate max-w-[120px]">{user.full_name}</span>
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded-md border ${roleBadgeStyle[effectiveRole]}`}>
                        {effectiveRole.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {roleTitleMap[effectiveRole]}
                    </div>
                  </div>
                </button>

                {/* Desktop Settings Button (>= sm) */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white rounded-xl border border-white/10 backdrop-blur-md shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                  title="Operator Profile Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Settings</span>
                </button>

                {/* Desktop Logout Button (>= sm) */}
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 hover:text-white rounded-xl border border-rose-500/30 backdrop-blur-md shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                  title="Logout Operator Session"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Logout</span>
                </button>

                {/* Mobile Operator Menu Trigger (< sm) */}
                <div className="relative sm:hidden" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-inner transition-all active:scale-95 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                    aria-label="Operator options menu"
                  >
                    <UserCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md border ${roleBadgeStyle[effectiveRole]}`}>
                      {effectiveRole.split('_')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        isMenuOpen ? 'rotate-180 text-cyan-300' : ''
                      }`}
                    />
                  </button>

                  {/* Mobile Dropdown Panel */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl backdrop-blur-2xl bg-slate-900/95 border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      role="menu"
                    >
                      {/* Operator Identity Card */}
                      <div className="px-3 py-2.5 bg-slate-950/60 rounded-xl border border-white/5 mb-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white truncate">{user.full_name}</span>
                          <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md border shrink-0 ${roleBadgeStyle[effectiveRole]}`}>
                            {effectiveRole.split('_')[0]}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {roleTitleMap[effectiveRole]}
                        </div>
                        {user.email && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                            {user.email}
                          </div>
                        )}
                      </div>

                      {/* Menu Actions */}
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-left"
                          role="menuitem"
                        >
                          <Settings className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div className="flex-1">
                            <div>Profile & Settings</div>
                            <div className="text-[10px] text-slate-400 font-normal">Manage credentials & station</div>
                          </div>
                        </button>

                        {onRefresh && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              onRefresh();
                              toast.success('Floor data synchronized!');
                            }}
                            disabled={isRefreshing}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-left disabled:opacity-50"
                            role="menuitem"
                          >
                            <Activity className={`w-4 h-4 text-cyan-400 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <div className="flex-1">
                              <div>Sync Floor Data</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {isRefreshing ? 'Syncing active telemetry...' : 'Refresh latest orders'}
                              </div>
                            </div>
                          </button>
                        )}

                        <div className="border-t border-white/10 my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            logout();
                            toast('Operator logged out from terminal.', { icon: '👋' });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-left"
                          role="menuitem"
                        >
                          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Logout Operator</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Signed Out State -> Sign In Button */
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Sync / Refresh Button (Visible on both mobile & desktop) */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 sm:px-3 sm:py-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white rounded-xl border border-slate-700/80 backdrop-blur-md shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                title="Sync Floor Data"
                aria-label="Sync Floor Data"
              >
                <Activity className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal (Manual Login & Operator Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Operator Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
