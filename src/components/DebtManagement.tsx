/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Info, TrendingDown, Plus, Trash2, TrendingUp, Sparkles, Trophy, HelpCircle, ArrowRight, FileDown } from 'lucide-react';
import { Debt } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { exportFinancialSummaryPdf } from '../utils/pdfExport';

export const DebtManagement: React.FC = () => {
  const { profile, healthScore, debts, setDebts, addAuditLog } = useApp();
  
  const [extraPayment, setExtraPayment] = useState<number>(() => {
    const saved = localStorage.getItem('br_extra_payment');
    return saved ? Number(saved) : 15000;
  });
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>(() => {
    const saved = localStorage.getItem('br_strategy');
    return (saved === 'snowball' || saved === 'avalanche') ? saved : 'avalanche';
  });

  useEffect(() => {
    localStorage.setItem('br_extra_payment', String(extraPayment));
  }, [extraPayment]);

  useEffect(() => {
    localStorage.setItem('br_strategy', strategy);
  }, [strategy]);

  const handleExportPdf = () => {
    exportFinancialSummaryPdf(profile, healthScore, debts, extraPayment, strategy);
  };

  // Modal / Add debt form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [lenderName, setLenderName] = useState('');
  const [amount, setAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(5.0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(15000);
  const [remainingTerm, setRemainingTerm] = useState<number>(12);
  const [nextDueDate, setNextDueDate] = useState('2026-07-20');

  const totalOutstanding = debts.reduce((sum, d) => sum + d.amount, 0);
  const totalMonthlyCommitment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      lenderName,
      amount,
      interestRate,
      monthlyPayment,
      remainingTerm,
      nextDueDate,
      priority: interestRate > 8.0 ? 1 : 3
    };

    setDebts([...debts, newDebt]);
    setShowAddForm(false);
    // Clear forms
    setLenderName('');
    setAmount(100000);
    setInterestRate(5.0);
    setMonthlyPayment(15000);
    setRemainingTerm(12);
    setNextDueDate('2026-07-20');
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  // Run pay-off simulations for chart
  // We simulate remaining balance over 36 months under Snowball vs Avalanche
  const generateProjectionData = () => {
    if (debts.length === 0) return [];

    let snowballDebts = debts.map(d => ({ ...d }));
    let avalancheDebts = debts.map(d => ({ ...d }));

    // Sort debts
    snowballDebts.sort((a, b) => a.amount - b.amount); // Smallest balance first
    avalancheDebts.sort((a, b) => b.interestRate - a.interestRate); // Highest interest first

    const dataPoints: any[] = [];
    let sBalance = totalOutstanding;
    let aBalance = totalOutstanding;

    // Monthly simulation for 36 months
    for (let month = 0; month <= 24; month++) {
      if (month === 0) {
        dataPoints.push({
          name: 'Month 0',
          'Snowball Balance': Math.round(sBalance),
          'Avalanche Balance': Math.round(aBalance)
        });
        continue;
      }

      // 1. Simulate Snowball Month
      let snowballExtra = extraPayment;
      let sMonthlySum = 0;
      snowballDebts = snowballDebts.map(d => {
        if (d.amount <= 0) return d;
        // Apply interest
        const interest = d.amount * (d.interestRate / 100);
        let principal = d.monthlyPayment - interest;
        if (principal < 0) principal = 0;

        let totalPay = d.monthlyPayment;
        // If smallest, add extra rollover cash
        const isSmallest = d.id === snowballDebts.find(sd => sd.amount > 0)?.id;
        if (isSmallest) {
          totalPay += snowballExtra;
          snowballExtra = 0;
        }

        let newAmount = d.amount + interest - totalPay;
        if (newAmount < 0) {
          // Rollover leftover of extra payment to next smallest
          snowballExtra += Math.abs(newAmount);
          newAmount = 0;
        }

        d.amount = newAmount;
        sMonthlySum += newAmount;
        return d;
      });
      sBalance = sMonthlySum;

      // 2. Simulate Avalanche Month
      let avalancheExtra = extraPayment;
      let aMonthlySum = 0;
      avalancheDebts = avalancheDebts.map(d => {
        if (d.amount <= 0) return d;
        const interest = d.amount * (d.interestRate / 100);
        let principal = d.monthlyPayment - interest;
        if (principal < 0) principal = 0;

        let totalPay = d.monthlyPayment;
        // If highest rate, throw extra payment at it
        const isHighestRate = d.id === avalancheDebts.find(ad => ad.amount > 0)?.id;
        if (isHighestRate) {
          totalPay += avalancheExtra;
          avalancheExtra = 0;
        }

        let newAmount = d.amount + interest - totalPay;
        if (newAmount < 0) {
          avalancheExtra += Math.abs(newAmount);
          newAmount = 0;
        }

        d.amount = newAmount;
        aMonthlySum += newAmount;
        return d;
      });
      aBalance = aMonthlySum;

      dataPoints.push({
        name: `M ${month}`,
        'Snowball Balance': Math.round(sBalance),
        'Avalanche Balance': Math.round(aBalance)
      });

      if (sBalance <= 0 && aBalance <= 0) break;
    }

    return dataPoints;
  };

  const chartData = generateProjectionData();

  // Coaching advice
  const getDebtAdvice = () => {
    const highInterestDebts = debts.filter(d => d.interestRate > 8.0);
    if (highInterestDebts.length > 0) {
      return {
        type: 'Avalanche Match',
        alert: `You have ${highInterestDebts.length} high-interest debt(s) with monthly rates exceeding 8% (96% APR equivalent!).`,
        adv: 'The Debt Avalanche strategy is highly recommended. By targeting the high-interest loans first, you will avoid compounding penalties and save the most cash.',
        savings: 'Estimated Savings: ₦24,000 in interest savings over 12 months.'
      };
    }
    return {
      type: 'Snowball Match',
      alert: 'Your loans are below extreme interest thresholds.',
      adv: 'The Debt Snowball is recommended for you. Paying off smaller loans first releases disposable cash flow and gives you fast motivating milestones.',
      savings: 'Releases up to ₦32,000 monthly cashflow within 4 months.'
    };
  };

  const advice = getDebtAdvice();

  return (
    <div id="debt-management-module" className="space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Debt Management & Payoff</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Simulate pay-off strategies, calendar due dates, and accelerate your path to debt freedom.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            id="debt-export-pdf-btn"
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <FileDown className="h-4.5 w-4.5 text-emerald-500" /> Export Financial Summary
          </button>
          <button
            id="add-debt-trigger-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" /> Record New Debt
          </button>
        </div>
      </div>

      {/* Quick Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Liability</span>
            <span className="text-xl font-extrabold text-rose-500">₦{totalOutstanding.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Commited Payments</span>
            <span className="text-xl font-extrabold text-slate-700 dark:text-slate-200">₦{totalMonthlyCommitment.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Next Repayment Window</span>
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
              {debts.length > 0 ? debts[0].nextDueDate : 'No outstanding liabilities'}
            </span>
          </div>
        </div>
      </div>

      {/* Add Debt Modal Form */}
      {showAddForm && (
        <form onSubmit={handleAddDebt} id="add-debt-form" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4 animate-fadeIn">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400">Add New Outstanding Debt Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Lender Name</label>
              <input
                id="add-debt-lender"
                type="text"
                required
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                placeholder="e.g. SupaCredit App"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Outstanding Amount (₦)</label>
              <input
                id="add-debt-amount"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Monthly Interest Rate (%)</label>
              <input
                id="add-debt-rate"
                type="number"
                step="0.1"
                required
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Required Monthly Installment (₦)</label>
              <input
                id="add-debt-payment"
                type="number"
                required
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Remaining Term (Months)</label>
              <input
                id="add-debt-term"
                type="number"
                required
                value={remainingTerm}
                onChange={(e) => setRemainingTerm(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">Next Payment Due Date</label>
              <input
                id="add-debt-date"
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              id="cancel-add-debt"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-add-debt"
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer"
            >
              Save Debt
            </button>
          </div>
        </form>
      )}

      {/* Main interactive comparison and forecasting area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Debts list table */}
        <div className="lg:col-span-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span>Outstanding Liabilities ({debts.length})</span>
            <span className="text-xs text-slate-400 normal-case font-medium">Clear items once paid off</span>
          </h2>

          {debts.length > 0 ? (
            <div className="space-y-4">
              {debts.map(d => (
                <div key={d.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl group">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">LENDER</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{d.lenderName}</h4>
                    <div className="flex gap-3 text-[11px] text-slate-400 font-semibold pt-1">
                      <span>Rate: {d.interestRate}% monthly</span>
                      <span>Term: {d.remainingTerm} months</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Balance</span>
                      <strong className="text-sm font-extrabold text-rose-500">₦{d.amount.toLocaleString()}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Installment: ₦{d.monthlyPayment.toLocaleString()}</span>
                    </div>

                    <button
                      id={`delete-debt-${d.id}`}
                      onClick={() => handleDeleteDebt(d.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                      title="Clear Paid Debt"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <h4 className="font-bold">Debt Free!</h4>
              <p className="text-xs max-w-xs mx-auto mt-1">Excellent work. You have zero outstanding liabilities.</p>
            </div>
          )}
        </div>

        {/* Projection Chart & Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-3">Payoff Forecasting & Accelerator</h2>

            {/* Extra payments configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Extra Monthly Payment (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₦</span>
                  <input
                    id="extra-payment-input"
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 pl-7 pr-3 text-sm focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Payoff Model</label>
                <div className="flex bg-slate-50 dark:bg-slate-950 rounded-xl p-1 border border-slate-100 dark:border-slate-850">
                  <button
                    id="snowball-toggle"
                    type="button"
                    onClick={() => setStrategy('snowball')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${strategy === 'snowball' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-100/30' : 'text-slate-400'}`}
                  >
                    Snowball
                  </button>
                  <button
                    id="avalanche-toggle"
                    type="button"
                    onClick={() => setStrategy('avalanche')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${strategy === 'avalanche' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-100/30' : 'text-slate-400'}`}
                  >
                    Avalanche
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts pay-off curves */}
            {debts.length > 0 && chartData.length > 0 ? (
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Projected Outstanding Debt Over Time (₦)</span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: any) => [`₦${value.toLocaleString()}`, 'Balance']} labelStyle={{ color: '#64748b' }} />
                      <Legend fontSize={10} wrapperStyle={{ paddingAt: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="Snowball Balance"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Avalanche Balance"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-44 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-850 text-slate-400 text-xs">
                No liabilities to simulate. Add debts above to visualize projections.
              </div>
            )}

            {/* AI Coaching Insight */}
            {debts.length > 0 && (
              <div className="bg-emerald-50/40 dark:bg-slate-950/40 border border-emerald-100/40 dark:border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-4 w-4" /> AI Debt-Free Recommendation
                </div>
                <div className="space-y-1 text-xs leading-relaxed">
                  <p className="font-semibold text-rose-500">{advice.alert}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{advice.adv}</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">{advice.savings}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
