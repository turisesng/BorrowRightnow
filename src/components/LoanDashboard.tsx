/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, ChevronRight, Clock, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileDown } from 'lucide-react';
import { LoanPaymentEstimator } from './LoanPaymentEstimator';
import { exportFinancialSummaryPdf } from '../utils/pdfExport';
import { SupabaseSyncPanel } from './SupabaseSyncPanel';

export const LoanDashboard: React.FC = () => {
  const { profile, healthScore, debts } = useApp();

  const handleExportPdf = () => {
    const savedExtra = localStorage.getItem('br_extra_payment');
    const extraPayment = savedExtra ? Number(savedExtra) : 15000;
    
    const savedStrategy = localStorage.getItem('br_strategy');
    const strategy = (savedStrategy === 'snowball' || savedStrategy === 'avalanche') ? savedStrategy : 'avalanche';
    
    exportFinancialSummaryPdf(profile, healthScore, debts, extraPayment, strategy);
  };

  // Simulated applications history index
  const simulatedApplications = [
    { id: 'app-1', lender: 'FairMoney Microfinance Bank', amount: 100000, term: '6 Months', status: 'Approved', date: '2026-06-15' },
    { id: 'app-2', lender: 'Access Bank PLC', amount: 1500000, term: '24 Months', status: 'Rejected', date: '2026-05-10', reason: 'Debt-to-income ratio exceeded 40% safety threshold.' },
    { id: 'app-3', lender: 'Carbon Microfinance Bank', amount: 250000, term: '12 Months', status: 'Approved', date: '2026-07-01' },
    { id: 'app-4', lender: 'Renmoney MFB', amount: 500000, term: '12 Months', status: 'Pending Review', date: '2026-07-04' }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100';
      case 'Pending Review':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div id="loan-management-dashboard-module" className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Loan Management & Timeline</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track historical applications, upcoming installments, active liabilities, and credit safety trends.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            id="dashboard-export-pdf-btn"
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <FileDown className="h-4.5 w-4.5 text-emerald-500" /> Export Financial Summary
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <ShieldCheck className="h-4 w-4" /> Live Repayment Calendars
          </div>
        </div>
      </div>

      <SupabaseSyncPanel />

      {/* Main active loans tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Loan Details */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="text-lg font-bold">Active Liability Tracking ({debts.length})</h3>

          {debts.length > 0 ? (
            <div className="space-y-4">
              {debts.map(d => (
                <div key={d.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800/60 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lender</span>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">{d.lenderName}</h4>
                    </div>
                    <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/10 px-2.5 py-1 rounded-full">
                      ACTIVE LOAN
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Balance</span>
                      <span className="text-sm font-extrabold text-rose-500 mt-1 block">₦{d.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Installment</span>
                      <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-1 block">₦{d.monthlyPayment.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Term</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 block">{d.remainingTerm} Months</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Due Date</span>
                      <span className="text-sm font-bold text-amber-500 mt-1 block flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {d.nextDueDate}
                      </span>
                    </div>
                  </div>

                  {/* Warning label for high interest unlicensed */}
                  {d.interestRate >= 10.0 && (
                    <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 p-3 rounded-xl flex gap-2 text-xs text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">CRITICAL DEBT TRAP WARNING</p>
                        <p className="font-medium mt-0.5">This lender has a monthly rate of {d.interestRate}% ({d.interestRate * 12}% APR!). This is highly characteristic of predatory unlicensed lenders. Prioritize clearing this debt first to prevent aggressive shaming actions.</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <h4 className="font-bold">No Active Loans Found</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">You are completely debt-free. Keep up the clean financial standing!</p>
            </div>
          )}
        </div>

        {/* Historic Applications and Repayments calendar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-lg font-bold border-b border-slate-50 dark:border-slate-800 pb-3">Simulated Credit Applications</h3>

            <div className="space-y-4">
              {simulatedApplications.map(app => (
                <div key={app.id} className="flex justify-between items-start gap-4 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{app.lender}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">₦{app.amount.toLocaleString()} for {app.term}</p>
                    <span className="text-[10px] text-slate-400 block">Applied on: {app.date}</span>
                    {app.reason && (
                      <p className="text-[10px] text-rose-500 font-medium bg-rose-50/50 p-2 rounded border border-rose-100 mt-1.5">{app.reason}</p>
                    )}
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick-Access Loan Estimator */}
      <LoanPaymentEstimator />
    </div>
  );
};
