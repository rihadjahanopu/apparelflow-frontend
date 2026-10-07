'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CuttingOrder, ComponentTrafficStatus } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Lock,
  Unlock,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  History,
  Layers,
  Check,
} from 'lucide-react';
import { TrafficLightBadge } from './TrafficLightBadge';
import { WastageGauge } from './WastageGauge';
import { RejectionModal } from './RejectionModal';
import { AuditLogCard } from './AuditLogCard';

interface Props {
  orders: CuttingOrder[];
  onOrderUpdated: () => void;
}

export const CuttingVerifierTerminal: React.FC<Props> = ({ orders, onOrderUpdated }) => {
  const { activeRole } = useAuthStore();
  const isVerifier = activeRole === 'cutting_verifier';

  // Filter orders needing attention first (READY_FOR_VERIFICATION, REJECTED)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string; shortages?: any[] } | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  // Default to first order ready for verification
  useEffect(() => {
    if (orders.length > 0 && selectedOrderId === null) {
      const readyOrder = orders.find((o) => o.status === 'READY_FOR_VERIFICATION') || orders[0];
      setSelectedOrderId(readyOrder.id);
    }
  }, [orders, selectedOrderId]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Sync component counts into local state when order changes
  useEffect(() => {
    if (selectedOrder) {
      const initialCounts: Record<number, number> = {};
      selectedOrder.verification_items.forEach((item) => {
        initialCounts[item.component_id] = item.actual_qty;
      });
      setCounts(initialCounts);
      setActionMessage(null);
    }
  }, [selectedOrder?.id]);

  // Compute local traffic light statuses in real time as the verifier edits counts
  const evaluatedItems = (selectedOrder?.verification_items || []).map((item) => {
    const currentActual = counts[item.component_id] !== undefined ? counts[item.component_id] : item.actual_qty;
    let status: ComponentTrafficStatus = 'MATCH';
    if (currentActual < item.expected_qty) {
      status = 'SHORTAGE'; // RED
    } else if (currentActual > item.expected_qty) {
      status = 'EXCESS'; // YELLOW
    }

    const variance = currentActual - item.expected_qty;
    const deficit = Math.max(0, item.expected_qty - currentActual);

    return {
      ...item,
      currentActual,
      status,
      variance,
      deficit,
    };
  });

  const shortages = evaluatedItems.filter((item) => item.status === 'SHORTAGE');
  const hasShortage = shortages.length > 0;
  const canApprove = !hasShortage && selectedOrder?.status !== 'VERIFIED';

  // Defensive Stepper Handler
  const handleCountChange = (componentId: number, newCount: number) => {
    if (newCount < 0 || isNaN(newCount)) return;
    setCounts((prev) => ({
      ...prev,
      [componentId]: Math.floor(newCount),
    }));
    setActionMessage(null);
  };

  // Quick Action: Match All Expected
  const handleMatchAll = () => {
    if (!selectedOrder) return;
    const matched: Record<number, number> = {};
    selectedOrder.verification_items.forEach((item) => {
      matched[item.component_id] = item.expected_qty;
    });
    setCounts(matched);
    setActionMessage({
      type: 'success',
      text: 'Quick-Matched: All component quantities synced to 100% BOM recipe expectation.',
    });
    toast.success('Quick-Matched: All component counts synced to 100% BOM!');
  };

  // Save Physical Counts to API
  const handleSaveCounts = async () => {
    if (!selectedOrder) return;
    try {
      setIsSaving(true);
      const itemsPayload = evaluatedItems.map((item) => ({
        component_id: item.component_id,
        actual_qty: item.currentActual,
      }));

      await api.verify.updateCounts(selectedOrder.id, itemsPayload);
      setActionMessage({
        type: 'success',
        text: 'Physical verification counts saved to database.',
      });
      toast.success('Physical verification counts saved successfully!');
      onOrderUpdated();
    } catch (err: any) {
      const msg = err.message || 'Failed to save counts.';
      setActionMessage({
        type: 'error',
        text: msg,
      });
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Approve Batch (Server-side 422 guard will fire if RED shortage exists)
  const handleApprove = async () => {
    if (!selectedOrder) return;
    try {
      setIsApproving(true);
      setActionMessage(null);

      // Save latest counts first
      const itemsPayload = evaluatedItems.map((item) => ({
        component_id: item.component_id,
        actual_qty: item.currentActual,
      }));
      await api.verify.updateCounts(selectedOrder.id, itemsPayload);

      // Call approve endpoint
      const res = await api.verify.approve(selectedOrder.id);
      setActionMessage({
        type: 'success',
        text: `Batch Approved! Order ${res.order.order_no} cleared gatekeeper verification and released to Sewing Assembly Floor.`,
      });
      toast.success(`Batch #${res.order.order_no} APPROVED & released to Sewing!`);
      onOrderUpdated();
    } catch (err: any) {
      const msg = err.message || 'Approval blocked by Gatekeeper (RED Shortage Detected).';
      setActionMessage({
        type: 'error',
        text: msg,
        shortages: err.shortages,
      });
      toast.error(msg);
    } finally {
      setIsApproving(false);
    }
  };

  // Reject Batch with mandatory note
  const handleReject = async (note: string) => {
    if (!selectedOrder) return;
    try {
      // Save latest counts first
      const itemsPayload = evaluatedItems.map((item) => ({
        component_id: item.component_id,
        actual_qty: item.currentActual,
      }));
      await api.verify.updateCounts(selectedOrder.id, itemsPayload);

      const res = await api.verify.reject(selectedOrder.id, note);
      setActionMessage({
        type: 'success',
        text: `Batch ${res.order.order_no} REJECTED and returned to cutting supervisor with logged audit note.`,
      });
      toast.error(`Batch #${res.order.order_no} REJECTED & sent back to supervisor.`);
      onOrderUpdated();
    } catch (err: any) {
      const msg = err.message || 'Failed to reject batch.';
      setActionMessage({
        type: 'error',
        text: msg,
      });
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Warning if not verifier */}
      {!isVerifier && (
        <div className="backdrop-blur-xl bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-200">
                Gatekeeper Verifier Terminal - Inspection Mode
              </h3>
              <p className="text-xs text-amber-300/80">
                Your active role is not <strong>Cutting Verifier</strong>. Approvals, count modifications, and rejections are strictly enforced by backend RBAC (403 Forbidden).
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full">
            ROLE RESTRICTED
          </span>
        </div>
      )}

      {/* Top Batch Selector Tabs */}
      <div className="backdrop-blur-xl bg-slate-900/75 border border-white/10 p-3 sm:p-4 rounded-2xl shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Select Cutting Batch for Gatekeeper Audit:</span>
          <span className="text-[10px] font-mono text-cyan-400">Swipe horizontally on mobile</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {orders.map((order) => {
            const isSelected = order.id === selectedOrderId;
            const statusBadgeColors: Record<string, string> = {
              READY_FOR_VERIFICATION: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              VERIFIED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              REJECTED: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              IN_SEWING: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
            };

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className={`touch-target px-3.5 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                    : 'border-white/10 bg-slate-950/50 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-xs">
                    {order.order_no}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                      statusBadgeColors[order.status] || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {order.recipe?.name} • {order.target_qty} pcs
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedOrder ? (
        <div className="space-y-6">
          {/* Order Header Summary & Wastage Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 backdrop-blur-xl bg-slate-900/75 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 mb-3.5 border-b border-white/10 gap-2">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Inspecting Batch Terminal
                  </span>
                  <h2 className="text-lg sm:text-2xl font-black text-white font-mono">
                    {selectedOrder.order_no}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border uppercase shadow-inner ${
                      selectedOrder.status === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : selectedOrder.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    }`}
                  >
                    Status: {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                <div className="backdrop-blur-md bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Recipe (BOM)</div>
                  <div className="text-white font-bold mt-0.5 text-xs sm:text-sm truncate">
                    {selectedOrder.recipe?.name}
                  </div>
                  <div className="text-cyan-400 font-mono text-[10px]">
                    {selectedOrder.recipe?.recipe_code}
                  </div>
                </div>

                <div className="backdrop-blur-md bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Batch Qty</div>
                  <div className="text-white font-black font-mono mt-0.5 text-xs sm:text-sm">
                    {selectedOrder.target_qty} Garments
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Std: {selectedOrder.recipe?.std_fabric_yards} yds/pc
                  </div>
                </div>

                <div className="backdrop-blur-md bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Fabric Roll Tag</div>
                  <div className="text-white font-mono font-bold mt-0.5 text-xs sm:text-sm truncate">
                    {selectedOrder.fabric_roll_id}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Lot Verified
                  </div>
                </div>

                <div className="backdrop-blur-md bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Logged Fabric</div>
                  <div className="text-white font-mono font-bold mt-0.5 text-xs sm:text-sm">
                    {selectedOrder.actual_fabric_yds} yds
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Cap: {selectedOrder.recipe?.wastage_cap}%
                  </div>
                </div>
              </div>
            </div>

            {/* Wastage Gauge Card */}
            <div className="flex flex-col justify-center">
              <WastageGauge wastage={selectedOrder.wastage} />
            </div>
          </div>

          {/* Action Message / Hard-Stop Notification */}
          {actionMessage && (
            <div
              className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 shadow-lg animate-in fade-in ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
              }`}
              role="alert"
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-white">{actionMessage.text}</div>
                {actionMessage.shortages && actionMessage.shortages.length > 0 && (
                  <div className="mt-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-rose-500/40 space-y-1">
                    <div className="font-bold text-rose-400 font-sans uppercase">
                      Deficit Shortage Breakdown (BOM Hard-Stop):
                    </div>
                    {actionMessage.shortages.map((s: any, idx: number) => (
                      <div key={idx} className="text-slate-200">
                        • <strong>{s.component_name}</strong>: Expected {s.expected_qty} pcs, Counted {s.actual_qty} pcs (Shortage: <strong className="text-rose-400">-{s.deficit} pcs</strong>)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GATEKEEPER EVALUATION BANNER */}
          {hasShortage ? (
            <div className="backdrop-blur-xl bg-rose-950/60 border border-rose-500/60 rounded-2xl p-4 shadow-[0_0_25px_rgba(244,63,94,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-rose-200 uppercase tracking-wide">
                    GATEKEEPER HARD-STOP ENGAGED: BATCH APPROVAL IS STRICTLY LOCKED
                  </h3>
                  <p className="text-xs text-rose-300/80 font-medium mt-0.5">
                    {shortages.length} component(s) have physical piece shortages (RED status). Manufacturing compliance forbids releasing incomplete kits.
                  </p>
                </div>
              </div>
              <div className="self-end sm:self-center shrink-0">
                <span className="inline-block bg-rose-600 text-white font-mono font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
                  HTTP 422 GUARD ACTIVE
                </span>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-emerald-950/60 border border-emerald-500/60 rounded-2xl p-4 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0">
                  <Unlock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-emerald-200 uppercase tracking-wide">
                    GATEKEEPER CLEARANCE CRITERIA MET (NO DEFICITS)
                  </h3>
                  <p className="text-xs text-emerald-300/80 font-medium mt-0.5">
                    All BOM components match or exceed recipe expectations (GREEN or YELLOW). Batch is ready for release to Sewing.
                  </p>
                </div>
              </div>
              <div className="self-end sm:self-center shrink-0">
                <span className="inline-block bg-emerald-600 text-white font-mono font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
                  CLEARANCE READY
                </span>
              </div>
            </div>
          )}

          {/* Component Traffic-Light Matrix */}
          <div className="backdrop-blur-xl bg-slate-900/75 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/40">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Physical Component Verification Matrix
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Traffic Light: GREEN (Match) • YELLOW (Excess allowed) • RED (Shortage hard-stop)
                </p>
              </div>

              {isVerifier && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMatchAll}
                    className="touch-target inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded-xl transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto-Match Expected</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCounts}
                    disabled={isSaving}
                    className="touch-target inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-xl transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-300" />
                    <span>{isSaving ? 'Saving...' : 'Save Counts'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 text-xs font-black uppercase tracking-wider border-b border-white/10">
                    <th className="py-3.5 px-4">Component Name</th>
                    <th className="py-3.5 px-4 text-center">BOM Multiplier</th>
                    <th className="py-3.5 px-4 text-center">Expected Qty</th>
                    <th className="py-3.5 px-4 text-center">Physical Count (Actual)</th>
                    <th className="py-3.5 px-4 text-center">Variance</th>
                    <th className="py-3.5 px-4 text-center">Traffic Light Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {evaluatedItems.map((item) => {
                    const isRed = item.status === 'SHORTAGE';
                    const isYellow = item.status === 'EXCESS';

                    return (
                      <tr
                        key={item.component_id}
                        className={`transition-colors ${
                          isRed
                            ? 'bg-rose-950/20 hover:bg-rose-950/30'
                            : isYellow
                            ? 'bg-amber-950/15 hover:bg-amber-950/25'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="py-4 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: isRed ? '#f43f5e' : isYellow ? '#fbbf24' : '#34d399',
                                boxShadow: isRed ? '0 0 8px #f43f5e' : isYellow ? '0 0 8px #fbbf24' : '0 0 8px #34d399',
                              }}
                            />
                            <span>{item.component.component_name}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                          {item.component.pieces_per_garment} pc/gmt
                        </td>

                        <td className="py-4 px-4 text-center font-mono font-black text-white text-base">
                          {item.expected_qty}
                        </td>

                        {/* Interactive Floor Count Stepper */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 backdrop-blur-md bg-slate-950/70 p-1.5 rounded-xl border border-white/10 shadow-inner">
                            {isVerifier && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCountChange(item.component_id, item.currentActual - 5)}
                                  className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/5 transition-all active:scale-95"
                                  title="-5"
                                >
                                  -5
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCountChange(item.component_id, item.currentActual - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/5 transition-all active:scale-95"
                                  title="-1"
                                >
                                  -1
                                </button>
                              </>
                            )}

                            <input
                              type="number"
                              min="0"
                              step="1"
                              disabled={!isVerifier}
                              value={item.currentActual}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                handleCountChange(item.component_id, isNaN(val) ? 0 : val);
                              }}
                              className={`w-20 text-center font-mono font-black text-base py-1.5 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner ${
                                isRed
                                  ? 'border-rose-500 ring-2 ring-rose-500/40'
                                  : isYellow
                                  ? 'border-amber-500 ring-2 ring-amber-500/40'
                                  : 'border-slate-300'
                              }`}
                            />

                            {isVerifier && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCountChange(item.component_id, item.currentActual + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/5 transition-all active:scale-95"
                                  title="+1"
                                >
                                  +1
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCountChange(item.component_id, item.currentActual + 5)}
                                  className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/5 transition-all active:scale-95"
                                  title="+5"
                                >
                                  +5
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center font-mono font-bold text-sm">
                          {item.variance === 0 ? (
                            <span className="text-slate-400">0</span>
                          ) : item.variance > 0 ? (
                            <span className="text-amber-400 font-black">+{item.variance}</span>
                          ) : (
                            <span className="text-rose-400 font-black">
                              -{Math.abs(item.variance)} pcs
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <TrafficLightBadge
                            status={item.status}
                            variance={item.variance}
                            deficit={item.deficit}
                            size="md"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Component Verification Cards (Touch-friendly for phones) */}
            <div className="md:hidden divide-y divide-white/10">
              {evaluatedItems.map((item) => {
                const isRed = item.status === 'SHORTAGE';
                const isYellow = item.status === 'EXCESS';

                return (
                  <div
                    key={item.component_id}
                    className={`p-4 space-y-3 ${
                      isRed ? 'bg-rose-950/25' : isYellow ? 'bg-amber-950/20' : 'bg-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-black text-white text-sm flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: isRed ? '#f43f5e' : isYellow ? '#fbbf24' : '#34d399',
                            boxShadow: isRed ? '0 0 8px #f43f5e' : isYellow ? '0 0 8px #fbbf24' : '0 0 8px #34d399',
                          }}
                        />
                        <span>{item.component.component_name}</span>
                      </div>
                      <TrafficLightBadge
                        status={item.status}
                        variance={item.variance}
                        deficit={item.deficit}
                        size="sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-slate-400">Multiplier:</span> <span className="text-white font-bold">{item.component.pieces_per_garment} pc/gmt</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Expected:</span> <span className="text-cyan-300 font-bold">{item.expected_qty} pcs</span>
                      </div>
                    </div>

                    {/* Touch Stepper on Mobile */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-300">Count:</span>
                      <div className="flex items-center gap-1.5 backdrop-blur-md bg-slate-950/80 p-1.5 rounded-xl border border-white/10">
                        {isVerifier && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCountChange(item.component_id, item.currentActual - 5)}
                              className="touch-target w-9 h-9 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 rounded-lg active:scale-95"
                            >
                              -5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCountChange(item.component_id, item.currentActual - 1)}
                              className="touch-target w-9 h-9 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 rounded-lg active:scale-95"
                            >
                              -1
                            </button>
                          </>
                        )}

                        <input
                          type="number"
                          min="0"
                          step="1"
                          disabled={!isVerifier}
                          value={item.currentActual}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleCountChange(item.component_id, isNaN(val) ? 0 : val);
                          }}
                          className={`w-16 text-center font-mono font-black text-base py-1 border rounded-lg bg-white text-slate-900 ${
                            isRed ? 'border-rose-500' : isYellow ? 'border-amber-500' : 'border-slate-300'
                          }`}
                        />

                        {isVerifier && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCountChange(item.component_id, item.currentActual + 1)}
                              className="touch-target w-9 h-9 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 rounded-lg active:scale-95"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCountChange(item.component_id, item.currentActual + 5)}
                              className="touch-target w-9 h-9 flex items-center justify-center text-xs font-black text-slate-300 bg-slate-800 rounded-lg active:scale-95"
                            >
                              +5
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Decision Toolbar */}
          <div className="backdrop-blur-2xl bg-slate-900/90 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Gatekeeper Decision Terminal</span>
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Approve batch into Sewing Queue, or trigger mandatory Rejection flow with audit notes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Reject Button (Always available to reject defects) */}
              <button
                type="button"
                onClick={() => setIsRejectionModalOpen(true)}
                disabled={!isVerifier || selectedOrder.status === 'REJECTED'}
                className="touch-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-400/50"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Reject Batch (Audit Note)</span>
              </button>

              {/* Approve Button (STRICTLY HARD-STOP GUARDED) */}
              <button
                type="button"
                onClick={handleApprove}
                disabled={!isVerifier || !canApprove || isApproving}
                className={`touch-target w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 ${
                  canApprove && isVerifier
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-1 ring-emerald-300'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-75'
                }`}
                title={hasShortage ? 'LOCKED: Red shortages exist. 422 Hard-Stop' : 'Clear to Approve'}
              >
                {canApprove ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                ) : (
                  <Lock className="w-4 h-4 text-rose-400" />
                )}
                <span>
                  {isApproving
                    ? 'Verifying Batch...'
                    : hasShortage
                    ? 'LOCKED (Shortage Detected)'
                    : 'Approve & Release to Sewing'}
                </span>
              </button>
            </div>
          </div>

          {/* Audit Logs & Verifier History */}
          {selectedOrder.verification_logs && selectedOrder.verification_logs.length > 0 && (
            <div className="backdrop-blur-xl bg-slate-900/75 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Verification Audit Log History</span>
              </h4>
              <div className="space-y-2.5">
                {selectedOrder.verification_logs.map((log) => (
                  <div key={log.id} className="p-1">
                    <AuditLogCard log={log} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 backdrop-blur-xl bg-slate-900/70 rounded-3xl border border-white/10">
          No cutting orders found. Please switch to Cutting Supervisor to issue orders.
        </div>
      )}

      {/* Mandatory Rejection Note Modal */}
      {selectedOrder && (
        <RejectionModal
          isOpen={isRejectionModalOpen}
          orderNo={selectedOrder.order_no}
          onClose={() => setIsRejectionModalOpen(false)}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
};
