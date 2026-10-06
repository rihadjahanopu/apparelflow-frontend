import React from 'react';
import { WastageEvaluationResult } from '../types';
import { AlertTriangle, CheckCircle2, TrendingUp, Gauge } from 'lucide-react';

interface Props {
  wastage?: WastageEvaluationResult;
}

export const WastageGauge: React.FC<Props> = ({ wastage }) => {
  if (!wastage) return null;

  const { actualFabricYards, expectedFabricYards, wastagePct, wastageCap, exceededCap } = wastage;

  // Percentage of cap consumed for visual bar (0 - 100%+)
  const capUtilization = Math.min(100, Math.max(0, (wastagePct / (wastageCap || 1)) * 100));

  return (
    <div className="backdrop-blur-xl bg-slate-900/70 border border-white/10 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span>Fabric Wastage Telemetry</span>
        </div>
        {exceededCap ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            CAP EXCEEDED ({wastageCap.toFixed(1)}% Max)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            WITHIN CAP (≤{wastageCap.toFixed(1)}%)
          </span>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center mb-3">
        <div className="backdrop-blur-md bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/10 shadow-inner">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase">Std Expected</div>
          <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">
            {expectedFabricYards.toFixed(1)} yds
          </div>
        </div>

        <div className="backdrop-blur-md bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-white/10 shadow-inner">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase">Actual Logged</div>
          <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">
            {actualFabricYards.toFixed(1)} yds
          </div>
        </div>

        <div
          className={`backdrop-blur-md p-2 sm:p-2.5 rounded-xl border font-mono ${
            exceededCap
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase font-sans">
            Wastage %
          </div>
          <div className="text-xs sm:text-base font-black mt-0.5">
            {wastagePct > 0 ? `+${wastagePct.toFixed(2)}%` : `${wastagePct.toFixed(2)}%`}
          </div>
        </div>
      </div>

      {/* Visual Wastage Progress Meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Tolerance Meter</span>
          <span>{wastagePct.toFixed(1)}% / {wastageCap.toFixed(1)}% Cap</span>
        </div>
        <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              exceededCap
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_#f43f5e]'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_8px_#34d399]'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, (wastagePct / (wastageCap || 1)) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
