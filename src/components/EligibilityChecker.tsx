/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, AlertCircle, FileText, Check, HelpCircle, ArrowRight, Activity, Sparkles, Zap } from 'lucide-react';
import { LoanEligibility } from '../types';

export const EligibilityChecker: React.FC = () => {
  const { profile, debts } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoanEligibility | null>(null);
  
  // Interactive Micro-tasks completed states
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // Form states
  const [desiredAmount, setDesiredAmount] = useState(250000);
  const [repaymentPeriod, setRepaymentPeriod] = useState(6);
  const [loanPurpose, setLoanPurpose] = useState('Business Expansion');
  const [creditHistory, setCreditHistory] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Good');

  const totalCurrentDebt = debts.reduce((sum, d) => sum + d.amount, 0);

  const [isManualMode, setIsManualMode] = useState(false);
  const [customIncome, setCustomIncome] = useState(profile.monthlyIncome || 350000);
  const [customDebt, setCustomDebt] = useState(totalCurrentDebt || 50000);

  const handleToggleTask = (title: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCompletedTasks({}); // Reset active boosts on fresh check

    try {
      const res = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: isManualMode ? customIncome : profile.monthlyIncome,
          employment: profile.employmentStatus,
          currentDebt: isManualMode ? customDebt : totalCurrentDebt,
          loanPurpose,
          desiredAmount,
          repaymentPeriod,
          creditHistory
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed checking loan eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeBoostPoints = result?.boostTasks?.reduce((sum, task) => {
    return completedTasks[task.title] ? sum + task.points : sum;
  }, 0) || 0;

  const finalApprovalChance = result ? Math.min(100, result.approvalChance + activeBoostPoints) : 0;

  return (
    <div id="loan-eligibility-checker-module" className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Loan Eligibility Checker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Test your approval chances before formal bank applications to protect your credit score from rejections.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium self-start md:self-auto">
          <Activity className="h-4 w-4" /> Non-Impact Pre-Qualification Check
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Fields */}
        <form onSubmit={handleCheck} className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Configure Parameters</h2>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              {isManualMode ? 'Calculator' : 'Auto-Sync'}
            </span>
          </div>

          {/* Calculator mode toggle */}
          <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setIsManualMode(false)}
              className={`text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                !isManualMode
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Sync Profile Data
            </button>
            <button
              type="button"
              onClick={() => setIsManualMode(true)}
              className={`text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                isManualMode
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Custom Calculator
            </button>
          </div>

          {/* Desired Loan Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Desired Loan Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                id="eligibility-amount-input"
                type="number"
                required
                value={desiredAmount}
                onChange={(e) => setDesiredAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-4 text-sm transition-all font-semibold"
                placeholder="0"
              />
            </div>
          </div>

          {/* Monthly Income */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>Monthly Income (₦)</span>
              {!isManualMode && (
                <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                  ✓ Synced
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                id="eligibility-income-input"
                type="number"
                required
                disabled={!isManualMode}
                value={isManualMode ? customIncome : profile.monthlyIncome}
                onChange={(e) => setCustomIncome(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-4 text-sm transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="0"
              />
            </div>
          </div>

          {/* Existing Debt */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>Existing Debt / Repayments (₦)</span>
              {!isManualMode && (
                <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                  ✓ Synced
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">₦</span>
              <input
                id="eligibility-debt-input"
                type="number"
                required
                disabled={!isManualMode}
                value={isManualMode ? customDebt : totalCurrentDebt}
                onChange={(e) => setCustomDebt(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 pl-8 pr-4 text-sm transition-all font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="0"
              />
            </div>
          </div>

          {/* Term & Credit Rating Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Repayment Term
              </label>
              <select
                id="eligibility-tenor-select"
                value={repaymentPeriod}
                onChange={(e) => setRepaymentPeriod(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2.5 px-3 text-sm font-medium cursor-pointer"
              >
                <option value={1}>1 Month</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
                <option value={24}>24 Months</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Credit Rating
              </label>
              <select
                id="eligibility-credit-select"
                value={creditHistory}
                onChange={(e) => setCreditHistory(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2.5 px-3 text-sm font-medium cursor-pointer"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Loan Purpose
            </label>
            <input
              id="eligibility-purpose-input"
              type="text"
              required
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2 px-4 text-sm transition-all font-medium"
              placeholder="e.g. Expand shop inventory, pays school fees"
            />
          </div>

          {/* Status Note under the inputs */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-850 text-xs">
            {isManualMode ? (
              <div className="space-y-1 text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">✨ Calculator Mode</span>
                <p className="text-[11px] font-semibold leading-relaxed">
                  You are exploring customized loan parameters. These values are used to evaluate your potential credit score odds without impacting your saved profile data.
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">✓ Profile Sync Mode</span>
                <p className="text-[11px] font-semibold leading-relaxed">
                  Your monthly income (<span className="font-bold">₦{profile.monthlyIncome.toLocaleString()}</span>) and current active debts (<span className="font-bold">₦{totalCurrentDebt.toLocaleString()}</span>) are automatically synced from your saved profile settings.
                </p>
              </div>
            )}
          </div>

          <button
            id="check-eligibility-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-medium py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Querying Credit Engine...
              </span>
            ) : (
              <>
                {isManualMode ? 'Calculate Custom Odds' : 'Check Eligibility Rating'} <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Right Output Panels */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Approval Odds Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-1.5 flex-grow text-center md:text-left w-full">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Approval Chance</span>
                  <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-2">
                    <span className={`text-4xl font-extrabold transition-all duration-300 ${activeBoostPoints > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-850 dark:text-white'}`}>
                      {finalApprovalChance}%
                    </span>
                    <span className="text-xs font-bold text-slate-400">Probability</span>
                    {activeBoostPoints > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full animate-fadeIn">
                        ⚡ {result.approvalChance}% base + {activeBoostPoints}% active boost
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 max-w-sm mx-auto md:mx-0 relative">
                    {/* Base progress segment */}
                    <div
                      className={`h-full absolute left-0 top-0 transition-all duration-1000 ${result.approvalChance >= 70 ? 'bg-emerald-500' : result.approvalChance >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${result.approvalChance}%`, zIndex: 1 }}
                    />
                    {/* Boost progress segment */}
                    {activeBoostPoints > 0 && (
                      <div
                        className="h-full absolute top-0 bg-emerald-400/80 dark:bg-emerald-400/60 animate-pulse transition-all duration-1000"
                        style={{ 
                          left: `${result.approvalChance}%`, 
                          width: `${Math.min(100 - result.approvalChance, activeBoostPoints)}%`,
                          zIndex: 2 
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Suggested safe limit */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex-shrink-0 text-center md:text-right w-full md:w-auto">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recommended Safe Limit</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₦{result.suggestedAmount.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Based on healthy 33% debt capacity.</p>
                </div>
              </div>

              {/* AI Underwriter Explanation */}
              <div className="bg-emerald-50/40 dark:bg-slate-900/40 border border-emerald-100/40 dark:border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">AI Lending Advisor Analysis</h3>
                    <p className="text-[11px] text-slate-400">Credit underwriting details & advice.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {result.aiExplanation}
                </p>
              </div>

              {/* Boost Your Eligibility Section */}
              {result.boostTasks && result.boostTasks.length > 0 && (
                <div id="eligibility-boost-section" className="bg-slate-50/40 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl p-6 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          Boost Your Eligibility
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                            AI Coaching
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          Complete recommended micro-tasks to simulate approval rating improvements.
                        </p>
                      </div>
                    </div>
                    {activeBoostPoints > 0 && (
                      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        <Zap className="h-3.5 w-3.5 fill-emerald-500/20" />
                        +{activeBoostPoints}% Boost Active
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {result.boostTasks.map((task) => {
                      const isCompleted = !!completedTasks[task.title];
                      return (
                        <div
                          key={task.title}
                          className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300 ${
                            isCompleted
                              ? 'bg-emerald-500/5 border-emerald-500/25 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-750 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task.title)}
                              className={`h-5 w-5 rounded-md flex-shrink-0 flex items-center justify-center border transition-all cursor-pointer mt-0.5 ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </button>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-xs font-bold transition-colors ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-400/30' : 'text-slate-800 dark:text-slate-200'}`}>
                                  {task.title}
                                </span>
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  task.category === 'Identity'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : task.category === 'Debt Ratio'
                                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                    : task.category === 'Income Proof'
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                    : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                }`}>
                                  {task.category}
                                </span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  task.impact === 'High'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : task.impact === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                                }`}>
                                  {task.impact} Impact
                                </span>
                              </div>
                              <p className={`text-[11px] font-semibold leading-relaxed ${isCompleted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                {task.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
                              +{task.points}% odds boost
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task.title)}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400'
                                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-100 hover:border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {isCompleted ? 'Boost Active' : task.actionLabel}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suitable licensed products and documentation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suitable products */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-3">Recommended Options</h4>
                  <div className="space-y-2.5">
                    {result.suitableProducts.map((prod, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-semibold">{prod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Documents */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> Required Document Check
                  </h4>
                  <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {result.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
                <HelpCircle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pre-Qualify Your Lending Request</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
                  Adjust requested amounts and payment tenors to observe estimated approval odds and matching licensed offerings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
