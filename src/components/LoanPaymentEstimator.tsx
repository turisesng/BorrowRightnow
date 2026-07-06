import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calculator, Percent, Calendar, Coins, Info, ShieldCheck, 
  AlertTriangle, ArrowRight, HelpCircle, TrendingUp, Sparkles, Scale
} from 'lucide-react';

interface AmortizationRow {
  paymentNumber: number;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export const LoanPaymentEstimator: React.FC = () => {
  const { profile, addAuditLog, addNotification } = useApp();

  // Inputs
  const [principal, setPrincipal] = useState<number>(150000);
  const [interestRate, setInterestRate] = useState<number>(5.0); // Monthly or annual based on toggle
  const [rateType, setRateType] = useState<'Monthly' | 'Annual'>('Monthly');
  const [tenure, setTenure] = useState<number>(6); // in Months
  const [calcMethod, setCalcMethod] = useState<'Flat' | 'Reducing'>('Flat');

  // Interactive schedule view toggle
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Formatted calculations state
  const [monthlyRepayment, setMonthlyRepayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalRepayment, setTotalRepayment] = useState<number>(0);
  const [scheduleData, setScheduleData] = useState<AmortizationRow[]>([]);
  
  // Quick Presets
  const applyPreset = (p: number, r: number, rT: 'Monthly' | 'Annual', t: number, m: 'Flat' | 'Reducing') => {
    setPrincipal(p);
    setInterestRate(r);
    setRateType(rT);
    setTenure(t);
    setCalcMethod(m);
    addNotification(`PRESET LOADED: Principal ₦${p.toLocaleString()} for ${t} Months.`);
  };

  // Run calculation logic when inputs change
  useEffect(() => {
    // Determine monthly rate as decimal
    const monthlyRateDecimal = rateType === 'Monthly' 
      ? interestRate / 100 
      : (interestRate / 12) / 100;

    let calculatedMonthly = 0;
    let calculatedTotalInterest = 0;
    let tempSchedule: AmortizationRow[] = [];

    if (calcMethod === 'Flat') {
      // Flat Rate: Interest is constant based on initial principal
      const monthlyInterestAmount = principal * monthlyRateDecimal;
      calculatedTotalInterest = monthlyInterestAmount * tenure;
      const totalCost = principal + calculatedTotalInterest;
      calculatedMonthly = totalCost / tenure;

      // Build Flat Schedule
      let balance = principal;
      const flatMonthlyPrincipal = principal / tenure;
      
      for (let i = 1; i <= tenure; i++) {
        balance = Math.max(0, balance - flatMonthlyPrincipal);
        tempSchedule.push({
          paymentNumber: i,
          paymentAmount: calculatedMonthly,
          principalPaid: flatMonthlyPrincipal,
          interestPaid: monthlyInterestAmount,
          remainingBalance: Number(balance.toFixed(2))
        });
      }
    } else {
      // Reducing Balance / Amortized method (PMT formula)
      const r = monthlyRateDecimal;
      const n = tenure;

      if (r === 0) {
        calculatedMonthly = principal / n;
        calculatedTotalInterest = 0;
        let balance = principal;
        for (let i = 1; i <= n; i++) {
          balance = Math.max(0, balance - calculatedMonthly);
          tempSchedule.push({
            paymentNumber: i,
            paymentAmount: calculatedMonthly,
            principalPaid: calculatedMonthly,
            interestPaid: 0,
            remainingBalance: Number(balance.toFixed(2))
          });
        }
      } else {
        // Standard loan amortization formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
        const power = Math.pow(1 + r, n);
        calculatedMonthly = principal * (r * power) / (power - 1);
        const calculatedTotalRepayment = calculatedMonthly * n;
        calculatedTotalInterest = calculatedTotalRepayment - principal;

        // Build Reducing Schedule
        let balance = principal;
        for (let i = 1; i <= n; i++) {
          const interestPaid = balance * r;
          const principalPaid = calculatedMonthly - interestPaid;
          balance = Math.max(0, balance - principalPaid);
          tempSchedule.push({
            paymentNumber: i,
            paymentAmount: calculatedMonthly,
            principalPaid: principalPaid,
            interestPaid: interestPaid,
            remainingBalance: Number(balance.toFixed(2))
          });
        }
      }
    }

    setMonthlyRepayment(calculatedMonthly);
    setTotalInterest(calculatedTotalInterest);
    setTotalRepayment(principal + calculatedTotalInterest);
    setScheduleData(tempSchedule);

  }, [principal, interestRate, rateType, tenure, calcMethod]);

  // Handle logging to Audits when user plays with inputs to verify they are checking stats
  const logEstimation = () => {
    addAuditLog(
      'user@borrowright.ai', 
      'LOAN_ESTIMATE', 
      `Estimated ₦${principal.toLocaleString()} at ${interestRate}% ${rateType} interest for ${tenure} months (${calcMethod} Method).`
    );
    addNotification(`SUCCESS: Repayment plan estimated. Projected payment: ₦${Math.round(monthlyRepayment).toLocaleString()}/mo.`);
  };

  // Compare with user's income
  const dtiRatio = (monthlyRepayment / profile.monthlyIncome) * 100;
  const isDtiSafe = dtiRatio <= 33;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6" id="loan-estimator-component">
      {/* Title & Help */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-850 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quick-Access Loan Payment Estimator</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Simulate repayments instantly and compare flat vs. reducing methods</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            id="preset-micro"
            type="button"
            onClick={() => applyPreset(100000, 5, 'Monthly', 3, 'Flat')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-[10px] font-bold border border-slate-100 dark:border-slate-850 rounded-lg cursor-pointer transition-colors"
          >
            Digital Preset
          </button>
          <button
            id="preset-bank"
            type="button"
            onClick={() => applyPreset(1200000, 24, 'Annual', 12, 'Reducing')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-[10px] font-bold border border-slate-100 dark:border-slate-850 rounded-lg cursor-pointer transition-colors"
          >
            Bank Preset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form Inputs: Principal, Rate, Tenure */}
        <div className="md:col-span-6 space-y-4">
          {/* Principal */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-500 dark:text-slate-400">Loan Principal Amount</label>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                ₦{principal.toLocaleString()}
              </span>
            </div>
            <input
              id="estimator-principal-range"
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₦</span>
              <input
                id="estimator-principal-num"
                type="number"
                min="5000"
                max="50000000"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 pl-7 pr-3 text-xs font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Interest Rate & Representation Toggle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-500 dark:text-slate-400">Interest Rate</label>
              <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-0.5 rounded-lg">
                <button
                  id="rate-type-monthly"
                  type="button"
                  onClick={() => {
                    if (rateType === 'Annual') {
                      setInterestRate(Number((interestRate / 12).toFixed(2)));
                    }
                    setRateType('Monthly');
                  }}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold cursor-pointer transition-all ${rateType === 'Monthly' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-3xs' : 'text-slate-400'}`}
                >
                  Monthly
                </button>
                <button
                  id="rate-type-annual"
                  type="button"
                  onClick={() => {
                    if (rateType === 'Monthly') {
                      setInterestRate(Number((interestRate * 12).toFixed(2)));
                    }
                    setRateType('Annual');
                  }}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold cursor-pointer transition-all ${rateType === 'Annual' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-3xs' : 'text-slate-400'}`}
                >
                  Annual (APR)
                </button>
              </div>
            </div>
            
            <input
              id="estimator-rate-range"
              type="range"
              min="0.5"
              max={rateType === 'Monthly' ? '30' : '150'}
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="relative">
              <input
                id="estimator-rate-num"
                type="number"
                min="0"
                max="500"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 pl-3 pr-8 text-xs font-bold focus:border-emerald-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-slate-400 text-xs font-bold">%</span>
            </div>
          </div>

          {/* Tenure (Months) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-500 dark:text-slate-400">Tenure (Repayment Period)</label>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                {tenure} Months ({Number((tenure / 12).toFixed(1))} Yrs)
              </span>
            </div>
            <input
              id="estimator-tenure-range"
              type="range"
              min="1"
              max="60"
              step="1"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <input
              id="estimator-tenure-num"
              type="number"
              min="1"
              max="360"
              value={tenure}
              onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs font-bold focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Method Selector: Flat Rate vs Reducing Balance */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Calculation Interest Method
                <span className="group relative cursor-help text-slate-400 hover:text-slate-600">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-800 text-white text-[9px] p-2 rounded-lg w-52 text-center leading-relaxed shadow-lg font-semibold z-40">
                    Flat rates charge interest on the initial loan amount. Reducing charges interest on the remaining unpaid balance, making it far cheaper.
                  </span>
                </span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="estimator-method-flat"
                type="button"
                onClick={() => setCalcMethod('Flat')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${calcMethod === 'Flat' ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500 hover:text-slate-700'}`}
              >
                Flat Rate Method
              </button>
              <button
                id="estimator-method-reducing"
                type="button"
                onClick={() => setCalcMethod('Reducing')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${calcMethod === 'Reducing' ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500 hover:text-slate-700'}`}
              >
                Reducing Balance
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Output Calculations & Health Warnings */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-4">
          {/* Main Repayment Display */}
          <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="text-center py-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Projected Monthly Payment</span>
              <h4 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                ₦{Math.round(monthlyRepayment).toLocaleString()}
                <span className="text-xs text-slate-400 font-semibold block sm:inline ml-1">/ Month</span>
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850/60 pt-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Interest Costs</span>
                <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-0.5 block">₦{Math.round(totalInterest).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Repayment Cost</span>
                <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-0.5 block">₦{Math.round(totalRepayment).toLocaleString()}</span>
              </div>
            </div>

            {/* Flat vs Reducing Compare Info Box */}
            <div className="text-[10px] bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-850 p-2.5 rounded-xl text-slate-400 font-semibold leading-relaxed">
              {calcMethod === 'Flat' ? (
                <p>
                  💡 <strong className="text-slate-600 dark:text-slate-300">Switching to Reducing Balance:</strong> Flat rate interest does not go down as you pay off your loan. This same loan calculated under standard <span className="text-emerald-600 cursor-pointer hover:underline font-bold" onClick={() => setCalcMethod('Reducing')}>Reducing Balance</span> would save you substantial interest charges over the lifetime!
                </p>
              ) : (
                <p>
                  ✨ <strong className="text-slate-600 dark:text-slate-300">Reducing Method Selected:</strong> This is the fairest bank method. Interest is only charged on your outstanding balance, reducing the total amount you repay over time.
                </p>
              )}
            </div>
          </div>

          {/* DTI Debt Trap Health Alert Check */}
          <div className={`p-4 rounded-xl border flex gap-3 ${
            isDtiSafe 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
              : 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400'
          }`}>
            {isDtiSafe ? (
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-500 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
            )}
            <div className="space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wider">
                {isDtiSafe ? 'Safe Debt-to-Income Status' : 'HIGH-RISK DEBT TRAP WARNING'}
              </h5>
              <p className="text-[10px] font-semibold leading-relaxed opacity-90">
                This projected payment represents <strong className="font-extrabold">{dtiRatio.toFixed(1)}%</strong> of your declared monthly salary (₦{profile.monthlyIncome.toLocaleString()}).
                {isDtiSafe 
                  ? ' This is below the recommended 33% maximum safety threshold. You should comfortably be able to support this repayment.'
                  : ' This violates the recommended 33% maximum safety threshold! Taking this loan significantly increases your risk of default, continuous rollovers, and predatory collections.'
                }
              </p>
            </div>
          </div>

          {/* Core Action Button */}
          <div className="flex gap-2">
            <button
              id="log-estimation-btn"
              type="button"
              onClick={logEstimation}
              className="flex-grow bg-slate-800 hover:bg-slate-750 text-white dark:bg-slate-200 dark:hover:bg-slate-100 dark:text-slate-900 font-bold py-2.5 rounded-xl text-xs cursor-pointer text-center transition-all shadow-xs select-none"
            >
              Log Simulation to Audit History
            </button>
            <button
              id="toggle-schedule-btn"
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="px-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-350 cursor-pointer"
              title="Toggle amortization repayment schedule"
            >
              {showSchedule ? 'Hide Schedule' : 'View Schedule'}
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      {showSchedule && (
        <div className="border-t border-slate-50 dark:border-slate-850 pt-5 space-y-3 animate-fadeIn" id="amortization-schedule-table">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Amortization Timeline</h4>
            <span className="text-[9px] font-bold text-slate-400">Total Payments: {tenure}</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
            <table className="w-full text-left border-collapse text-[10px] font-semibold text-slate-500">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="py-2.5 px-3"># No.</th>
                  <th className="py-2.5 px-3">Monthly Payment</th>
                  <th className="py-2.5 px-3">Principal Portion</th>
                  <th className="py-2.5 px-3">Interest Portion</th>
                  <th className="py-2.5 px-3 text-right">Remaining Unpaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {scheduleData.map((row) => (
                  <tr key={row.paymentNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">Payment {row.paymentNumber}</td>
                    <td className="py-2.5 px-3">₦{Math.round(row.paymentAmount).toLocaleString()}</td>
                    <td className="py-2.5 px-3">₦{Math.round(row.principalPaid).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-rose-500/90">₦{Math.round(row.interestPaid).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                      ₦{Math.round(row.remainingBalance).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
