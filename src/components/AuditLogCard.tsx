'use client';

import React from 'react';
import { VerificationLog } from '../types';
import { AlertOctagon, CheckCircle2, TrendingUp, UserCircle, Clock, ShieldAlert } from 'lucide-react';

interface Props {
  log?: VerificationLog;
  compact?: boolean;
}

export const AuditLogCard: React.FC<Props> = ({ log, compact = false }) => {
  if (!log) {
    return (
      <span className="text-slate-500 text-xs italic">
        Pending Gatekeeper Verification
      </span>
    );
  }

  const isRejected = log.decision === 'REJECTED';
  const verifierName = log.verifier?.full_name || 'Elena Rostova (Verifier)';
  const formattedTime = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  if (isRejected) {
    return (
      <div className="space-y-1.5 max-w-sm">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Glowing Rejection Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(244,63,94,0.35)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_6px_#f43f5e]" />
            REJECTED
          </span>

          {/* Wastage Tag */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 border border-white/10 text-[10px] font-mono font-bold text-amber-300 shadow-inner">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            Wastage {log.wastage_pct}%
          </span>

          {/* Time & Verifier */}
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {formattedTime}
          </span>
        </div>

        {/* Modern Glassy Rejection Note Body */}
        {log.rejection_note && (
          <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-rose-950/80 via-slate-900/90 to-rose-950/50 border border-rose-500/40 rounded-xl p-3 shadow-[0_4px_20px_rgba(244,63,94,0.2)]">
            {/* Luminous Red Accent Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-rose-600 shadow-[0_0_10px_#f43f5e]" />

            <div className="pl-2">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Defect Audit Notice</span>
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  by {verifierName}
                </span>
              </div>

              <p className="text-xs text-rose-100 font-medium leading-relaxed">
                {log.rejection_note}
              </p>

              <div className="mt-2 pt-1.5 border-t border-rose-500/20 flex items-center justify-between text-[10px] text-rose-300/80 font-mono">
                <span className="font-bold text-rose-400 uppercase">Action: Batch Recut Required</span>
                <span className="sm:hidden">{formattedTime}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // APPROVED STATE
  return (
    <div className="space-y-1 max-w-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          APPROVED
        </span>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 border border-white/10 text-[10px] font-mono font-bold text-cyan-300">
          Wastage {log.wastage_pct}%
        </span>
      </div>

      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
        <span>Verified by {verifierName}</span>
        {formattedTime && <span className="font-mono text-slate-500">• {formattedTime}</span>}
      </div>
    </div>
  );
};

