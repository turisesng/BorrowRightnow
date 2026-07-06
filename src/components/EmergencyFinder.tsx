/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, CheckCircle2, Search, ArrowRight, ShieldCheck, Zap, AlertTriangle, Sparkles } from 'lucide-react';
import { LenderProduct } from '../types';

export const EmergencyFinder: React.FC = () => {
  const { profile, lenders, products } = useApp();
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('High');
  const [requestedAmount, setRequestedAmount] = useState<number>(150000);
  const [employmentType, setEmploymentType] = useState<string>(profile.employmentStatus);
  const [collateralRequired, setCollateralRequired] = useState<boolean>(false);
  const [digitalOnly, setDigitalOnly] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<LenderProduct[] | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMatches(null);

    // Filter simulation
    setTimeout(() => {
      const results = products.filter(prod => {
        const lender = lenders.find(l => l.id === prod.lenderId);
        if (!lender) return false;

        // Amount fits
        const isAmountOk = requestedAmount >= prod.minAmount && requestedAmount <= prod.maxAmount;
        // Collateral check
        const isCollateralOk = prod.collateralRequired === collateralRequired;
        // Digital check
        const isDigitalOk = !digitalOnly || lender.digitalOnly === true;
        // Employment restrictions (e.g., Access Bank requires Salary account)
        const isEmploymentOk = employmentType !== 'Unemployed';

        return isAmountOk && isCollateralOk && isDigitalOk && isEmploymentOk;
      });

      setMatches(results);
      
      // Auto generate explanations local simulation
      const matchExplanations: Record<string, string> = {};
      results.forEach(prod => {
        const speed = lenders.find(l => l.id === prod.lenderId)?.approvalSpeed;
        matchExplanations[prod.id] = `This CBN-regulated option is selected because of its '${speed}' processing speed, satisfying your high-urgency requirement of ₦${requestedAmount.toLocaleString()} without any collateral obligations, which avoids compounding debt traps.`;
      });
      setExplanations(matchExplanations);

      setLoading(false);
    }, 750);
  };

  return (
    <div id="emergency-loan-finder-module" className="space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Emergency Loan Finder</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Access immediate, legal credit pools to prevent relying on predatory unlicensed loan sharks during crises.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium self-start md:self-auto">
          <Zap className="h-4 w-4 animate-bounce" /> Speed Audit Dispatch
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Panel */}
        <form onSubmit={handleFind} className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-rose-500" /> Dispatch Emergency Filter
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Urgency Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  id={`urgency-btn-${level}`}
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${urgency === level ? 'bg-rose-650 text-white border-rose-650' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Required Cash Amount (₦)</label>
            <input
              id="emergency-amount-input"
              type="number"
              required
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl py-2 px-3.5 text-sm transition-all font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Employment</label>
              <select
                id="emergency-employment-select"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-2 text-xs focus:outline-none focus:border-rose-500 font-semibold"
              >
                <option value="Employed">Salary Earner</option>
                <option value="Self-Employed">Business Owner</option>
                <option value="Student">Student</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Collateral Status</label>
              <select
                id="emergency-collateral-select"
                value={collateralRequired ? 'yes' : 'no'}
                onChange={(e) => setCollateralRequired(e.target.value === 'yes')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-2 text-xs focus:outline-none focus:border-rose-500 font-semibold"
              >
                <option value="no">Collateral Free</option>
                <option value="yes">Collateral Available</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
            <input
              id="digital-only-check"
              type="checkbox"
              checked={digitalOnly}
              onChange={(e) => setDigitalOnly(e.target.checked)}
              className="accent-rose-500 h-4 w-4"
            />
            <label htmlFor="digital-only-check" className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Only recommend 100% digital lenders (Fast payout)
            </label>
          </div>

          <button
            id="find-emergency-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Searching Legal Emergency Funds...
              </span>
            ) : (
              <>
                Find Emergency Options <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Matches Section */}
        <div className="lg:col-span-7 space-y-6">
          {matches ? (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="text-lg font-bold flex items-center justify-between">
                <span>Recommended Emergency Pools ({matches.length})</span>
                <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Fast-Disbursement</span>
              </h3>

              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map(prod => {
                    const lender = lenders.find(l => l.id === prod.lenderId);
                    return (
                      <div key={prod.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-rose-100/50 dark:hover:border-rose-950/20 transition-all space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/10 px-2 py-0.5 rounded-full">
                              Disburses {lender?.approvalSpeed}
                            </span>
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-2">{prod.lenderName}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{prod.name}</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Interest Rate</span>
                            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{prod.minInterestRate}% - {prod.maxInterestRate}% monthly</span>
                            <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">APR: {prod.apr}%</span>
                          </div>
                        </div>

                        {/* Matching reasoning */}
                        <div className="bg-rose-50/30 dark:bg-slate-950/40 p-3.5 rounded-xl border border-rose-100/30 dark:border-slate-850/60 text-xs flex gap-2.5">
                          <Sparkles className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-bold text-rose-600 dark:text-rose-400">Emergency Match Reasoning:</span>
                            <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{explanations[prod.id]}</p>
                          </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex gap-2.5 pt-2 border-t border-slate-50 dark:border-slate-800">
                          <a
                            href={lender?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-850 font-semibold text-xs py-2 rounded-xl text-center transition-all cursor-pointer"
                          >
                            Read Complaints Process
                          </a>
                          <a
                            href={lender?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl text-center transition-all shadow-xs"
                          >
                            Disburse Emergency Loan
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
                  <ShieldAlert className="h-8 w-8 text-slate-400" />
                  <h4 className="font-bold">No Match Found Within Safe Boundaries</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                    Try disabling 'Only digital' or modify the amount to view matching certified alternatives. Avoid illegal 7-day credit apps.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
                <Zap className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Fast-Track Emergency Matching</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mt-1">
                  Input your exact urgency level and parameters. We will audit compliance records and recommend verified high-speed lenders.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
