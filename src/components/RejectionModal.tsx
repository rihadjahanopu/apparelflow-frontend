'use client';

import React, { useState } from 'react';
import { X, AlertOctagon, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  orderNo: string;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
}

export const RejectionModal: React.FC<Props> = ({ isOpen, orderNo, onClose, onSubmit }) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Rejection audit note is mandatory. Please explain defects or shortages for the cutting floor supervisor.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(note.trim());
      setNote('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-slate-950/80 p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rejection-modal-title"
    >
      <div className="backdrop-blur-2xl bg-slate-900/95 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-lg w-full border border-rose-500/50 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-rose-950/70 px-5 sm:px-6 py-4 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-rose-600 rounded-xl text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 id="rejection-modal-title" className="text-base sm:text-lg font-black text-white">
                Reject Batch to Cutting Floor
              </h2>
              <p className="text-xs text-rose-300 font-mono font-medium">Batch Order: {orderNo}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div className="backdrop-blur-md bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200 leading-relaxed shadow-inner">
            <span className="font-bold text-amber-300">Strict Audit Requirement:</span> Submitting a rejection will immediately mark this batch as <strong className="text-rose-400">REJECTED</strong> and notify the cutting supervisor. You must document root-cause reasons (e.g., miscuts, blade fraying, physical shortages).
          </div>

          <div>
            <label
              htmlFor="rejection-note"
              className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5"
            >
              Mandatory Verifier Audit Note <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="rejection-note"
              rows={4}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Discovered 8 frayed neck bindings during physical verification count. Fabric die damaged edges. Batch returned for partial recut."
              className={`w-full rounded-xl border p-3.5 text-sm font-medium bg-white text-slate-900 placeholder:text-slate-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                error ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-slate-300'
              }`}
              required
            />
            <div className="flex justify-between items-center mt-1 text-xs text-slate-400 font-mono">
              <span>Audit compliance enforced</span>
              <span>{note.length} characters</span>
            </div>

            {error && (
              <p className="mt-2 text-xs font-bold text-rose-300 bg-rose-950/80 p-2.5 rounded-xl border border-rose-500/40" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="touch-target px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="touch-target inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Audit...' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
