'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../context/AuthStore';
import { api } from '../services/api';
import { Recipe, CuttingOrder } from '../types';
import { Header } from '../components/Header';
import { CuttingSupervisorView } from '../components/CuttingSupervisorView';
import { CuttingVerifierTerminal } from '../components/CuttingVerifierTerminal';
import { SewingQueueView } from '../components/SewingQueueView';
import { LoginPage } from '../components/LoginPage';
import {
  Scissors,
  ShieldCheck,
  Factory,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  LogOut,
  Lock,
} from 'lucide-react';

function AccessRestrictedStation({
  station,
  allowedRole,
  currentRole,
  currentUser,
}: {
  station: string;
  allowedRole: string;
  currentRole: string;
  currentUser: string;
}) {
  const { logout } = useAuthStore();
  return (
    <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md w-full backdrop-blur-2xl bg-slate-900/90 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.15)] flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full mb-2">
          403 Forbidden • Access Restricted
        </span>
        <h3 className="text-lg font-black text-white">Station Clearance Required</h3>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          The <span className="text-white font-bold">{station}</span> is strictly restricted to operators with{' '}
          <span className="text-cyan-400 font-bold">{allowedRole}</span> clearance.
        </p>

        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-white/5 w-full text-left text-xs space-y-1.5">
          <div className="text-slate-400">
            Active Operator: <span className="text-white font-bold">{currentUser}</span>
          </div>
          <div className="text-slate-400">
            Assigned Role: <span className="text-amber-400 font-bold uppercase">{currentRole.replace('_', ' ')}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
          You cannot perform operations at this station. To access it, please log out and sign in with an authorized {allowedRole} account.
        </p>

        <button
          onClick={logout}
          className="mt-5 touch-target w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout & Sign In as {allowedRole}</span>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, initAuth, isLoading: authLoading } = useAuthStore();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<CuttingOrder[]>([]);
  const [sewingQueue, setSewingQueue] = useState<CuttingOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'cutting' | 'verifier' | 'sewing'>('cutting');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Initialize Auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Sync activeTab when user logs in to set initial station matching their clearance
  useEffect(() => {
    if (user?.role === 'cutting_supervisor') {
      setActiveTab('cutting');
    } else if (user?.role === 'cutting_verifier') {
      setActiveTab('verifier');
    } else if (user?.role === 'sewing_supervisor') {
      setActiveTab('sewing');
    }
  }, [user]);

  // Load Data
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setFetchError(null);
      // Fetch recipes
      const { recipes: fetchedRecipes } = await api.recipes.list();
      setRecipes(fetchedRecipes);

      // Fetch all cutting orders
      const { orders: fetchedOrders } = await api.orders.list();
      setOrders(fetchedOrders);

      // If user is sewing_supervisor or during general overview, fetch sewing queue if permitted
      if (user.role === 'sewing_supervisor') {
        try {
          const { queue } = await api.sewing.getQueue();
          setSewingQueue(queue);
        } catch {
          // Normal if not sewing supervisor
        }
      } else {
        // Compute from fetchedOrders for badge count (WHERE status = 'VERIFIED')
        const verifiedOnly = fetchedOrders.filter((o) => o.status === 'VERIFIED');
        setSewingQueue(verifiedOnly);
      }
    } catch (err: any) {
      console.error('Error fetching ERP data:', err);
      setFetchError(err.message || 'Unable to connect to backend API server.');
    } finally {
      setIsDataLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    } else if (!authLoading && !user) {
      setIsDataLoading(false);
    }
  }, [authLoading, user, loadData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const pendingVerificationCount = orders.filter(
    (o) => o.status === 'READY_FOR_VERIFICATION'
  ).length;
  const verifiedCount = orders.filter((o) => o.status === 'VERIFIED').length;

  // 1. Loading Initial Authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4">
        <div className="p-6 rounded-3xl backdrop-blur-2xl bg-slate-900/80 border border-white/10 shadow-2xl flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-sm font-bold text-slate-200">
            Connecting to ApparelFlow Manufacturing Telemetry...
          </span>
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Guard: If not logged in, render LoginPage!
  if (!user) {
    return <LoginPage onLoginSuccess={loadData} />;
  }

  const isSupervisor = user.role === 'cutting_supervisor';
  const isVerifier = user.role === 'cutting_verifier';
  const isSewing = user.role === 'sewing_supervisor';

  // 3. Authenticated: Render Manufacturing Floor Workspace with Station Clearance Guards
  return (
    <div className="min-h-screen flex flex-col relative bg-slate-950">
      {/* Top Glassmorphic Header */}
      <Header onRefresh={handleManualRefresh} isRefreshing={isRefreshing} />

      {/* Navigation Sub-Header Tabs with Frosted Glass */}
      <div className="backdrop-blur-xl bg-slate-950/70 border-b border-white/10 sticky top-14 sm:top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="grid grid-cols-3 gap-1 sm:flex sm:space-x-3 sm:gap-0 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth" aria-label="Floor Stations">
            {/* Cutting Tab */}
            <button
              onClick={() => setActiveTab('cutting')}
              className={`touch-target inline-flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shrink-0 sm:shrink cursor-pointer ${
                activeTab === 'cutting'
                  ? 'bg-blue-600/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400/60 ring-1 ring-blue-400/30'
                  : 'backdrop-blur-md bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white border border-white/10'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300 shrink-0" />
              <span className="hidden sm:inline">1. Cutting Floor</span>
              <span className="sm:hidden font-black">1. Cut</span>
              {!isSupervisor && <Lock className="w-3 h-3 text-slate-500 shrink-0 hidden sm:inline" />}
              <span className={`text-[10px] sm:text-[11px] font-mono font-bold px-1 sm:px-1.5 py-0.5 rounded-md shrink-0 ${
                activeTab === 'cutting' ? 'bg-blue-900/90 text-blue-100 border border-blue-400/30' : 'bg-slate-800 text-slate-300'
              }`}>
                {orders.length}
              </span>
            </button>

            {/* Verifier Tab */}
            <button
              onClick={() => setActiveTab('verifier')}
              className={`touch-target inline-flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shrink-0 sm:shrink cursor-pointer ${
                activeTab === 'verifier'
                  ? 'bg-amber-600/90 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-400/60 ring-1 ring-amber-400/30'
                  : 'backdrop-blur-md bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white border border-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">2. Gatekeeper Verifier</span>
              <span className="sm:hidden font-black">2. Verify</span>
              {!isVerifier && <Lock className="w-3 h-3 text-slate-500 shrink-0 hidden sm:inline" />}
              {pendingVerificationCount > 0 ? (
                <span className="text-[10px] sm:text-[11px] font-mono font-black px-1 sm:px-1.5 py-0.5 rounded-md bg-rose-500 text-white animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)] shrink-0">
                  <span className="hidden sm:inline">{pendingVerificationCount} Pending</span>
                  <span className="sm:hidden">{pendingVerificationCount}</span>
                </span>
              ) : (
                <span className={`text-[10px] sm:text-[11px] font-mono font-bold px-1 sm:px-1.5 py-0.5 rounded-md shrink-0 ${
                  activeTab === 'verifier' ? 'bg-amber-900/90 text-amber-100' : 'bg-slate-800 text-slate-300'
                }`}>
                  0
                </span>
              )}
            </button>

            {/* Sewing Tab */}
            <button
              onClick={() => setActiveTab('sewing')}
              className={`touch-target inline-flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-1.5 sm:px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shrink-0 sm:shrink cursor-pointer ${
                activeTab === 'sewing'
                  ? 'bg-emerald-600/90 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/60 ring-1 ring-emerald-400/30'
                  : 'backdrop-blur-md bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white border border-white/10'
              }`}
            >
              <Factory className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
              <span className="hidden sm:inline">3. Sewing Queue (Verified)</span>
              <span className="sm:hidden font-black">3. Sew</span>
              {!isSewing && <Lock className="w-3 h-3 text-slate-500 shrink-0 hidden sm:inline" />}
              <span className={`text-[10px] sm:text-[11px] font-mono font-bold px-1 sm:px-1.5 py-0.5 rounded-md shrink-0 ${
                activeTab === 'sewing' ? 'bg-emerald-900/90 text-emerald-100 border border-emerald-400/30' : 'bg-slate-800 text-slate-300'
              }`}>
                <span className="hidden sm:inline">{verifiedCount} Ready</span>
                <span className="sm:hidden">{verifiedCount}</span>
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Floor Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {fetchError && (
          <div className="mb-6 p-4 backdrop-blur-xl bg-rose-950/60 border border-rose-500/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 font-medium shadow-[0_0_25px_rgba(244,63,94,0.25)]">
            <div className="flex items-center gap-2.5 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                Backend API Notice: {fetchError}. Please verify backend server is listening on port 4000.
              </span>
            </div>
            <button
              onClick={handleManualRefresh}
              className="touch-target px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {isDataLoading && (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-2xl backdrop-blur-xl bg-slate-900/70 border border-white/10 shadow-2xl">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
            <span className="text-sm font-bold text-slate-300">
              Loading floor operations data...
            </span>
          </div>
        )}

        {!isDataLoading && (
          <div className="animate-in fade-in duration-200">
            {activeTab === 'cutting' && (
              isSupervisor ? (
                <CuttingSupervisorView
                  recipes={recipes}
                  orders={orders}
                  onOrderCreated={loadData}
                />
              ) : (
                <AccessRestrictedStation
                  station="1. Cutting Floor"
                  allowedRole="Cutting Supervisor"
                  currentRole={user.role}
                  currentUser={user.full_name}
                />
              )
            )}

            {activeTab === 'verifier' && (
              isVerifier ? (
                <CuttingVerifierTerminal
                  orders={orders}
                  onOrderUpdated={loadData}
                />
              ) : (
                <AccessRestrictedStation
                  station="2. Gatekeeper Verifier Terminal"
                  allowedRole="Cutting Verifier"
                  currentRole={user.role}
                  currentUser={user.full_name}
                />
              )
            )}

            {activeTab === 'sewing' && (
              isSewing ? (
                <SewingQueueView
                  queue={sewingQueue}
                  onQueueUpdated={loadData}
                />
              ) : (
                <AccessRestrictedStation
                  station="3. Sewing Assembly Queue"
                  allowedRole="Sewing Supervisor"
                  currentRole={user.role}
                  currentUser={user.full_name}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Industrial Modern Glassy Footer */}
      <footer className="backdrop-blur-xl bg-slate-950/80 border-t border-white/10 text-xs py-4 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left text-slate-400">
          <div>
            <span className="font-bold text-slate-200">ApparelFlow ERP</span> — ISO 9001 Cutting Room Gatekeeper & Traceability Architecture
          </div>
          <div className="font-mono text-[11px] text-cyan-400/70">
            Strict Multiplier: Expected = Batch Qty × BOM Pieces • Server Hard Stop: 422 Unprocessable Entity
          </div>
        </div>
      </footer>
    </div>
  );
}
