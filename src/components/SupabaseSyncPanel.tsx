/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cloud, CloudLightning, CloudOff, Database, ShieldCheck, Lock, User, Key, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';

export const SupabaseSyncPanel: React.FC = () => {
  const {
    supabaseUser,
    isSupabaseSynced,
    isSupabaseConfigured,
    signUpWithSupabase,
    signInWithSupabase,
    signOutSupabase,
    profile,
    addNotification
  } = useApp();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>(profile.fullName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const { error: signUpErr } = await signUpWithSupabase(email, password, fullName);
        if (signUpErr) {
          setError(signUpErr.message || 'Error signing up');
        } else {
          addNotification('Supabase Account created successfully! Synced local profile to cloud.');
        }
      } else {
        const { error: signInErr } = await signInWithSupabase(email, password);
        if (signInErr) {
          setError(signInErr.message || 'Error signing in');
        } else {
          addNotification('Welcome back! Successfully logged into Supabase.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // 1. SUPABASE NOT CONFIGURED YET (Sandbox Local-first Mode)
  if (!isSupabaseConfigured) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <CloudOff className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Supabase Cloud Storage: Sandbox Local Mode
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Offline-First
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-semibold max-w-2xl leading-relaxed">
                Connect your live Supabase project to activate PostgreSQL database persistence, Row-Level Security, real-time notifications, and multi-device backups.
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center">
            <span className="text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-350 font-mono py-1 px-3 rounded-lg font-bold border border-slate-150 dark:border-slate-800">
              VITE_SUPABASE_URL is missing
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-2">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-widest block">Quick Setup Guide</span>
          <ol className="text-[10px] text-slate-400 font-semibold list-decimal list-inside space-y-1">
            <li>Open the <strong className="text-slate-600 dark:text-slate-200">Settings</strong> panel in AI Studio.</li>
            <li>Define the secret keys <strong className="text-slate-600 dark:text-slate-200">VITE_SUPABASE_URL</strong> and <strong className="text-slate-600 dark:text-slate-200">VITE_SUPABASE_ANON_KEY</strong>.</li>
            <li>Run the database scripts in your Supabase SQL editor using the template in <strong className="text-slate-600 dark:text-slate-200">supabase/schema.sql</strong>.</li>
          </ol>
        </div>
      </div>
    );
  }

  // 2. SUPABASE IS CONFIGURED & LOGGED IN (Synchronized)
  if (supabaseUser) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl p-6 shadow-2xs space-y-4 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CloudLightning className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Supabase Connected & Synchronized
                <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Sync
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-semibold max-w-2xl leading-relaxed">
                Active Session: <span className="text-slate-600 dark:text-slate-200 font-bold">{supabaseUser.email}</span>. Your underwriting scores, liability tracking logs, support escalations, and scam reports are securely bound to your private cloud container.
              </p>
            </div>
          </div>
          <button
            id="supabase-logout-btn"
            onClick={signOutSupabase}
            className="self-start sm:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-100 dark:border-slate-850"
          >
            <LogOut className="h-4 w-4" /> Disconnect Session
          </button>
        </div>

        {isSupabaseSynced && (
          <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="h-4 w-4 stroke-[3]" /> All local audits synced with PostgreSQL database successfully (RLS Policies Active).
          </div>
        )}
      </div>
    );
  }

  // 3. SUPABASE IS CONFIGURED BUT NOT LOGGED IN (Authentication Screen)
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-fadeIn">
      {/* Information text */}
      <div className="md:col-span-7 space-y-3.5 pr-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
            Cloud Sync Integration
          </span>
        </div>

        <h3 className="text-lg font-bold">Activate Live Supabase Database Sync</h3>
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          We found your Supabase credentials! Connect your account to enable a durable, production-ready backend. After authenticating, your debts, compliance reports, and profile are saved directly to your PostgreSQL tables using Row Level Security (RLS).
        </p>

        <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1.5">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> PostgreSQL DB
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> JWT Auth
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> Row-Level Security
          </span>
        </div>
      </div>

      {/* Auth Mini-Form */}
      <form onSubmit={handleSubmit} className="md:col-span-5 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            {isRegister ? 'Register Cloud Profile' : 'Access Cloud Account'}
          </span>
          <button
            id="toggle-auth-mode-btn"
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            {isRegister ? 'Switch to Log In' : 'Create an Account'}
          </button>
        </div>

        {error && (
          <p className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded border border-rose-100 dark:border-rose-950/30">
            {error}
          </p>
        )}

        <div className="space-y-3">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="supabase-auth-name"
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl py-2 pl-10 pr-3.5 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              id="supabase-auth-email"
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl py-2 pl-10 pr-3.5 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              id="supabase-auth-password"
              type="password"
              placeholder="Password (min 6 chars)"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl py-2 pl-10 pr-3.5 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
        </div>

        <button
          id="supabase-auth-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:bg-emerald-400"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              {isRegister ? 'Register & Sync' : 'Access Database Sync'} <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
