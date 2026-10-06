'use client';

import React from 'react';
import { useAuthStore } from '../context/AuthStore';
import { UserRole } from '../types';
import { Scissors, ShieldCheck, Factory, Check, Sparkles, KeyRound } from 'lucide-react';

interface RoleOption {
  role: UserRole;
  name: string;
  title: string;
  icon: React.ReactNode;
  canDo: string;
  cannotDo: string;
  themeColor: 'blue' | 'amber' | 'emerald';
}

export const RoleSwitcher: React.FC = () => {
  const { user, activeRole, switchRole, isLoading } = useAuthStore();

  const roles: RoleOption[] = [
    {
      role: 'cutting_supervisor',
      name: 'Marcus Vance',
      title: 'Cutting Supervisor',
      icon: <Scissors className="w-5 h-5 text-blue-400" />,
      canDo: 'Create orders from BOM recipes, batch qty, fabric roll & yards logging',
      cannotDo: 'Blocked from Verifying batches & Sewing Queue',
      themeColor: 'blue',
    },
    {
      role: 'cutting_verifier',
      name: 'Elena Rostova',
      title: 'Gatekeeper Verifier',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      canDo: 'Count physical parts, Traffic Light matrix, 422 Hard-Stop Approval / Rejection',
      cannotDo: 'Blocked from Creating orders & Sewing Queue',
      themeColor: 'amber',
    },
    {
      role: 'sewing_supervisor',
      name: 'Devon Chen',
      title: 'Sewing Floor Lead',
      icon: <Factory className="w-5 h-5 text-emerald-400" />,
      canDo: 'View verified assembly queue, inspect audit notes, click "Start Sewing"',
      cannotDo: 'Strictly blocked from unverified/pending/rejected orders & creation',
      themeColor: 'emerald',
    },
  ];

  return (
    <div className="backdrop-blur-xl bg-slate-900/60 border-b border-white/10 px-3 sm:px-6 lg:px-8 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-300">
              RBAC Live Persona Switcher (Select active floor terminal persona):
            </h2>
          </div>
          <div className="text-[10px] sm:text-xs text-cyan-400/80 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Server JWT & Role Hard-Stop Guard Active
          </div>
        </div>

        {/* Responsive Grid with mobile horizontal swipe support */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto pb-1">
          {roles.map((item) => {
            const isActive = user !== null && activeRole === item.role;

            const activeCardStyles = {
              blue: 'border-blue-500/80 bg-blue-950/40 shadow-[0_0_25px_rgba(59,130,246,0.3)] ring-1 ring-blue-400/50',
              amber: 'border-amber-500/80 bg-amber-950/40 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50',
              emerald: 'border-emerald-500/80 bg-emerald-950/40 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50',
            }[item.themeColor];

            const activeBadgeStyles = {
              blue: 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]',
              amber: 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.8)]',
              emerald: 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.8)]',
            }[item.themeColor];

            return (
              <button
                key={item.role}
                type="button"
                onClick={() => switchRole(item.role)}
                disabled={isLoading}
                aria-pressed={isActive}
                className={`relative text-left p-3 sm:p-3.5 rounded-xl border backdrop-blur-md transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? activeCardStyles
                    : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border backdrop-blur-md ${
                        isActive
                          ? 'bg-slate-900/90 border-white/20 shadow-inner'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white leading-tight">
                          {item.name}
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          {item.title}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${activeBadgeStyles}`}>
                        <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-[11px] leading-tight">
                    <div className="text-emerald-400/90 font-medium">
                      <strong className="text-emerald-300 font-bold">✓ Can:</strong> {item.canDo}
                    </div>
                    <div className="text-rose-400/90 font-medium">
                      <strong className="text-rose-300 font-bold">✗ Blocked:</strong> {item.cannotDo}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
