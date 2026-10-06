import React from 'react';
import { ComponentTrafficStatus } from '../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface Props {
  status: ComponentTrafficStatus;
  variance?: number;
  deficit?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const TrafficLightBadge: React.FC<Props> = ({
  status,
  variance,
  deficit,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  if (status === 'MATCH') {
    return (
      <span
        className={`inline-flex items-center rounded-xl font-bold backdrop-blur-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] ${sizeClasses}`}
        role="status"
        aria-label="Component match (Green)"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        <span>MATCH (GREEN)</span>
        {variance !== undefined && (
          <span className="font-mono text-[10px] text-emerald-200 bg-emerald-950/60 border border-emerald-500/30 px-1 rounded">
            ±0
          </span>
        )}
      </span>
    );
  }

  if (status === 'EXCESS') {
    return (
      <span
        className={`inline-flex items-center rounded-xl font-bold backdrop-blur-md bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] ${sizeClasses}`}
        role="status"
        aria-label="Component excess (Yellow)"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
        <span>EXCESS (YELLOW)</span>
        {variance !== undefined && (
          <span className="font-mono text-[10px] text-amber-200 bg-amber-950/60 border border-amber-500/30 px-1 rounded font-bold">
            +{variance}
          </span>
        )}
      </span>
    );
  }

  // RED / SHORTAGE (HARD-STOP)
  return (
    <span
      className={`inline-flex items-center rounded-xl font-black backdrop-blur-md bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-[0_0_16px_rgba(244,63,94,0.4)] animate-pulse ${sizeClasses}`}
      role="status"
      aria-label="Component shortage (Red - Hard stop blocked)"
    >
      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
      <span>SHORTAGE (RED)</span>
      {(deficit !== undefined || variance !== undefined) && (
        <span className="font-mono text-[10px] text-rose-100 bg-rose-950/80 border border-rose-400/50 px-1.5 rounded font-black">
          -{deficit ?? Math.abs(variance ?? 0)} pcs
        </span>
      )}
    </span>
  );
};
