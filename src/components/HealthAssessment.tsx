/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, Wallet, CheckCircle, Calculator, Info, FileDown } from 'lucide-react';
import { FinancialHealthScore } from '../types';
import { exportFinancialSummaryPdf } from '../utils/pdfExport';

export const HealthAssessment: React.FC = () => {
  const { profile, healthScore, setHealthScore, debts } = useApp();
  const [loading, setLoading] = useState(false);
  
  const handleExportPdf = () => {
    const savedExtra = localStorage.getItem('br_extra_payment');
    const extraPayment = savedExtra ? Number(savedExtra) : 15000;
    
    const savedStrategy = localStorage.getItem('br_strategy');
    const strategy = (savedStrategy === 'snowball' || savedStrategy === 'avalanche') ? savedStrategy : 'avalanche';
    
    exportFinancialSummaryPdf(profile, healthScore, debts, extraPayment, strategy);
  };
  
  // Local state inputs
  const [income, setIncome] = useState(profile.monthlyIncome);
  const [expenses, setExpenses] = useState(180000);
  const [savings, setSavings] = useState(50000);
  
  // Autocalculate total repayments from outstanding debts
  const calculatedDebtRepayments = debts.reduce((acc, d) => acc + d.monthlyPayment, 0);
  const [debtRepayment, setDebtRepayment] = useState(calculatedDebtRepayments);

  useEffect(() => {
    setDebtRepayment(calculatedDebtRepayments);
  }, [debts]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/health-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income,
          expenses,
          savings,
          debtPayment: debtRepayment
        })
      });
      const data: FinancialHealthScore = await res.json();
      setHealthScore(data);
    } catch (err) {
      console.error('Failed to calculate financial health:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500 stroke-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
    if (score >= 50) return 'text-amber-500 stroke-amber-500 bg-amber-50 dark:bg-amber-950/20';
    return 'text-rose-500 stroke-rose-500 bg-rose-50 dark:bg-rose-950/20';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Fair';
    return 'Critical Burden';
  };

  return (
    <div id="financial-health-assessment-module" className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financial Health Assessment</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze your income, expenses, and liabilities to verify safe credit-taking thresholds.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            id="export-pdf-btn"
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <FileDown className="h-4.5 w-4.5 text-emerald-500" /> Export Financial Summary
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <ShieldCheck className="h-4 w-4" /> Securing Your Borrowing Power
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Input Section */}
        <form onSubmit={handleCalculate} id="health-assessment-form" className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Calculator className="h-5 w-5 text-emerald-500" /> Enter Financial Metrics
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Monthly Active Income (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                id="income-input"
                type="number"
                required
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-4 text-sm transition-all font-semibold"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Include verified salaries or regular business earnings.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Discretionary & Essential Expenses (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                id="expenses-input"
                type="number"
                required
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-4 text-sm transition-all font-semibold"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Rent, feeding, school fees, utilities, transport, etc.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Total Current Savings / Reserves (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                id="savings-input"
                type="number"
                required
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-4 text-sm transition-all font-semibold"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cash in bank, piggybox savings, or liquid deposits.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Existing Monthly Debt Repayments (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                id="debts-input"
                type="number"
                required
                value={debtRepayment}
                onChange={(e) => setDebtRepayment(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-4 text-sm transition-all font-semibold"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Synchronized with your outstanding loan trackers (₦{calculatedDebtRepayments.toLocaleString()} calculated).
            </p>
          </div>

          <button
            id="calculate-health-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-medium py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Underwriting Assessment...
              </span>
            ) : (
              <>
                Analyze My Health <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Dashboard/Results Section */}
        <div className="lg:col-span-7 space-y-6">
          {healthScore ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Display Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  {/* SVG Circle progress */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      className={`transition-all duration-1000 ${getScoreColor(healthScore.score).split(' ')[1]}`}
                      strokeWidth="8"
                      strokeDasharray={339}
                      strokeDashoffset={339 - (339 * healthScore.score) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold">{healthScore.score}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                  </div>
                </div>

                <div className="space-y-2 flex-grow text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h3 className="text-xl font-bold tracking-tight">
                      {getScoreStatus(healthScore.score)} Health Rating
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getScoreColor(healthScore.score).split(' ')[0]} ${getScoreColor(healthScore.score).split(' ')[2]}`}>
                      {healthScore.score >= 75 ? 'Healthy' : healthScore.score >= 50 ? 'Moderate' : 'Burdened'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your calculated monthly disposable cash is <strong className="text-emerald-500">₦{healthScore.monthlyDisposableIncome.toLocaleString()}</strong>.
                  </p>
                  <p className="text-xs text-slate-400">
                    Analysis compiled on {new Date(healthScore.calculatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Individual Metrics Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DTI */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Debt Ratio (DTI)</span>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">{healthScore.dti.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3">
                    <div
                      className={`h-full rounded-full ${healthScore.dti <= 33 ? 'bg-emerald-500' : healthScore.dti <= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, healthScore.dti)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {healthScore.dti <= 33 ? 'Excellent (Under 33%)' : healthScore.dti <= 50 ? 'Warning (33-50%)' : 'Dangerous (>50%)'}
                  </span>
                </div>

                {/* Savings Ratio */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Savings Ratio</span>
                    <Wallet className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">{healthScore.savingsRatio.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, healthScore.savingsRatio * 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Goal is &gt;15% of monthly pay.</span>
                </div>

                {/* Emergency Buffer */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Emergency Fund</span>
                    <Info className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">{healthScore.emergencyFundScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${healthScore.emergencyFundScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Covering expenses in crisis.</span>
                </div>
              </div>

              {/* AI-Generated Coaching Recommendations */}
              <div className="bg-emerald-50/50 dark:bg-slate-900/60 border border-emerald-100/50 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">AI Financial Health Recommendations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Personalized feedback based on current liabilities.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {healthScore.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-sm bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-xs">
                      <span className="font-semibold text-emerald-500 text-xs mt-0.5">#{idx + 1}</span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{rec}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Disclaimer: This is an AI assessment of credit readiness. Decisions of actual licensed underwriters are sovereign and depend on formal loan contracts and verification of documentation.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
                <Calculator className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Calculate Your Financial Health Score</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
                  We will evaluate your metrics against standard credit ratios to give you your financial health status and advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
