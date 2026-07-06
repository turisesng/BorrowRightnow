import React, { useState, useEffect } from 'react';
import { LenderProduct, Lender } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Scale, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Coins, 
  Percent, 
  HelpCircle,
  TrendingDown,
  Sparkles,
  Info
} from 'lucide-react';

interface LoanComparisonMatrixProps {
  products: LenderProduct[];
  onRemoveProduct: (product: LenderProduct) => void;
  onClearAll: () => void;
}

// Custom fee dictionary to mock transparent disclosures for the "hidden fees" assessment
interface TransparentFeeDisclosure {
  latePenalty: string;
  insuranceFee: string;
  rolloverFee: string;
  earlyPayoffPenalty: string;
  approvalSpeed: string;
  creditCheckRequired: boolean;
}

const feeDisclosures: Record<string, TransparentFeeDisclosure> = {
  'prod-1': { // Access Bank Personal Loan
    latePenalty: '1.0% flat per month on overdue balance (No hidden compound interest)',
    insuranceFee: '1.0% credit life insurance (one-off, upfront)',
    rolloverFee: 'Strictly prohibited (CBN Regulated)',
    earlyPayoffPenalty: '0% (No charges for early liquidation)',
    approvalSpeed: '3-7 Business Days',
    creditCheckRequired: true
  },
  'prod-2': { // Renmoney Personal Cash Loan
    latePenalty: '₦2,000 flat overdue default fee + 1.0% daily charge on overdue principal',
    insuranceFee: 'None',
    rolloverFee: 'No automated rollovers; requires formal loan restructuring',
    earlyPayoffPenalty: '0% (Early settlement permitted anytime)',
    approvalSpeed: 'Within 24 Hours',
    creditCheckRequired: true
  },
  'prod-3': { // FairMoney Instant Loan
    latePenalty: '1.5% one-off default penalty (No recurring compounding)',
    insuranceFee: 'None',
    rolloverFee: 'Zero rollover traps. Extensions must be explicitly authorized',
    earlyPayoffPenalty: '0% (Save on interest by paying early)',
    approvalSpeed: 'Instant (Under 5 Minutes)',
    creditCheckRequired: false
  },
  'prod-4': { // Carbon Personal Loan
    latePenalty: '2.0% flat late fee on unpaid balance per installment cycle',
    insuranceFee: 'None',
    rolloverFee: 'Zero rollover charges (Defending consumer charter rules)',
    earlyPayoffPenalty: '0% (Zero penalty fees)',
    approvalSpeed: 'Instant (Under 10 Minutes)',
    creditCheckRequired: false
  },
  'prod-5': { // DLM Business Expansion Loan
    latePenalty: '1.5% flat fee on outstanding balance per cycle',
    insuranceFee: '1.0% asset protection insurance (one-off)',
    rolloverFee: 'Regulated extension window available (no compounding)',
    earlyPayoffPenalty: '0.5% administrative fee on remaining principal',
    approvalSpeed: '1-3 Business Days',
    creditCheckRequired: true
  }
};

export const LoanComparisonMatrix: React.FC<LoanComparisonMatrixProps> = ({
  products,
  onRemoveProduct,
  onClearAll
}) => {
  if (products.length === 0) return null;

  const { profile, lenders } = useApp();
  const [bestChoice, setBestChoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/lenders/compare-best-choice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products, profile })
        });
        if (!response.ok) throw new Error('Failed to fetch best choice analysis');
        const data = await response.json();
        if (active) {
          setBestChoice(data.analysis);
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          setError(err.message || 'Error conducting AI best choice comparison');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAnalysis();
    return () => {
      active = false;
    };
  }, [products, profile]);

  // Retrieve lender metadata
  const getLenderInfo = (lenderId: string): Lender | undefined => {
    return lenders.find(l => l.id === lenderId);
  };

  // Find optimal metrics for highlighting
  const lowestApr = Math.min(...products.map(p => p.apr));
  const lowestProcessingFee = Math.min(...products.map(p => p.processingFee));
  
  // Custom simple logic to find fastest approval
  const getApprovalWeight = (prodId: string) => {
    const speed = feeDisclosures[prodId]?.approvalSpeed.toLowerCase() || '';
    if (speed.includes('instant')) return 1;
    if (speed.includes('24 hours') || speed.includes('under 24h')) return 2;
    if (speed.includes('1-3')) return 3;
    return 4; // 3-7 days
  };
  
  const minApprovalWeight = Math.min(...products.map(p => getApprovalWeight(p.id)));

  return (
    <div 
      id="loan-comparison-matrix-root" 
      className="bg-white dark:bg-slate-900 border border-emerald-100/70 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Scale className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Loan Comparison Matrix
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {products.length} of 3 Selected
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Side-by-side transparent analysis of interest rates, hidden charges, and regulatory approval speeds
            </p>
          </div>
        </div>

        <button
          id="matrix-clear-all-btn"
          type="button"
          onClick={onClearAll}
          className="px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs text-rose-500 hover:text-rose-600 font-bold rounded-lg border border-rose-100 dark:border-rose-950 transition-colors cursor-pointer"
        >
          Clear Comparison Matrix
        </button>
      </div>

      {/* AI-Generated "Best Choice" Analysis Panel */}
      <div id="ai-best-choice-analysis-panel" className="bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                AI Underwriter "Best Choice" Analysis
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Dynamic cost, regulatory standing, and DTI-based affordability assessment for {profile.fullName}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-150/50 dark:bg-slate-900 px-2 py-1 rounded-md uppercase tracking-wider">
            Gemini Underwriter Mode
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-full border-3 border-emerald-500/20 border-t-emerald-600 animate-spin" />
              <Sparkles className="h-4.5 w-4.5 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Evaluating lender costs, credit check risks, and affordability ratios...</p>
            <p className="text-[10px] text-slate-400 font-semibold">Generating customized plain-language recommendation matrix</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 rounded-xl text-center text-xs text-rose-500 font-bold">
            ⚠️ {error}
          </div>
        ) : bestChoice ? (
          <div className="space-y-5">
            {/* Recommendation Split Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Recommended Winner */}
              <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-xl p-4.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> 1st Recommendation
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950 uppercase tracking-widest">
                    Best Match
                  </span>
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                    {bestChoice.bestChoiceName}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold mt-2 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-500/10 dark:border-slate-800">
                    "{bestChoice.recommendationSummary}"
                  </p>
                </div>
              </div>

              {/* Side-by-Side Context Detail */}
              <div className="bg-blue-500/5 dark:bg-blue-950/10 border border-blue-500/20 dark:border-blue-500/10 rounded-xl p-4.5 space-y-2.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Scale className="h-4 w-4" /> Side-by-Side Comparison
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-medium mt-2">
                    {bestChoice.comparisonSummary}
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-500/10">
                  <p className="text-[9.5px] text-slate-400 font-semibold italic flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" /> Affordability mapped to {profile.fullName ? `${profile.fullName}'s` : "your"} ₦{(profile.monthlyIncome).toLocaleString()} income stream.
                  </p>
                </div>
              </div>
            </div>

            {/* In-depth Factor Underwriting Scores */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 p-4 space-y-3.5">
              <h5 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                Comprehensive Evaluation Parameters
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                
                {/* 1. Total Borrowing Cost */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Total Borrowing Cost</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{bestChoice.factors.totalCost.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${bestChoice.factors.totalCost.score}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{bestChoice.factors.totalCost.comment}</p>
                </div>

                {/* 2. Hidden Fee Risk */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Hidden Fee Risk Assessment</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{bestChoice.factors.feeTransparency.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${bestChoice.factors.feeTransparency.score}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{bestChoice.factors.feeTransparency.comment}</p>
                </div>

                {/* 3. Repayment Flexibility */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Repayment Flexibility</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{bestChoice.factors.flexibility.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${bestChoice.factors.flexibility.score}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{bestChoice.factors.flexibility.comment}</p>
                </div>

                {/* 4. Approval Probability */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Approval Probability</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{bestChoice.factors.approvalProbability.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${bestChoice.factors.approvalProbability.score}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{bestChoice.factors.approvalProbability.comment}</p>
                </div>

                {/* 5. Customer Satisfaction */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Customer Satisfaction</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{bestChoice.factors.customerSatisfaction.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${bestChoice.factors.customerSatisfaction.score}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{bestChoice.factors.customerSatisfaction.comment}</p>
                </div>

                {/* 6. Regulatory Standing */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Regulatory Standing</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{bestChoice.factors.regulatoryStanding.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${bestChoice.factors.regulatoryStanding.score}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{bestChoice.factors.regulatoryStanding.comment}</p>
                </div>

                {/* 7. Affordability */}
                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      💡 Affordability For You
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{bestChoice.factors.affordability.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${bestChoice.factors.affordability.score}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{bestChoice.factors.affordability.comment}</p>
                </div>

              </div>
            </div>

            {/* Trade-offs & Risks warnings */}
            <div className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 dark:border-amber-500/10 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Crucial Application Trade-offs & Risks
              </span>
              <ul className="space-y-2 text-[11px] text-slate-650 dark:text-slate-350 font-medium">
                {bestChoice.tradeoffs.map((t: string, idx: number) => (
                  <li key={idx} className="flex gap-2.5 items-start">
                    <span className="h-4 w-4 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-extrabold text-[9px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 font-bold">
            No analysis results returned. Adjust compared items to recalculate.
          </div>
        )}
      </div>

      {/* Responsive Grid/Table layout */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {/* Header row with lender names and cancel buttons */}
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850">
              <th className="py-4 px-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] w-1/4 min-w-[200px]">
                Product Features
              </th>
              {products.map(prod => {
                const lender = getLenderInfo(prod.lenderId);
                return (
                  <th 
                    key={prod.id} 
                    className="py-4 px-5 relative min-w-[240px] text-slate-800 dark:text-slate-100 border-l border-slate-100 dark:border-slate-850"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 pr-6">
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                          {lender?.type || 'Regulated Lender'}
                        </span>
                        <h4 className="font-extrabold text-sm leading-tight">{prod.lenderName}</h4>
                        <p className="text-[11px] text-slate-400 font-semibold">{prod.name}</p>
                      </div>
                      <button
                        id={`matrix-remove-prod-${prod.id}`}
                        type="button"
                        onClick={() => onRemoveProduct(prod)}
                        className="absolute right-3 top-3.5 p-1 bg-slate-100 hover:bg-rose-500 dark:bg-slate-800 dark:hover:bg-rose-900 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Remove from comparison matrix"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                );
              })}
              {/* Fill remaining empty columns if comparing less than 3 */}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <th 
                  key={`empty-${idx}`} 
                  className="py-4 px-5 bg-slate-50/30 dark:bg-slate-950/5 text-slate-400 text-center border-l border-slate-100 dark:border-slate-850"
                >
                  <div className="flex flex-col items-center justify-center py-4 space-y-1">
                    <Info className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                    <p className="text-[10px] font-bold">Add another lender</p>
                    <p className="text-[9px] text-slate-400">Click "Add to Compare" below any product card</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-300 font-semibold">
            
            {/* Row 1: Core Monthly Interest Rate */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <Percent className="h-3.5 w-3.5 text-slate-400" />
                Monthly Interest Rate
              </td>
              {products.map(prod => (
                <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                    {prod.minInterestRate}% - {prod.maxInterestRate}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Charged monthly</span>
                </td>
              ))}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-rate-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 2: Annual APR (High priority highlighted!) */}
            <tr className="bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/15 transition-all">
              <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Annual Percentage Rate (APR)
              </td>
              {products.map(prod => {
                const isOptimal = prod.apr === lowestApr;
                return (
                  <td key={prod.id} className="py-3.5 px-5 border-l border-emerald-500/10 dark:border-slate-850 font-extrabold text-slate-800 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {prod.apr}% APR
                      </span>
                      {isOptimal && (
                        <span className="bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                          <TrendingDown className="h-2 w-2" /> Cheapest APR
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Compounded absolute cost</span>
                  </td>
                );
              })}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-apr-${idx}`} className="py-3.5 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 3: Approval Times (High priority highlighted!) */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Approval Speed
              </td>
              {products.map(prod => {
                const spec = feeDisclosures[prod.id] || { approvalSpeed: '1-3 Days' };
                const isOptimal = getApprovalWeight(prod.id) === minApprovalWeight;
                return (
                  <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850 font-bold text-slate-800 dark:text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span>{spec.approvalSpeed}</span>
                      {isOptimal && (
                        <span className="bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" /> Fastest
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-approval-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 4: Upfront Processing Fee */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <Coins className="h-3.5 w-3.5 text-slate-400" />
                Upfront Processing Fee
              </td>
              {products.map(prod => {
                const isOptimal = prod.processingFee === lowestProcessingFee;
                return (
                  <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850">
                    <span className={`font-bold ${prod.processingFee === 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-800 dark:text-slate-100'}`}>
                      {prod.processingFee > 0 ? `${prod.processingFee}%` : 'Free (₦0)'}
                    </span>
                    {isOptimal && prod.processingFee === 0 && (
                      <span className="ml-1.5 text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1 py-0.5 rounded">No Upfront Fee</span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-fee-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 5: Rollover & Extension Charge (Hidden Fee assessment) */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-400" />
                Rollover / Extension Traps
              </td>
              {products.map(prod => {
                const spec = feeDisclosures[prod.id];
                return (
                  <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850 text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                    <div className="flex items-start gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{spec?.rolloverFee || 'No compound extensions'}</span>
                    </div>
                  </td>
                );
              })}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-rollover-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 6: Late Repayment Penalty (Hidden Fee assessment) */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Late Repayment Penalty
              </td>
              {products.map(prod => {
                const spec = feeDisclosures[prod.id];
                return (
                  <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850 text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                    {spec?.latePenalty || 'Standard regulated terms'}
                  </td>
                );
              })}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-late-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 7: Insurance & Hidden Costs */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                Upfront Insurance Charges
              </td>
              {products.map(prod => {
                const spec = feeDisclosures[prod.id];
                return (
                  <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850">
                    <span className={spec?.insuranceFee.toLowerCase() === 'none' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}>
                      {spec?.insuranceFee || 'None'}
                    </span>
                  </td>
                );
              })}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-insurance-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 8: Allowed Loan Limits */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <Coins className="h-3.5 w-3.5 text-slate-400" />
                Loan Limit Range
              </td>
              {products.map(prod => (
                <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-200">
                  ₦{prod.minAmount.toLocaleString()} - ₦{prod.maxAmount.toLocaleString()}
                </td>
              ))}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-limits-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 9: Tenure (Months) */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                Tenure Options
              </td>
              {products.map(prod => (
                <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850">
                  {prod.minTenor} - {prod.maxTenor} Months
                </td>
              ))}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-tenure-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 10: Collateral */}
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
              <td className="py-3 px-4 font-bold text-slate-500 bg-slate-50/40 dark:bg-slate-950/5 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                Collateral Required
              </td>
              {products.map(prod => (
                <td key={prod.id} className="py-3 px-5 border-l border-slate-100 dark:border-slate-850 font-bold">
                  {prod.collateralRequired ? (
                    <span className="text-amber-600">Yes (Asset Guarantee)</span>
                  ) : (
                    <span className="text-emerald-600">No (Collateral-free / Digital)</span>
                  )}
                </td>
              ))}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-collateral-${idx}`} className="py-3 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

            {/* Row 11: Portal Actions */}
            <tr>
              <td className="py-4 px-4 font-bold text-slate-400 bg-slate-50/20 dark:bg-slate-950/5 uppercase tracking-widest text-[9px] border-b border-slate-100">
                Action
              </td>
              {products.map(prod => {
                const website = lenders.find(l => l.id === prod.lenderId)?.website || '#';
                return (
                  <td key={prod.id} className="py-4 px-5 border-l border-slate-100 dark:border-slate-850">
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl text-center transition-all shadow-3xs"
                    >
                      Visit Official Portal
                    </a>
                  </td>
                );
              })}
              {Array.from({ length: 3 - products.length }).map((_, idx) => (
                <td key={`empty-actions-${idx}`} className="py-4 px-5 bg-slate-50/10 dark:bg-slate-950/2 border-l border-slate-100 dark:border-slate-850" />
              ))}
            </tr>

          </tbody>
        </table>
      </div>

      {/* Advisory disclaimer footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/60 rounded-xl flex gap-3">
        <Info className="h-4.5 w-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          💡 <strong className="text-slate-600 dark:text-slate-300">Consumer Tip:</strong> Unregulated apps are notorious for hiding extra processing costs, capturing phone records, or compounding rollover fees daily. BorrowRight AI audits all partner agreements to ensure maximum transparency. Always verify the APR on any offer sheet before providing OTPs or signature consent.
        </p>
      </div>

    </div>
  );
};
