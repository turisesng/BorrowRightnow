/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { mockProducts, mockLenders } from '../data/mockLenders';
import { Star, ShieldAlert, CheckCircle, Scale, Sparkles, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { LenderProduct } from '../types';
import { LenderComparisonChart } from './LenderComparisonChart';
import { LoanComparisonMatrix } from './LoanComparisonMatrix';
import { LenderRadarSummary } from './LenderRadarSummary';

export const RecommendationEngine: React.FC = () => {
  const { profile } = useApp();
  const [filterAmount, setFilterAmount] = useState<number>(300000);
  const [filterTenor, setFilterTenor] = useState<number>(12);
  const [selectedForComparison, setSelectedForComparison] = useState<LenderProduct[]>([]);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});
  const [trustScores, setTrustScores] = useState<Record<string, {
    score: number;
    breakdown: Record<string, number>;
    badges: string[];
    explanation: string;
  }>>({});

  useEffect(() => {
    let active = true;
    const fetchTrustScores = async () => {
      try {
        const res = await fetch('/api/lenders/trust-scores');
        if (!res.ok) throw new Error('Failed to fetch trust scores');
        const data = await res.json();
        if (active && data.trustScores) {
          setTrustScores(data.trustScores);
        }
      } catch (err) {
        console.error('Failed to load trust scores:', err);
      }
    };
    fetchTrustScores();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = mockProducts.filter(prod => {
    const isAmountOk = filterAmount >= prod.minAmount && filterAmount <= prod.maxAmount;
    const isTenorOk = filterTenor >= prod.minTenor && filterTenor <= prod.maxTenor;
    return isAmountOk && isTenorOk;
  });

  const handleFetchExplanation = async (product: LenderProduct) => {
    if (aiExplanations[product.id]) return; // Already loaded

    setLoadingExplanations(prev => ({ ...prev, [product.id]: true }));
    try {
      const res = await fetch('/api/recommendations/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          userProfile: profile
        })
      });
      const data = await res.json();
      setAiExplanations(prev => ({ ...prev, [product.id]: data.explanation }));
    } catch (err) {
      console.error('Failed fetching product match explanation:', err);
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const toggleCompare = (prod: LenderProduct) => {
    setSelectedForComparison(prev => {
      const exists = prev.find(p => p.id === prod.id);
      if (exists) {
        return prev.filter(p => p.id !== prod.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 lender products side-by-side.');
        return prev;
      }
      return [...prev, prod];
    });
  };

  const getLenderRating = (lenderId: string) => {
    const l = mockLenders.find(l => l.id === lenderId);
    return l ? { rating: l.rating, count: l.ratingCount, type: l.type, license: l.licenseNumber } : { rating: 4.0, count: 100, type: 'Microfinance Bank', license: 'CBN/COM/001' };
  };

  return (
    <div id="ai-loan-recommendation-engine" className="space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Loan Recommendation Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Personalized list of transparent, licensed lenders matching your exact requirements.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium self-start md:self-auto">
          <ShieldCheck className="h-4 w-4" /> 100% Verified Regulatory Licensed Lenders
        </div>
      </div>

      {/* Filter sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Required Amount: ₦{filterAmount.toLocaleString()}
          </label>
          <input
            id="rec-amount-slider"
            type="range"
            min={10000}
            max={5000000}
            step={10000}
            value={filterAmount}
            onChange={(e) => setFilterAmount(Number(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>₦10,000</span>
            <span>₦5,000,000</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Target Repayment Period: {filterTenor} Months
          </label>
          <input
            id="rec-tenor-slider"
            type="range"
            min={1}
            max={36}
            step={1}
            value={filterTenor}
            onChange={(e) => setFilterTenor(Number(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1 Month</span>
            <span>36 Months</span>
          </div>
        </div>
      </div>

      {/* Lender Rate & APR comparison visualizer (Bar Chart) */}
      <LenderComparisonChart />

      {/* Lender Sentiment & Ratings Radar Summary */}
      <LenderRadarSummary />

      {/* Loan Comparison Matrix */}
      <LoanComparisonMatrix 
        products={selectedForComparison} 
        onRemoveProduct={toggleCompare} 
        onClearAll={() => setSelectedForComparison([])} 
      />

      {/* Main Product Catalog List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center justify-between">
          <span>Available Regulated Products ({filteredProducts.length})</span>
          <span className="text-xs text-slate-400 font-medium normal-case">Displaying options within limits</span>
        </h3>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map(prod => {
              const lInfo = getLenderRating(prod.lenderId);
              const isComparing = selectedForComparison.some(p => p.id === prod.id);

              return (
                <div key={prod.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    {/* Lender Meta header */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lInfo.type}</span>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight mt-0.5">{prod.lenderName}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">{prod.name}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded text-amber-600 dark:text-amber-400 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" /> {lInfo.rating}
                      </div>
                    </div>

                    {/* Interest / Cost metrics */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 my-4 border border-slate-100 dark:border-slate-800/50">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Monthly Rate</span>
                        <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{prod.minInterestRate}% - {prod.maxInterestRate}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Annual APR</span>
                        <span className="text-sm font-extrabold text-emerald-500">{prod.apr}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Processing</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{prod.processingFee > 0 ? `${prod.processingFee}%` : 'Free'}</span>
                      </div>
                    </div>

                    {/* CAC Check, license */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded font-semibold text-slate-500 dark:text-slate-400">
                        License: {lInfo.license}
                      </span>
                      {prod.collateralRequired ? (
                        <span className="text-[10px] bg-amber-100/55 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold px-2 py-1 rounded-full">
                          Collateral Required
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100/55 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-1 rounded-full">
                          Collateral Free (Digital)
                        </span>
                      )}
                    </div>

                    {/* AI-powered Trust Meter */}
                    {trustScores[prod.lenderId] ? (
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-800/60 shadow-inner">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" /> AI Trust Meter
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Score:</span>
                            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                              trustScores[prod.lenderId].score >= 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                              trustScores[prod.lenderId].score >= 80 ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {trustScores[prod.lenderId].score}/100
                            </span>
                          </div>
                        </div>
                        
                        {/* Colored bar meter */}
                        <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden mb-2.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              trustScores[prod.lenderId].score >= 90 ? 'bg-emerald-500' :
                              trustScores[prod.lenderId].score >= 80 ? 'bg-teal-500' :
                              'bg-amber-500'
                            }`}
                            style={{ width: `${trustScores[prod.lenderId].score}%` }}
                          />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {trustScores[prod.lenderId].badges.map((b, idx) => (
                            <span 
                              key={idx} 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                b === 'Highly Trusted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' :
                                b === 'Transparent Fees' ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40' :
                                b === 'Fast Approval' ? 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40' :
                                'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-850'
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>

                        {/* Explanation */}
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-850 mb-2">
                          "{trustScores[prod.lenderId].explanation}"
                        </p>

                        {/* Expandable breakdown checklist */}
                        <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60">
                          <details className="group">
                            <summary className="text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer list-none flex items-center justify-between select-none">
                              <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
                                <Scale className="h-3 w-3 text-slate-400" /> View Score Checklist
                              </span>
                              <span className="text-[8px] transition-transform duration-200 group-open:rotate-180">▼</span>
                            </summary>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2.5 text-[10px] text-slate-500 dark:text-slate-400 animate-fadeIn">
                              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-1">
                                <span>Regulatory Status:</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Licensed (100%)</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-1">
                                <span>Fee Transparency:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{trustScores[prod.lenderId].breakdown.feeTransparency}%</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-1">
                                <span>Customer Reviews:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{trustScores[prod.lenderId].breakdown.customerReviews}%</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-1">
                                <span>Response Speed:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{trustScores[prod.lenderId].breakdown.responseTimes}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Complaint History:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{trustScores[prod.lenderId].breakdown.complaintHistory}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Approval Consistency:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{trustScores[prod.lenderId].breakdown.approvalConsistency}%</span>
                              </div>
                              <div className="col-span-2 flex justify-between items-center pt-1.5 mt-1 border-t border-dotted border-slate-200 dark:border-slate-800">
                                <span className="flex items-center gap-0.5">AI Sentiment Rating:</span>
                                <span className="font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-1 rounded">Positive ({trustScores[prod.lenderId].breakdown.aiSentiment}%)</span>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-800/60 flex items-center justify-center text-[11px] text-slate-400">
                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-500 border-t-transparent mr-2" />
                        AI Trust Meter analyzing database metrics...
                      </div>
                    )}

                    {/* Accordion AI Explanation trigger */}
                    <div className="mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {aiExplanations[prod.id] ? (
                        <div className="bg-emerald-50/30 dark:bg-slate-950/40 p-3 rounded-xl border border-emerald-100/30 dark:border-slate-800/50 text-xs space-y-1 animate-fadeIn">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> AI Recommendation Reasoning:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{aiExplanations[prod.id]}</p>
                        </div>
                      ) : (
                        <button
                          id={`explain-match-${prod.id}`}
                          onClick={() => handleFetchExplanation(prod)}
                          disabled={loadingExplanations[prod.id]}
                          className="text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-bold cursor-pointer flex items-center gap-1"
                        >
                          {loadingExplanations[prod.id] ? (
                            <>
                              <span className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-500 border-t-transparent" />
                              Running match algorithms...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" /> Explain why this is a financial match <ArrowRight className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5 mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <button
                      id={`compare-btn-${prod.id}`}
                      onClick={() => toggleCompare(prod)}
                      className={`flex-1 font-semibold text-xs py-2.5 px-3 rounded-xl border transition-all cursor-pointer text-center ${isComparing ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-850'}`}
                    >
                      {isComparing ? 'Remove from Compare' : 'Add to Compare'}
                    </button>
                    <a
                      href={mockLenders.find(l => l.id === prod.lenderId)?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl text-center transition-all shadow-xs"
                    >
                      Visit Official Portal
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs">
            <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-bold">No Products Matching Your Current Parameters</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mt-1">
              Try expanding your allowed amount or repayment term. We only recommend licensed, regulated alternatives.
            </p>
          </div>
        )}
      </div>

      {/* Warning Alert about unlicensed applications */}
      <div className="bg-amber-50/50 dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-xl p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">Consumer Protection Warning</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            BorrowRight AI has a strict zero-tolerance policy against unlicensed lending operations (illegal "loan apps"). All products shown above are audited, registered microfinance banks or commercial banks certified by the Central Bank of Nigeria (CBN). We never expose your personal data or phone contacts to lenders.
          </p>
        </div>
      </div>
    </div>
  );
};
