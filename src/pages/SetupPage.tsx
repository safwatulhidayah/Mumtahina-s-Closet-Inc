import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Lock,
  Server,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Layers,
  Sparkles,
} from 'lucide-react';
import { setupApi, DatabaseStatusResponse } from '../lib/api';
import { BrandLogo } from '../components/BrandLogo';

export const SetupPage: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [installSecret, setInstallSecret] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<{
    success: boolean;
    message?: string;
    tableCount?: number;
    tables?: string[];
    counts?: Record<string, number>;
    error?: string;
  } | null>(null);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await setupApi.getStatus();
      setStatus(res);
    } catch {
      setStatus({
        success: false,
        connected: false,
        installed: false,
        message: 'Could not reach Hostinger backend server.',
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installSecret.trim() || isInstalling) return;

    setIsInstalling(true);
    setInstallResult(null);

    try {
      const res = await setupApi.install(installSecret.trim());
      setInstallResult(res);
      if (res.success) {
        // Refresh status after installation
        await fetchStatus();
      }
    } catch (err: any) {
      setInstallResult({
        success: false,
        error: err?.message || 'Installation request failed.',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const requiredTablesList = [
    'users',
    'categories',
    'products',
    'orders',
    'order_items',
    'cart_items',
    'wishlists',
    'reviews',
    'inquiries',
    'shipping_addresses',
    'zelle_settings',
    'website_settings',
    'password_resets',
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F6] text-[#0F1E36] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF5EE] text-[#2D6A4F] text-xs font-semibold tracking-wider uppercase">
            <Server className="w-3.5 h-3.5" />
            Hostinger MySQL Database Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0F1E36] tracking-tight">
            Automated Database Setup
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            One-time automated installer for Mumtahina’s Closet Inc. Creates all 13 relational MySQL tables, indexes, and initial catalogs directly on your Hostinger hosting account.
          </p>
        </div>

        {/* Database Health & Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0F2] text-[#8E1B3E] flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F1E36]">Database Health Status</h2>
                <p className="text-xs text-slate-500">Live inspection of Hostinger MySQL & schema readiness</p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              disabled={isLoadingStatus}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F1E36] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Connection */}
            <div className="p-4 rounded-xl border border-slate-100 bg-[#FAF7F6]">
              <span className="text-xs font-medium text-slate-500 block mb-1">MySQL Connection</span>
              <div className="flex items-center gap-2">
                {status?.connected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-emerald-700">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-sm font-semibold text-amber-700">Not Connected</span>
                  </>
                )}
              </div>
            </div>

            {/* Tables Count */}
            <div className="p-4 rounded-xl border border-slate-100 bg-[#FAF7F6]">
              <span className="text-xs font-medium text-slate-500 block mb-1">Schema Tables</span>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8E1B3E] shrink-0" />
                <span className="text-sm font-semibold text-[#0F1E36]">
                  {status?.tableCount ?? 0} / {status?.totalRequired ?? 13} Verified
                </span>
              </div>
            </div>

            {/* Lock State */}
            <div className="p-4 rounded-xl border border-slate-100 bg-[#FAF7F6]">
              <span className="text-xs font-medium text-slate-500 block mb-1">Installation Security</span>
              <div className="flex items-center gap-2">
                {status?.isLocked ? (
                  <>
                    <Lock className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                    <span className="text-sm font-semibold text-[#2D6A4F]">Permanently Locked</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">Installer Active</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {status?.error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Configuration Notice</p>
                <p>{status.error}</p>
              </div>
            </div>
          )}

          {/* Table Breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Database Tables Checklist
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {requiredTablesList.map((tbl) => {
                const exists = status?.existingTables?.includes(tbl);
                return (
                  <div
                    key={tbl}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
                      exists
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    {exists ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className="font-mono truncate">{tbl}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Installation Execution Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5EE] text-[#2D6A4F] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0F1E36]">Run Automated Installation</h2>
              <p className="text-xs text-slate-500">
                Executes the server-side schema.sql directly into your Hostinger MySQL database
              </p>
            </div>
          </div>

          {status?.isLocked ? (
            <div className="p-6 rounded-xl bg-[#EBF5EE] border border-[#2D6A4F]/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#2D6A4F]">
                Installation Completed & Securely Locked
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your Hostinger MySQL database has been initialized with all 13 required tables. The installer endpoint has locked itself to prevent unintended resets.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#8E1B3E] text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Go to Admin Panel
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F1E36] text-xs font-semibold transition-colors"
                >
                  Return to Storefront
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInstall} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F1E36] mb-1.5">
                  Installation Secret Passphrase
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={installSecret}
                    onChange={(e) => setInstallSecret(e.target.value)}
                    placeholder="Enter INSTALL_SECRET from config/config.env.php"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E1B3E]/30 focus:border-[#8E1B3E]"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  For security, the secret passphrase is set server-side in{' '}
                  <code className="text-[#8E1B3E] font-mono bg-[#FAF0F2] px-1 py-0.5 rounded">
                    hostinger-backend/config/config.env.php
                  </code>
                </p>
              </div>

              {installResult?.error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{installResult.error}</span>
                </div>
              )}

              {installResult?.success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{installResult.message}</span>
                  </div>
                  <p>All {installResult.tableCount} relational tables created and verified.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isInstalling || !installSecret.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#8E1B3E] text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {isInstalling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Installing MySQL Tables & Seeds...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Execute Automated Database Installation
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security & Architecture Highlights */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-[#0F1E36] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#8E1B3E]" />
            Security & Zero-Arbitrary-SQL Protection
          </p>
          <p>
            The automated installer strictly executes the pre-audited server-side SQL file{' '}
            <code className="text-slate-800 font-mono">hostinger-backend/database/schema.sql</code>. It rejects arbitrary SQL input, requires an HMAC secret check, and locks itself permanently via <code className="text-slate-800 font-mono">installed.lock</code> upon successful execution.
          </p>
        </div>
      </div>
    </div>
  );
};
