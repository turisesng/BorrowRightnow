/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calculator, AlertTriangle, ShieldCheck, Info, TrendingDown, RefreshCw } from 'lucide-react';

interface LoanInterestCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoanInterestCalculatorModal: React.FC<LoanInterestCalculatorModalProps> = ({ isOpen, onClose }) => {
  // Input states
  const [principal, setPrincipal] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(12); // e.g., 12% per annum or 12% flat monthly
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual');
  const [duration, setDuration] = useState<number>(12); // in months
  const [calcMethod, setCalcMethod] = useState<'amortized' | 'flat'>('amortized');

  // Outputs
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalRepayment, setTotalRepayment] = useState<number>(0);
  const [interestPercentage, setInterestPercentage] = useState<number>(0);
  const [principalPercentage, setPrincipalPercentage] = useState<number>(0);
  const [schedule, setSchedule] = useState<Array<{ month: number; payment: number; principalRepaid: number; interestPaid: number; remainingBalance: number }>>([]);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Quick preset handlers
  const applyPreset = (p: number, r: number, rt: 'annual' | 'monthly', d: number, m: 'amortized' | 'flat') => {
    setPrincipal(p);
    setInterestRate(r);
    setRateType(rt);
    setDuration(d);
    setCalcMethod(m);
  };

  useEffect(() => {
    // 1. Convert annual interest rate to monthly decimal, or keep monthly decimal
    const monthlyRateDecimal = rateType === 'annual' 
      ? (interestRate / 12) / 100 
      : interestRate / 100;

    let totalPaid = 0;
    let interestPaid = 0;
    let monthlyInstallment = 0;
    const calcSchedule = [];

    if (calcMethod === 'amortized') {
      // Standard Reducing Balance (EMI Formula)
      // M = P * r * (1 + r)^n / ((1 + r)^n - 1)
      if (monthlyRateDecimal === 0) {
        monthlyInstallment = principal / duration;
        totalPaid = principal;
        interestPaid = 0;
        
        let balance = principal;
        for (let i = 1; i <= duration; i++) {
          const pPaid = principal / duration;
          balance -= pPaid;
          calcSchedule.push({
            month: i,
            payment: monthlyInstallment,
            principalRepaid: pPaid,
            interestPaid: 0,
            remainingBalance: Math.max(0, balance),
          });
        }
      } else {
        const factor = Math.pow(1 + monthlyRateDecimal, duration);
        monthlyInstallment = principal * (monthlyRateDecimal * factor) / (factor - 1);
        totalPaid = monthlyInstallment * duration;
        interestPaid = totalPaid - principal;

        let balance = principal;
        for (let i = 1; i <= duration; i++) {
          const interestForMonth = balance * monthlyRateDecimal;
          const principalForMonth = monthlyInstallment - interestForMonth;
          balance -= principalForMonth;
          calcSchedule.push({
            month: i,
            payment: monthlyInstallment,
            principalRepaid: principalForMonth,
            interestPaid: interestForMonth,
            remainingBalance: Math.max(0, balance),
          });
        }
      }
    } else {
      // Flat Rate Standard (Predatory loan apps calculation)
      // Interest is calculated flat on initial principal every month
      // Total Interest = P * r_monthly * duration
      const flatMonthlyRate = rateType === 'annual' ? (interestRate / 12) / 100 : interestRate / 100;
      interestPaid = principal * flatMonthlyRate * duration;
      totalPaid = principal + interestPaid;
      monthlyInstallment = totalPaid / duration;

      let balance = principal;
      const principalRepaidPerMonth = principal / duration;
      for (let i = 1; i <= duration; i++) {
        balance -= principalRepaidPerMonth;
        calcSchedule.push({
          month: i,
          payment: monthlyInstallment,
          principalRepaid: principalRepaidPerMonth,
          interestPaid: principal * flatMonthlyRate,
          remainingBalance: Math.max(0, balance),
        });
      }
    }

    setMonthlyPayment(monthlyInstallment);
    setTotalInterest(interestPaid);
    setTotalRepayment(totalPaid);
    setSchedule(calcSchedule);

    const totalWeight = principal + interestPaid;
    if (totalWeight > 0) {
      setPrincipalPercentage((principal / totalWeight) * 100);
      setInterestPercentage((interestPaid / totalWeight) * 100);
    } else {
      setPrincipalPercentage(100);
      setInterestPercentage(0);
    }
  }, [principal, interestRate, rateType, duration, calcMethod]);

  // Is this loan rate predatory? (> 5% monthly rate)
  const effectiveMonthlyRate = rateType === 'annual' ? interestRate / 12 : interestRate;
  const isPredatory = effectiveMonthlyRate > 5;
  const isExtremelyPredatory = effectiveMonthlyRate > 10;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="mini-calculator-dialog"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative my-8 animate-scaleUp overflow-hidden"
      >
        {/* Header Decorator lines */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600"></div>

        {/* Modal Top Title */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">BorrowRight Mini-Calculator</h3>
              <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Predatory Interest & Amortization Analyzer</p>
            </div>
          </div>
          <button
            id="close-calculator-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-750"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets Panel */}
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">App Presets:</span>
          <button
            id="preset-safe-mfi"
            type="button"
            onClick={() => applyPreset(150000, 24, 'annual', 12, 'amortized')}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300"
          >
            Regulated Microfinance (24% APR)
          </button>
          <button
            id="preset-typical-loanapp"
            type="button"
            onClick={() => applyPreset(50000, 15, 'monthly', 3, 'flat')}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-100/50 dark:hover:bg-red-950/20 cursor-pointer text-red-700 dark:text-red-400"
          >
            Deceptive Flat Rate App (15%/Mo)
          </button>
          <button
            id="preset-extreme-predatory"
            type="button"
            onClick={() => applyPreset(30000, 25, 'monthly', 1, 'flat')}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/10 hover:bg-rose-100/50 dark:hover:bg-rose-950/20 cursor-pointer text-rose-700 dark:text-rose-400"
          >
            Extreme Trap Loan (25% for 1 Mo)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Input controls */}
          <div className="md:col-span-6 space-y-4">
            {/* Principal Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Principal Amount (NGN)</label>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₦ {principal.toLocaleString()}</span>
              </div>
              <input
                id="calc-input-principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold mb-2"
                placeholder="Enter loan amount"
              />
              <input
                id="calc-slider-principal"
                type="range"
                min="5000"
                max="1000000"
                step="5000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Interest Rate Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Interest Rate (%)</label>
                <div className="flex items-center gap-1">
                  <button
                    id="calc-ratetype-annual"
                    type="button"
                    onClick={() => setRateType('annual')}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${rateType === 'annual' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    YEARLY (APR)
                  </button>
                  <button
                    id="calc-ratetype-monthly"
                    type="button"
                    onClick={() => setRateType('monthly')}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${rateType === 'monthly' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    MONTHLY
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  id="calc-input-rate"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                  placeholder="Enter interest rate"
                />
                <span className="bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                {rateType === 'annual' 
                  ? `Equivalent to ${(interestRate / 12).toFixed(1)}% flat monthly rate.`
                  : `Equivalent to ${(interestRate * 12).toFixed(1)}% annual rate (APR).`}
              </p>
            </div>

            {/* Duration Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Duration (Months)</label>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{duration} Months</span>
              </div>
              <input
                id="calc-input-duration"
                type="number"
                min="1"
                max="60"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold mb-2"
                placeholder="Enter months"
              />
              <input
                id="calc-slider-duration"
                type="range"
                min="1"
                max="36"
                step="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Calculation Method Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Calculation Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="calc-method-amortized"
                  type="button"
                  onClick={() => setCalcMethod('amortized')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${calcMethod === 'amortized' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500 text-slate-800 dark:text-slate-100' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                >
                  <span className="text-xs font-extrabold block">Standard Amortized</span>
                  <span className="text-[9px] block text-slate-400 font-semibold mt-0.5">Reducing Balance: pay interest on outstanding principal only.</span>
                </button>
                <button
                  id="calc-method-flat"
                  type="button"
                  onClick={() => setCalcMethod('flat')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${calcMethod === 'flat' ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-500 text-slate-800 dark:text-slate-100' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                >
                  <span className="text-xs font-extrabold block flex items-center gap-1 text-amber-700 dark:text-amber-400">
                    Flat Interest Rate
                  </span>
                  <span className="text-[9px] block text-slate-400 font-semibold mt-0.5">Predatory app trap: pay full interest monthly even as you repay principal.</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Output display & visual breakdown */}
          <div className="md:col-span-6 space-y-4">
            {/* Visual breakdown bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Cost Breakdown Ratio</span>
              
              {/* Stacked Percentage Bar */}
              <div className="w-full h-5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${principalPercentage}%` }}
                />
                <div 
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${interestPercentage}%` }}
                />
              </div>

              {/* Legend with percentages */}
              <div className="flex justify-between items-center text-[11px] font-bold">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Principal repaid: {principalPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                  <span>Interest charges: {interestPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Core Statistics Bento-Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Monthly Payment</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₦ {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Installment / Mo</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Principal</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₦ {principal.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Original borrowed</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Interest</span>
                <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">₦ {totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Additional charges</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Payback</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">₦ {totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Cumulative debt load</span>
              </div>
            </div>

            {/* Dynamic Warnings / Safe Indicators */}
            {isPredatory ? (
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold block">Predatory Interest Rate Detected</span>
                  <p className="text-[10px] leading-relaxed font-medium">
                    {isExtremelyPredatory 
                      ? `At ${effectiveMonthlyRate.toFixed(1)}% monthly, this is an extreme debt trap. Legally, annual interest (APR) should be under 30% total. Run a safety report in compliance hub.`
                      : `An interest rate of ${effectiveMonthlyRate.toFixed(1)}% per month represents high-cost non-bank finance. Borrow with extreme caution.`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold block">Regulated Safety Standards</span>
                  <p className="text-[10px] leading-relaxed font-medium">
                    This interest profile aligns with central bank guidelines and regulated lending standards in Nigeria. Always check for proper licensing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Amortization schedule toggle and content */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
          <button
            id="toggle-schedule-btn"
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3 w-3 transition-transform duration-300 ${showSchedule ? 'rotate-180' : ''}`} />
            {showSchedule ? 'Hide Amortization Installment Schedule' : 'View Month-by-Month Amortization Schedule'}
          </button>

          {showSchedule && (
            <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="px-3 py-2 text-center">Month</th>
                    <th className="px-3 py-2">Installment</th>
                    <th className="px-3 py-2">Principal Repaid</th>
                    <th className="px-3 py-2">Interest Paid</th>
                    <th className="px-3 py-2">Balance Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-350">
                  {schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-200/50 dark:hover:bg-slate-900/40">
                      <td className="px-3 py-1.5 text-center font-bold">{row.month}</td>
                      <td className="px-3 py-1.5 font-semibold">₦ {row.payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-3 py-1.5">₦ {row.principalRepaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-3 py-1.5 text-rose-500">₦ {row.interestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-3 py-1.5 font-bold">₦ {row.remainingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Advisory Hint footer */}
        <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
          <Info className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          <span>This calculator calculates estimates for standard personal microloans. Repayments may differ based on lender fees or deferment options.</span>
        </div>
      </div>
    </div>
  );
};
