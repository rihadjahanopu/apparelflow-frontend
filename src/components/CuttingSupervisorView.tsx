'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Recipe, CuttingOrder } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import {
  Scissors,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { WastageGauge } from './WastageGauge';
import { AuditLogCard } from './AuditLogCard';

interface Props {
  recipes: Recipe[];
  orders: CuttingOrder[];
  onOrderCreated: () => void;
}

export const CuttingSupervisorView: React.FC<Props> = ({
  recipes,
  orders,
  onOrderCreated,
}) => {
  const { activeRole } = useAuthStore();
  const isSupervisor = activeRole === 'cutting_supervisor';

  // Form State
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(recipes[0]?.id || 1);
  const [targetQty, setTargetQty] = useState<number>(100);
  const [fabricRollId, setFabricRollId] = useState<string>('ROLL-TX-9901');
  const [actualFabricYds, setActualFabricYds] = useState<number>(184.0);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];

  // Real-time calculations
  const expectedFabricYards = selectedRecipe ? targetQty * selectedRecipe.std_fabric_yards : 0;
  const rawWastage =
    expectedFabricYards > 0
      ? ((actualFabricYds - expectedFabricYards) / expectedFabricYards) * 100
      : 0;
  const wastagePct = Math.round(rawWastage * 100) / 100;
  const exceededCap = selectedRecipe ? wastagePct > selectedRecipe.wastage_cap : false;

  // Defensive validation guards
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedRecipeId) {
      errs.recipe = 'Please select a garment recipe BOM.';
    }

    if (!targetQty || isNaN(targetQty) || targetQty <= 0) {
      errs.targetQty = 'Target batch quantity must be a strictly positive integer (> 0).';
    } else if (!Number.isInteger(targetQty)) {
      errs.targetQty = 'Target quantity cannot contain fractional pieces/decimals.';
    }

    if (!fabricRollId || fabricRollId.trim() === '') {
      errs.fabricRollId = 'Fabric Roll ID / Lot number is mandatory.';
    }

    if (
      actualFabricYds === undefined ||
      actualFabricYds === null ||
      isNaN(actualFabricYds) ||
      actualFabricYds <= 0
    ) {
      errs.actualFabricYds = 'Actual fabric yards used must be greater than 0.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRecipeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = parseInt(e.target.value, 10);
    setSelectedRecipeId(newId);
    const recipe = recipes.find((r) => r.id === newId);
    if (recipe) {
      // Auto-compute sensible initial fabric yards based on targetQty * std
      const autoYds = Math.round(targetQty * recipe.std_fabric_yards * 1.025 * 10) / 10;
      setActualFabricYds(autoYds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.orders.create({
        recipe_id: selectedRecipeId,
        target_qty: Math.floor(targetQty),
        fabric_roll_id: fabricRollId.trim(),
        actual_fabric_yds: actualFabricYds,
        initial_counts_matched: true,
      });

      setSuccessMsg(`Order ${res.order.order_no} created successfully and dispatched to Verifier Terminal!`);
      toast.success(`Cutting order #${res.order.order_no} created & dispatched!`);
      // Generate new roll ID for next batch
      setFabricRollId(`ROLL-${Math.floor(1000 + Math.random() * 9000)}`);
      onOrderCreated();
    } catch (err: any) {
      const msg = err.message || 'Failed to create cutting order.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Guard Warning if non-supervisor is inspecting */}
      {!isSupervisor && (
        <div className="backdrop-blur-xl bg-amber-950/40 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300">
              <ShieldAlert className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-200">
                Supervisor Creation Terminal - View Only Mode
              </h3>
              <p className="text-xs text-amber-300/80">
                Your current active role is not <strong>Cutting Supervisor</strong>. Order issuance is disabled for this persona.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full">
            READ ONLY
          </span>
        </div>
      )}

      {/* Main Grid: Form + BOM Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Col: Order Creation Form */}
        <div className="lg:col-span-7 backdrop-blur-xl bg-slate-900/75 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-white/10">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] text-white">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Issue New Cutting Order
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Select recipe BOM, specify batch quantity, and log fabric roll consumption
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="mb-4 p-3.5 backdrop-blur-md bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center gap-2.5 text-emerald-200 text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {apiError && (
              <div className="mb-4 p-3.5 backdrop-blur-md bg-rose-950/60 border border-rose-500/50 rounded-2xl flex items-center gap-2.5 text-rose-200 text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipe Selection */}
              <div>
                <label
                  htmlFor="recipe-select"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Production Recipe (BOM) <span className="text-rose-400">*</span>
                </label>
                <select
                  id="recipe-select"
                  disabled={!isSupervisor || isSubmitting}
                  value={selectedRecipeId}
                  onChange={handleRecipeChange}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id} className="text-slate-900 font-medium">
                      {r.recipe_code} - {r.name} ({r.category}) • Std {r.std_fabric_yards} yds/pc • Max Wastage {r.wastage_cap}%
                    </option>
                  ))}
                </select>
                {errors.recipe && (
                  <p className="text-xs font-bold text-rose-400 mt-1">{errors.recipe}</p>
                )}
              </div>

              {/* Target Batch Qty with Quick Steppers */}
              <div>
                <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-1.5 gap-1">
                  <label
                    htmlFor="target-qty"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                  >
                    Target Batch Quantity (Garments) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] sm:text-xs font-mono text-cyan-400 font-semibold">
                    Integer Guard: &gt; 0
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="target-qty"
                    type="number"
                    min="1"
                    step="1"
                    disabled={!isSupervisor || isSubmitting}
                    value={targetQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setTargetQty(isNaN(val) ? 0 : Math.max(0, val));
                      if (errors.targetQty) {
                        setErrors((prev) => ({ ...prev, targetQty: '' }));
                      }
                    }}
                    className={`flex-1 bg-white text-slate-900 font-mono font-black text-base border rounded-xl p-2.5 sm:p-3 shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors.targetQty ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-300'
                    }`}
                    placeholder="e.g. 100"
                  />

                  {isSupervisor && (
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {[50, 100, 200].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTargetQty(preset)}
                          className="touch-target px-3 py-2 text-xs font-black text-slate-200 bg-slate-800/80 hover:bg-blue-600 hover:text-white border border-white/10 rounded-xl transition-all shadow-sm"
                        >
                          {preset} pcs
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.targetQty && (
                  <p className="text-xs font-bold text-rose-400 mt-1">{errors.targetQty}</p>
                )}
              </div>

              {/* Fabric Roll & Yards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="fabric-roll"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Fabric Roll / Lot ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="fabric-roll"
                    type="text"
                    disabled={!isSupervisor || isSubmitting}
                    value={fabricRollId}
                    onChange={(e) => {
                      setFabricRollId(e.target.value);
                      if (errors.fabricRollId) {
                        setErrors((prev) => ({ ...prev, fabricRollId: '' }));
                      }
                    }}
                    className={`w-full bg-white text-slate-900 font-mono font-bold text-sm border rounded-xl p-2.5 sm:p-3 shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors.fabricRollId ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-300'
                    }`}
                    placeholder="e.g. ROLL-TX-9481"
                  />
                  {errors.fabricRollId && (
                    <p className="text-xs font-bold text-rose-400 mt-1">{errors.fabricRollId}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="actual-fabric"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                  >
                    Actual Fabric Yards Used <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="actual-fabric"
                      type="number"
                      step="0.1"
                      min="0.1"
                      disabled={!isSupervisor || isSubmitting}
                      value={actualFabricYds}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setActualFabricYds(isNaN(val) ? 0 : val);
                        if (errors.actualFabricYds) {
                          setErrors((prev) => ({ ...prev, actualFabricYds: '' }));
                        }
                      }}
                      className={`w-full bg-white text-slate-900 font-mono font-bold text-sm border rounded-xl p-2.5 sm:p-3 shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        errors.actualFabricYds ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-300'
                      }`}
                      placeholder="e.g. 184.5"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">
                      yds
                    </span>
                  </div>
                  {errors.actualFabricYds && (
                    <p className="text-xs font-bold text-rose-400 mt-1">{errors.actualFabricYds}</p>
                  )}
                </div>
              </div>

              {/* Real-time Pre-computation Preview */}
              <div className="p-3.5 backdrop-blur-md bg-slate-950/60 border border-white/10 rounded-2xl">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex flex-wrap items-center justify-between gap-1">
                  <span>Fabric Consumption Calculation</span>
                  {exceededCap ? (
                    <span className="text-rose-400 font-black flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Warning: Wastage Exceeds Cap!
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Safe: Within {selectedRecipe?.wastage_cap}% Cap
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-white/10">
                    <div className="text-slate-400 font-medium text-[10px] sm:text-xs">Std Expected</div>
                    <div className="font-mono font-black text-white mt-0.5 text-xs sm:text-sm">
                      {expectedFabricYards.toFixed(1)} yds
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-white/10">
                    <div className="text-slate-400 font-medium text-[10px] sm:text-xs">Logged Fabric</div>
                    <div className="font-mono font-black text-white mt-0.5 text-xs sm:text-sm">
                      {actualFabricYds.toFixed(1)} yds
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-xl border font-mono font-bold ${
                      exceededCap
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    }`}
                  >
                    <div className="text-[10px] sm:text-xs font-sans text-slate-300">Projected Wastage</div>
                    <div className="mt-0.5 text-xs sm:text-sm">
                      {wastagePct > 0 ? `+${wastagePct.toFixed(2)}%` : `${wastagePct.toFixed(2)}%`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isSupervisor || isSubmitting}
                className="touch-target w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Dispatching Order...' : 'Dispatch Order to Verifier Terminal'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Bill of Materials (BOM) Breakdown Multiplier */}
        <div className="lg:col-span-5 backdrop-blur-xl bg-slate-900/75 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
              <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  BOM Component Multiplier
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Formula: Expected = Batch Qty ({targetQty}) × Pieces/Garment
                </p>
              </div>
            </div>

            {selectedRecipe ? (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
                  <span>Component Name</span>
                  <span>Pieces × Multiplier</span>
                </div>

                <div className="divide-y divide-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md bg-slate-950/50">
                  {selectedRecipe.recipe_components.map((comp) => {
                    const expectedTotal = targetQty * comp.pieces_per_garment;
                    return (
                      <div
                        key={comp.id}
                        className="p-3 hover:bg-white/5 transition-colors flex items-center justify-between text-xs sm:text-sm"
                      >
                        <div className="font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <span>{comp.component_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[11px] text-slate-400 mr-2">
                            {comp.pieces_per_garment} pc/gmt
                          </span>
                          <span className="font-mono font-black text-cyan-300 bg-slate-900 border border-cyan-500/30 px-2 py-0.5 rounded-lg shadow-inner">
                            {expectedTotal} pcs
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Loading recipe components...</p>
            )}
          </div>

          <div className="mt-6 p-3.5 backdrop-blur-md bg-blue-950/40 border border-blue-500/30 rounded-2xl text-xs text-blue-200 leading-relaxed shadow-inner">
            <span className="font-bold text-cyan-300">Downstream Quality Clearance:</span> Once dispatched, the cutting verifier will count every physical bundle. Any shortage below expected count triggers an automated Gatekeeper hard-stop.
          </div>
        </div>
      </div>

      {/* Orders Dashboard Table & Mobile Cards */}
      <div className="backdrop-blur-xl bg-slate-900/75 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/40">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Cutting Floor Batch Register
            </h3>
            <p className="text-xs font-medium text-slate-400">
              Live tracking of cutting orders, gatekeeper status, and verifier audit logs
            </p>
          </div>
          <div className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
            Total Batches: {orders.length}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-300 text-xs font-black uppercase tracking-wider border-b border-white/10">
                <th className="py-3.5 px-4">Order No</th>
                <th className="py-3.5 px-4">Recipe</th>
                <th className="py-3.5 px-4">Roll / Lot</th>
                <th className="py-3.5 px-4 text-center">Batch Qty</th>
                <th className="py-3.5 px-4 text-center">Fabric (Act / Std)</th>
                <th className="py-3.5 px-4 text-center">Gatekeeper Status</th>
                <th className="py-3.5 px-4">Verifier Audit / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No cutting orders logged yet. Dispatch an order above to start.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusColors: Record<string, string> = {
                    READY_FOR_VERIFICATION: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
                    VERIFIED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-bold',
                    REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)] font-bold',
                    IN_SEWING: 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)] font-bold',
                    COMPLETED: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)] font-bold',
                  };

                  const latestLog = order.verification_logs?.[0];

                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {order.order_no}
                      </td>
                      <td className="py-3.5 px-4 text-white font-bold">
                        <div>{order.recipe?.name || 'Recipe'}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          {order.recipe?.recipe_code}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-300">
                        {order.fabric_roll_id}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                        {order.target_qty} pcs
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        <span className="font-bold text-white">{order.actual_fabric_yds}</span>
                        <span className="text-slate-500"> / </span>
                        <span className="text-slate-400">
                          {((order.target_qty || 0) * (order.recipe?.std_fabric_yards || 0)).toFixed(1)} yds
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs rounded-full border ${
                            statusColors[order.status] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-sm">
                        <AuditLogCard log={latestLog} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Card View (Phones & small screens) */}
        <div className="md:hidden divide-y divide-white/10">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No cutting orders logged yet.
            </div>
          ) : (
            orders.map((order) => {
              const statusColors: Record<string, string> = {
                READY_FOR_VERIFICATION: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
                VERIFIED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
                REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
                IN_SEWING: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
              };
              const latestLog = order.verification_logs?.[0];

              return (
                <div key={order.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-base">
                      {order.order_no}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[11px] rounded-full border ${statusColors[order.status] || 'bg-slate-800'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{order.recipe?.name}</span> ({order.recipe?.recipe_code})
                    </div>
                    <div className="font-mono text-cyan-300 font-bold">
                      {order.target_qty} pcs
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-slate-400">Roll ID:</span> <span className="text-white font-bold">{order.fabric_roll_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Fabric:</span> <span className="text-white font-bold">{order.actual_fabric_yds} yds</span>
                    </div>
                  </div>

                  {latestLog && (
                    <div className="pt-1">
                      <AuditLogCard log={latestLog} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
