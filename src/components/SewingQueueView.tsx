'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CuttingOrder } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import {
  Factory,
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { WastageGauge } from './WastageGauge';

interface Props {
  queue: CuttingOrder[];
  onQueueUpdated: () => void;
}

export const SewingQueueView: React.FC<Props> = ({ queue, onQueueUpdated }) => {
  const { activeRole } = useAuthStore();
  const isSewingSupervisor = activeRole === 'sewing_supervisor';

  const [startingId, setStartingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartSewing = async (orderId: number, orderNo: string) => {
    try {
      setStartingId(orderId);
      setSuccessMsg(null);
      setErrorMsg(null);

      const res = await api.sewing.startSewing(orderId);
      const msg = res.message || `Batch #${orderNo} transitioned to active sewing floor assembly line!`;
      setSuccessMsg(msg);
      toast.success(msg);
      onQueueUpdated();
    } catch (err: any) {
      const msg = err.message || 'Failed to start sewing.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setStartingId(null);
    }
  };

  if (!isSewingSupervisor) {
    return (
      <div className="backdrop-blur-xl bg-rose-950/40 border border-rose-500/50 p-6 sm:p-10 rounded-3xl text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(244,63,94,0.25)]">
        <div className="w-14 h-14 bg-rose-600/30 border border-rose-500/60 text-rose-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white">
          Access Restricted: Sewing Floor Lead Role Required
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          The Sewing Assembly Queue contains verified production kits released by quality control. Only authenticated <strong>Sewing Supervisors</strong> (Devon Chen) are authorized to inspect clearances and initialize floor assembly.
        </p>
        <div className="mt-5 inline-block font-mono text-xs font-bold bg-slate-900/80 text-rose-300 px-4 py-2 rounded-xl border border-rose-500/40">
          RBAC Enforcement: 403 Forbidden for '{activeRole}'
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="backdrop-blur-xl bg-emerald-950/40 text-white p-4 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Assembly Floor Sewing Queue
            </h2>
            <p className="text-xs text-emerald-300/80 font-medium">
              Strict Gatekeeper Rule: ONLY orders with status <code className="bg-emerald-900/80 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold font-mono text-emerald-200">VERIFIED</code> are visible here
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-mono text-xs font-bold bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 px-3.5 py-1.5 rounded-full shadow-inner">
            Ready to Sew: {queue.length} Batches
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 backdrop-blur-xl bg-emerald-950/70 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-emerald-200 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 backdrop-blur-xl bg-rose-950/70 border border-rose-500/50 rounded-2xl flex items-center gap-3 text-rose-200 text-sm font-bold shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Queue Grid */}
      {queue.length === 0 ? (
        <div className="backdrop-blur-xl bg-slate-900/75 rounded-3xl border border-white/10 p-8 sm:p-12 text-center shadow-lg">
          <div className="w-14 h-14 bg-slate-800/80 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <FileCheck className="w-7 h-7 text-cyan-400" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            Sewing Queue is Empty
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            All cut batches have either already entered sewing or are awaiting Verifier clearance. Use the Role Switcher above to switch to <strong>Elena Rostova (Verifier)</strong> and approve pending batches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {queue.map((order) => {
            const approvalLog = order.verification_logs?.find((l) => l.decision === 'APPROVED');

            return (
              <div
                key={order.id}
                className="backdrop-blur-xl bg-slate-900/75 rounded-3xl border border-emerald-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden hover:border-emerald-500/60 transition-all duration-200"
              >
                {/* Header Strip */}
                <div className="bg-emerald-950/40 px-4 sm:px-6 py-4 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-emerald-600 text-white rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.4)] shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base sm:text-xl font-black text-white font-mono">
                          {order.order_no}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Gatekeeper Cleared
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {order.recipe?.name} ({order.recipe?.category}) • Batch Qty:{' '}
                        <strong className="text-cyan-300 font-mono">{order.target_qty} Garments</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartSewing(order.id, order.order_no)}
                    disabled={startingId === order.id}
                    className="touch-target inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-95 disabled:opacity-50"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>{startingId === order.id ? 'Deploying to Lines...' : 'Start Sewing Assembly'}</span>
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                  {/* Left: Gatekeeper Audit Certificate */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="backdrop-blur-md bg-slate-950/60 border border-white/10 rounded-2xl p-4 shadow-inner">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex flex-wrap items-center justify-between gap-1">
                        <span className="flex items-center gap-1.5 text-emerald-300">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          <span>Verifier Audit Clearance Certificate</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {approvalLog ? new Date(approvalLog.timestamp).toLocaleString() : 'Audited'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3">
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/10">
                          <div className="text-slate-400 font-medium">Verified By</div>
                          <div className="text-white font-bold mt-0.5 text-sm">
                            {approvalLog?.verifier?.full_name || 'Elena Rostova (Verifier)'}
                          </div>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/10">
                          <div className="text-slate-400 font-medium">Fabric Roll / Lot Tag</div>
                          <div className="text-cyan-300 font-bold font-mono mt-0.5 text-sm">
                            {order.fabric_roll_id}
                          </div>
                        </div>
                      </div>

                      {/* Component Pieces Checklist */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="text-[11px] font-bold uppercase text-slate-400 mb-1">
                          Counted & Certified Components:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.verification_items.map((vi) => (
                            <div
                              key={vi.id}
                              className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-xl border border-white/5 text-xs"
                            >
                              <span className="font-bold text-white flex items-center gap-1.5 truncate">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="truncate">{vi.component.component_name}</span>
                              </span>
                              <span className="font-mono font-black text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-md border border-white/5 shrink-0 ml-2">
                                {vi.actual_qty} pcs
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Wastage Analytics */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <WastageGauge wastage={order.wastage} />
                    <div className="mt-3 p-3.5 backdrop-blur-md bg-blue-950/40 border border-blue-500/30 rounded-2xl text-xs text-blue-200 leading-relaxed shadow-inner">
                      <span className="font-bold text-cyan-300">Assembly Instruction:</span> Distribute verified kits across lines 1 & 2. All components have passed physical count verification.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
