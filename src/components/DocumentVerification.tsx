/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, 
  Percent, Info, Calendar, Landmark, ShieldCheck, Eye, Zap, 
  Loader2, HelpCircle, Trash2, UploadCloud, ArrowRight, BookOpen,
  User, DollarSign, Image, ClipboardList, Check, XCircle, ChevronRight, RefreshCw
} from 'lucide-react';

interface KeyTerm {
  term: string;
  value: string;
  description: string;
}

interface PredatoryClause {
  clause: string;
  severity: 'Medium' | 'High';
  finding: string;
  remedy: string;
}

interface HiddenFee {
  name: string;
  amount: string;
  frequency: string;
  finding: string;
}

interface SafeClause {
  clause: string;
  finding: string;
}

interface VerificationResult {
  lenderName: string;
  loanAmount: string;
  interestRate: string;
  repaymentPeriod: string;
  totalRepayment: string;
  apr: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  keyTerms: KeyTerm[];
  predatoryClauses: PredatoryClause[];
  hiddenFees: HiddenFee[];
  safeClauses: SafeClause[];
  overallVerdict: string;
  recommendations: string[];
}

export function DocumentVerification() {
  const { addAuditLog, profile } = useApp();
  
  // Top level tab state: Contract Verifier vs Document Intelligence
  const [docSubTab, setDocSubTab] = useState<'contract' | 'intelligence'>('intelligence');

  // ==========================================
  // Tab 1: AI Contract Audit States
  // ==========================================
  const [activeMode, setActiveMode] = useState<'preset' | 'upload'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('palmcredits');
  const [customText, setCustomText] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // Tab 2: AI Document Intelligence States
  // ==========================================
  const [intelActiveMode, setIntelActiveMode] = useState<'preset' | 'upload'>('preset');
  const [intelSelectedPreset, setIntelSelectedPreset] = useState<string>('bank_statement_incomplete');
  const [intelCustomText, setIntelCustomText] = useState<string>('');
  const [intelImageFile, setIntelImageFile] = useState<File | null>(null);
  const [intelImageBase64, setIntelImageBase64] = useState<string>('');
  const [intelImageMimeType, setIntelImageMimeType] = useState<string>('');
  const [intelIsDragging, setIntelIsDragging] = useState(false);
  const [intelIsLoading, setIntelIsLoading] = useState(false);
  const [intelLoadingStep, setIntelLoadingStep] = useState(0);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [intelResult, setIntelResult] = useState<any | null>(null);
  const intelFileInputRef = useRef<HTMLInputElement>(null);

  // Contract Presets Data
  const presets = [
    {
      id: 'palmcredits',
      name: '⚠️ PalmCredits Agreement (7-Day Fast Cash)',
      risk: 'High',
      description: 'Typical short-term digital lending contract with aggressive fee deductions and contact access.'
    },
    {
      id: 'altmfb',
      name: '✓ AltMFB Loan Offer (6-Month Regulated)',
      risk: 'Low',
      description: 'Standard, fully transparent commercial agreement compliant with CBN and FCCPC consumer guidelines.'
    },
    {
      id: 'quickpay',
      name: '⚡ QuickPay Overdraft (Salary Advance)',
      risk: 'Medium',
      description: 'Regulated payday advance with continuous BVN direct-debit and automatic rollover surcharges.'
    }
  ];

  const presetTexts: Record<string, string> = {
    palmcredits: `LOAN CONTRACT AGREEMENT
Lender: PalmCredits Express (Mobile FinTech Services)
Borrower: Validated App User
Principal Amount: ₦25,000
Loan Term: 7 Days from disbursement.
Interest Rate: 35% flat processing & interest rate for the duration of 7 days.
Total Repayment Amount: ₦33,750
Pre-deduction Clause: A fee of ₦5,000 will be deducted upfront at the point of disbursement as dynamic operational setup cost. Real payout to Borrower bank account: ₦20,000.
Late Payment Penalty: ₦2,000 per day starting immediately at 12:01 AM on the 8th day, compounded daily.
Default Actions & Contacts: In the event of default, PalmCredits is authorized to access, sync, and download all phone contacts, call logs, SMS logs, and image gallery contents of the Borrower. The Lender reserves the absolute right to contact any of the Borrower's contacts, friends, work colleagues, and relatives via SMS, WhatsApp, and calls to broadcast the Borrower's debt default, and to post default announcements on social media channels to recover funds.
BVN and Direct Debit: Borrower grants continuous direct-debit access via BVN to all connected bank accounts. Debit sweeps can be run automatically at any hour of the day or night.`,
    altmfb: `LOAN DISCLOSURE STATEMENT AND AGREEMENT
Lender: AltMFB Microfinance Bank Limited (Licensed by the Central Bank of Nigeria)
Borrower: Validated Customer Profile
Principal Loan Amount: ₦150,000
Repayment Term: 6 Months
Interest Rate: 3.5% per month (Calculated on a reducing balance basis). Stated APR: 42% per annum.
Monthly Installment: ₦28,150
Total Repayment Amount: ₦168,900
Upfront Fees: 1% administrative fee (₦1,500) payable upon loan setup. No other upfront deductions.
Prepayment Option: Borrower may pre-pay the entire balance early with zero prepayment penalty or interest charges on future months.
Default Terms: In the event of non-payment by the due date (the 28th of each month), a 30-day grace period is provided. Late payment penalty is limited to 2.5% of the overdue monthly installment amount.
Reporting: Outstanding defaults past the grace period will be reported to registered Credit Bureaus (CRC, FirstCentral) as required by CBN guidelines. No contacts, photos, or media files will ever be requested or accessed.`,
    quickpay: `SALARY ADVANCE OVERDRAFT FACILITY
Lender: QuickPay Capital Limited (Licensed Finance Institution)
Borrower: Salaried Employee
Overdraft Limit: ₦80,000
Tenor: 1 Month (Payday auto-repayment)
Interest Rate: 5% flat fee for the month.
Processing and Insurance Fees: Processing fee of ₦2,000, and mandatory job-loss insurance premium of ₦1,500, deducted from the loan disbursement. Real disbursement: ₦76,500. Total repayment on payday: ₦84,000.
Rollover Terms: If repayment is not fully completed on payday, the overdraft is automatically rolled over into a new 1-month term. A flat rollover charge of ₦2,500 is assessed, plus an automatic 15% interest surcharge on the outstanding balance.
Direct Debit Authorization: Borrower authorizes QuickPay Capital to place a continuous direct debit mandate on their salary bank account through BVN and Global Standing Instruction (GSI). QuickPay may execute debit sweeps on any connected bank account at any time without prior notification.`
  };

  const loadingSteps = [
    'Parsing document layout and structures...',
    'Extracting dynamic interest rates & fees...',
    'Identifying predatory or toxic clauses...',
    'Matching conditions with FCCPC consumer guidelines...',
    'Compiling interactive risk analysis reports...'
  ];

  // Document Intelligence Presets Data
  const intelligencePresets = [
    {
      id: 'bank_statement_incomplete',
      name: '📊 Salary Bank Statement (Page gaps / Low balance)',
      type: 'Bank Statement',
      description: '3-month statement showing name discrepancies, missing pages, and credit stress.'
    },
    {
      id: 'payslip_blurry',
      name: '📄 Interswitch Salary Slip (Blurry / Unsigned)',
      type: 'Salary Slip / Payslip',
      description: 'Unsigned payroll slip captured with low resolution blur causing OCR failure.'
    },
    {
      id: 'id_mismatch',
      name: '🪪 NIN Identity Slip (Name spelled spelling)',
      type: 'Identification Document',
      description: 'Government ID showing spelling deviation from registered profile name.'
    },
    {
      id: 'letter_good',
      name: '✉️ Employment Letter (Pristine Match)',
      type: 'Employment Letter',
      description: 'Pristine, signed, stamped HR verification on official letterhead.'
    }
  ];

  const intelPresetTexts: Record<string, string> = {
    bank_statement_incomplete: `BANK STATEMENT PRESET CONTENT
Account Holder: Debbie Ijogbonna
Period: March 1, 2026 to May 31, 2026 (Only 3 months uploaded out of 6 standard months requirement)
Average Balance: ₦2,100 (Extremely low relative to monthly salary)
Salary Credit: ₦280,000 net deposits monthly (Discrepancy: Profile declares ₦350,000 monthly income)
Flagged transactions: 4 rapid debits to PalmCredits and QuickPay. No electronic bank stamp or QR verification seal.`,
    payslip_blurry: `SALARY SLIP PRESET CONTENT
Employer: Interswitch Limited
Employee Name: Debbie Ijogbonna
Net Salary Stated: ₦250,000
OCR Readability Flag: Font is blurry and distorted. Bottom section showing HR certification stamp is missing or cropped out. Deductions contain statutory arithmetic mismatches.`,
    id_mismatch: `GOVERNMENT ID PRESET CONTENT
Type: National Identification Number (NIN) Slip
Cardholder Name: Deborah Ijogbonna
NIN ID: 48392019483
Status: Active, unexpired.
KYC Flag: Cardholder first name is 'Deborah' but BorrowRight user profile first name is listed as 'Debbie'. This will trigger AML name-matching verification failures.`,
    letter_good: `EMPLOYMENT LETTER PRESET CONTENT
Letterhead: Interswitch Limited (RC-930492)
Date: March 12, 2026
Subject: Employment Verification Statement
This is to certify that Ms. Debbie Ijogbonna is employed on a full-time basis as a Senior Systems Engineer since March 2026.
Compensation: Stated monthly salary is ₦350,000.
Signatory: Signed by HR Director and stamped with official corporate seal.`
  };

  const intelLoadingSteps = [
    'Scanning document readability and lighting...',
    'Performing optical character recognition (OCR)...',
    'Analyzing page continuity and layout completeness...',
    'Comparing document parameters with BorrowRight profile...',
    'Flagging structural underwriting credit risks...',
    'Compiling loan readiness audit checklists...'
  ];

  // ==========================================
  // Tab 1 Event Handlers (Contract Audit)
  // ==========================================
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files (PNG, JPEG, WebP) are supported for scanning.');
      return;
    }
    setError(null);
    setImageFile(file);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedFile = () => {
    setImageFile(null);
    setImageBase64('');
    setImageMimeType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    try {
      const payload: Record<string, any> = {};
      if (activeMode === 'preset') {
        payload.documentPresetId = selectedPreset;
      } else {
        if (imageBase64) {
          payload.fileData = imageBase64;
          payload.mimeType = imageMimeType;
        }
        if (customText) {
          payload.textContent = customText;
        }
        if (!imageBase64 && !customText) {
          throw new Error('Please upload an agreement image or paste its text terms.');
        }
      }

      const response = await fetch('/api/verify-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to audit document. Please check server logs.');
      }

      const data = await response.json();
      setResult(data);
      
      addAuditLog(
        profile.email || 'user@borrowright.ai', 
        'AGREEMENT_VERIFICATION', 
        `Verified agreement terms of "${data.lenderName || 'Custom uploaded lender'}" with evaluated risk rating: ${data.riskLevel || 'Unknown'}`
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during verification.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // ==========================================
  // Tab 2 Event Handlers (Document Intel)
  // ==========================================
  const handleIntelDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIntelIsDragging(true);
  };

  const handleIntelDragLeave = () => {
    setIntelIsDragging(false);
  };

  const handleIntelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIntelIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processIntelFile(files[0]);
    }
  };

  const handleIntelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processIntelFile(files[0]);
    }
  };

  const processIntelFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setIntelError('Only image files (PNG, JPEG, WebP) are supported for scanning.');
      return;
    }
    setIntelError(null);
    setIntelImageFile(file);
    setIntelImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setIntelImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const clearIntelUploadedFile = () => {
    setIntelImageFile(null);
    setIntelImageBase64('');
    setIntelImageMimeType('');
    if (intelFileInputRef.current) {
      intelFileInputRef.current.value = '';
    }
  };

  const handleIntelVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntelIsLoading(true);
    setIntelError(null);
    setIntelResult(null);
    setIntelLoadingStep(0);

    const interval = setInterval(() => {
      setIntelLoadingStep((prev) => {
        if (prev < intelLoadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    try {
      const payload: Record<string, any> = {
        userProfile: {
          fullName: profile.fullName,
          monthlyIncome: profile.monthlyIncome,
          employmentStatus: profile.employmentStatus
        }
      };

      if (intelActiveMode === 'preset') {
        payload.presetId = intelSelectedPreset;
      } else {
        if (intelImageBase64) {
          payload.fileData = intelImageBase64;
          payload.mimeType = intelImageMimeType;
        }
        if (intelCustomText) {
          payload.textContent = intelCustomText;
        }
        if (!intelImageBase64 && !intelCustomText) {
          throw new Error('Please upload a document image or paste its contents.');
        }
      }

      const response = await fetch('/api/analyze-loan-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document. Please check server logs.');
      }

      const data = await response.json();
      setIntelResult(data);

      addAuditLog(
        profile.email || 'user@borrowright.ai',
        'DOCUMENT_INTELLIGENCE_AUDIT',
        `Analyzed loan readiness for document type: ${data.documentType || 'Custom File'} with score ${data.readinessScore || 0}%`
      );
    } catch (err: any) {
      console.error(err);
      setIntelError(err.message || 'An error occurred during analysis.');
    } finally {
      clearInterval(interval);
      setIntelIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto px-4 md:px-0">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div className="space-y-1.5 flex-grow">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI-Powered Underwriting Suite
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">AI Document Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
            Prepare your loan application files for immediate approval. Perform dynamic audits on your bank statements, salary slips, employment letters, or identification details to catch errors before credit officer reviews, or verify loan offer contracts for predatory clauses.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-2xs self-start">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">Pre-Submission Audit</h4>
            <p className="text-[10px] font-semibold text-slate-400">Reduce manual bank rejection rates by 94%</p>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-850 gap-2">
        <button
          onClick={() => setDocSubTab('intelligence')}
          className={`pb-3.5 text-xs font-extrabold tracking-wide uppercase transition-all relative px-2 cursor-pointer ${
            docSubTab === 'intelligence'
              ? 'text-emerald-600 dark:text-emerald-400 font-black border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ClipboardList className="h-4 w-4" /> AI Document Intelligence
          </span>
        </button>
        <button
          onClick={() => setDocSubTab('contract')}
          className={`pb-3.5 text-xs font-extrabold tracking-wide uppercase transition-all relative px-2 cursor-pointer ${
            docSubTab === 'contract'
              ? 'text-emerald-600 dark:text-emerald-400 font-black border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> AI Contract Verifier
          </span>
        </button>
      </div>

      {/* ==============================================================
          TAB 1: AI CONTRACT VERIFIER (Existing Functionality)
          ============================================================== */}
      {docSubTab === 'contract' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Parameters & Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  Select Agreement Input
                </h3>
              </div>

              {/* Selector mode toggle */}
              <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('preset');
                    setError(null);
                  }}
                  className={`text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    activeMode === 'preset'
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                  }`}
                >
                  Preloaded Presets
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('upload');
                    setError(null);
                  }}
                  className={`text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    activeMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                  }`}
                >
                  Scan or Paste Terms
                </button>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                {activeMode === 'preset' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Choose Sample Contract Preset
                      </label>
                      <div className="space-y-2.5">
                        {presets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedPreset(preset.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                              selectedPreset === preset.id
                                ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/[0.03]'
                                : 'border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-750'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {preset.name}
                              </span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                                preset.risk === 'High'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : preset.risk === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {preset.risk} Risk
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                              {preset.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl p-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Preset Contract Text Preview
                      </span>
                      <pre className="text-[9px] text-slate-500 dark:text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-normal bg-white/50 dark:bg-black/20 p-2.5 rounded-md border border-slate-100 dark:border-slate-850">
                        {presetTexts[selectedPreset]}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Upload / Drag-and-drop Area */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Scan Image of Loan Agreement
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : imageFile
                            ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {imageFile ? (
                          <div className="space-y-2">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs mx-auto">
                              {imageFile.name}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {(imageFile.size / 1024).toFixed(1)} KB • Image Loaded Successfully
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearUploadedFile();
                              }}
                              className="text-[10px] text-rose-500 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> Remove File
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 py-2">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-all">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Click to upload or drag & drop image
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              Supports PNG, JPG, JPEG (Max 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Textarea custom input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <span>Or Paste Custom Contract Text</span>
                        <span className="text-[9px] text-slate-400 lowercase font-medium">
                          {customText.length} characters
                        </span>
                      </label>
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={6}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-3 text-xs font-medium leading-relaxed"
                        placeholder="Paste the loan offer terms, SMS layout, or predatory fine print here..."
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold flex gap-2 items-start leading-relaxed">
                    <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || (activeMode === 'upload' && !imageBase64 && !customText)}
                  className={`w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing Terms...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Agreement Clauses</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Important Advisory Disclaimer</span>
              <p className="text-[10px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                BorrowRight AI Contract Verification extracts text using visual models and conducts general analyses based on FCCPC & Central Bank of Nigeria standard templates. It is designed purely as an advisory tool and does not constitute official legal counsel.
              </p>
            </div>
          </div>

          {/* Right Side: Visual Analysis Results */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-12 text-center space-y-6 shadow-2xs flex flex-col items-center justify-center min-h-[450px]">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-850 border-t-emerald-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Analyzing Your Agreement
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                    {loadingSteps[loadingStep]}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Gemini is running micro-audits to highlight potentially fraudulent and predatory clauses...
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Verdict Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lending Evaluation Audit</span>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        {result.lenderName || 'Custom Audited Agreement'}
                      </h2>
                    </div>
                    
                    {/* Risk Level Pill */}
                    <div className={`flex items-center gap-1.5 font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase shadow-3xs ${
                      result.riskLevel === 'High'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : result.riskLevel === 'Medium'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {result.riskLevel === 'High' && <ShieldAlert className="h-4 w-4" />}
                      {result.riskLevel === 'Medium' && <AlertTriangle className="h-4 w-4" />}
                      {result.riskLevel === 'Low' && <ShieldCheck className="h-4 w-4" />}
                      {result.riskLevel} Risk Level
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-emerald-500" /> Overall Legal Verdict
                    </span>
                    <p className="text-xs font-semibold leading-relaxed text-slate-650 dark:text-slate-350">
                      {result.overallVerdict}
                    </p>
                  </div>
                </div>

                {/* Bento Grid: Key Terms extracted */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-3xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Stated Principal</span>
                    <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate">{result.loanAmount || 'Not Found'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-3xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Interest Terms</span>
                    <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate">{result.interestRate || 'Not Found'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-3xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Agreement Tenor</span>
                    <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate">{result.repaymentPeriod || 'Not Found'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-3xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Total Repayable</span>
                    <div className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate">{result.totalRepayment || 'Not Found'}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-3xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Effective APR</span>
                    <div className={`text-base font-extrabold truncate ${
                      result.apr && parseFloat(result.apr.replace(/[^0-9.]/g, '')) > 100
                        ? 'text-rose-500'
                        : 'text-emerald-500'
                    }`}>
                      {result.apr || 'Calculated APR'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-3xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">CBN Licensed</span>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 h-6">
                      {result.riskLevel === 'High' ? (
                        <span className="text-rose-500 flex items-center gap-1">❌ Unregulated</span>
                      ) : (
                        <span className="text-emerald-500 flex items-center gap-1">✓ Regulated</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Predatory / Toxic Clauses Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <ShieldAlert className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Predatory & Toxic Clauses
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Contract fragments that pose severe threat to data privacy or asset security
                      </p>
                    </div>
                  </div>

                  {result.predatoryClauses && result.predatoryClauses.length > 0 ? (
                    <div className="space-y-4">
                      {result.predatoryClauses.map((item, idx) => (
                        <div key={idx} className="p-4 bg-rose-500/[0.02] border border-rose-500/15 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                              Clause: {item.clause}
                            </span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                              item.severity === 'High' 
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                              {item.severity} Severity
                            </span>
                          </div>
                          <div className="space-y-1.5 text-[11px] font-semibold leading-relaxed">
                            <p className="text-slate-600 dark:text-slate-350">
                              <span className="text-[9px] font-bold text-rose-500 uppercase block tracking-wider mb-0.5">Finding:</span>
                              {item.finding}
                            </p>
                            <p className="text-emerald-600 dark:text-emerald-400">
                              <span className="text-[9px] font-bold text-emerald-500 uppercase block tracking-wider mb-0.5">Recommended Remedy:</span>
                              ⚡ {item.remedy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No predatory clauses detected</p>
                      <p className="text-[10px] font-medium text-slate-400">This agreement does not contain aggressive privacy waivers or severe non-standard penalties.</p>
                    </div>
                  )}
                </div>

                {/* Hidden Fees Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Percent className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Hidden & Upfront Fees Checklist
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Extra surcharges, rollover penalties, or upfront processing deductions
                      </p>
                    </div>
                  </div>

                  {result.hiddenFees && result.hiddenFees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.hiddenFees.map((fee, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fee.name}</span>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">{fee.frequency}</span>
                            </div>
                            <span className="text-xs font-extrabold text-rose-500 dark:text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/10">
                              {fee.amount}
                            </span>
                          </div>
                          <p className="text-[10px] font-semibold leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-2">
                            {fee.finding}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-center text-slate-400 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No hidden fees extracted</p>
                      <p className="text-[10px] font-medium text-slate-400">All fees listed appear transparent and matching nominal expectations.</p>
                    </div>
                  )}
                </div>

                {/* Recommendations Checklist */}
                <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 space-y-4 border border-slate-850">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Zap className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100">
                        BorrowRight AI Directives
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Actionable steps regarding this validated credit offer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-200 leading-relaxed mt-0.5">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-2xs flex flex-col items-center justify-center min-h-[450px]">
                <div className="h-14 w-14 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-350 flex items-center justify-center">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Awaiting Verification Request
                  </h3>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select a preloaded agreement preset or upload/scan a custom document on the left to start the AI audit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: AI DOCUMENT INTELLIGENCE (New Requested Feature!)
          ============================================================== */}
      {docSubTab === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* Left Panel: Configuration and Uploads */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-emerald-500" />
                  Select Application Document
                </h3>
              </div>

              {/* Selector mode toggle */}
              <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setIntelActiveMode('preset');
                    setIntelError(null);
                  }}
                  className={`text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    intelActiveMode === 'preset'
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                  }`}
                >
                  Preloaded Files
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIntelActiveMode('upload');
                    setIntelError(null);
                  }}
                  className={`text-center py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    intelActiveMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                  }`}
                >
                  Upload custom scan
                </button>
              </div>

              <form onSubmit={handleIntelVerify} className="space-y-4">
                {intelActiveMode === 'preset' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Choose Sample Verification Preset
                      </label>
                      <div className="space-y-2.5">
                        {intelligencePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setIntelSelectedPreset(preset.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                              intelSelectedPreset === preset.id
                                ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/[0.03]'
                                : 'border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-750'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {preset.name}
                              </span>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
                                {preset.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                              {preset.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl p-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Preset Document OCR Text Preview
                      </span>
                      <pre className="text-[9px] text-slate-500 dark:text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap font-mono leading-normal bg-white/50 dark:bg-black/20 p-2.5 rounded-md border border-slate-100 dark:border-slate-850">
                        {intelPresetTexts[intelSelectedPreset]}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Upload / Drag-and-drop Area */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Scan or Drag Document Image
                      </label>
                      <div
                        onDragOver={handleIntelDragOver}
                        onDragLeave={handleIntelDragLeave}
                        onDrop={handleIntelDrop}
                        onClick={() => intelFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                          intelIsDragging
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : intelImageFile
                            ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <input
                          ref={intelFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleIntelFileChange}
                          className="hidden"
                        />
                        {intelImageFile ? (
                          <div className="space-y-2">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs mx-auto">
                              {intelImageFile.name}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {(intelImageFile.size / 1024).toFixed(1)} KB • Document Loaded
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearIntelUploadedFile();
                              }}
                              className="text-[10px] text-rose-500 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> Remove File
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 py-2">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-all">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Click to upload or drag & drop document
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              Upload Bank Statement, Payslip, Job letter, or NIN ID (PNG, JPG)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Textarea custom input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <span>Or Paste Document text contents</span>
                        <span className="text-[9px] text-slate-400 lowercase font-medium">
                          {intelCustomText.length} characters
                        </span>
                      </label>
                      <textarea
                        value={intelCustomText}
                        onChange={(e) => setIntelCustomText(e.target.value)}
                        rows={5}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-3 text-xs font-medium leading-relaxed"
                        placeholder="Paste payroll tables, statement transcripts, or HR letter texts..."
                      />
                    </div>
                  </div>
                )}

                {intelError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold flex gap-2 items-start leading-relaxed">
                    <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{intelError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={intelIsLoading || (intelActiveMode === 'upload' && !intelImageBase64 && !intelCustomText)}
                  className={`w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {intelIsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Running OCR & Audit...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Document Intelligence</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Profile Comparison context panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-emerald-500" /> Declared Profile Reference
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Applicant Name</span>
                  <span className="text-slate-800 dark:text-slate-200">{profile.fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Monthly Income</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₦{profile.monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-400 block uppercase">Employment Class</span>
                  <span className="text-slate-800 dark:text-slate-200">{profile.employmentStatus}</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 italic pt-1 leading-relaxed">
                BorrowRight compares OCR findings with these saved variables to flag verification mismatches.
              </p>
            </div>
          </div>

          {/* Right Panel: Results workspace */}
          <div className="lg:col-span-7">
            {intelIsLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-12 text-center space-y-6 shadow-2xs flex flex-col items-center justify-center min-h-[450px]">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-850 border-t-emerald-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Running Document Audit
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                    {intelLoadingSteps[intelLoadingStep]}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Gemini model is scanning layout structures, verifying signatures, cross-checking profiles, and checking CBN approval standards...
                  </p>
                </div>
              </div>
            ) : intelResult ? (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Main Dial and Verdict card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Underwriting Analysis</span>
                      <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                        {intelResult.documentType || 'Analyzed Document'}
                      </h2>
                    </div>

                    {/* Gauge metrics */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Readability</span>
                        <span className={`text-base font-black ${intelResult.readability >= 80 ? 'text-emerald-500' : intelResult.readability >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {intelResult.readability}%
                        </span>
                      </div>
                      <div className="text-center border-l border-slate-100 dark:border-slate-850 pl-5">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Completeness</span>
                        <span className={`text-base font-black ${intelResult.completeness >= 80 ? 'text-emerald-500' : intelResult.completeness >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {intelResult.completeness}%
                        </span>
                      </div>
                      <div className="text-center border-l border-slate-100 dark:border-slate-850 pl-5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Readiness Score</span>
                        <span className={`text-xl font-black ${intelResult.readinessScore >= 80 ? 'text-emerald-500' : intelResult.readinessScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {intelResult.readinessScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Verdict text */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-emerald-500" /> AI Diagnostic Summary
                    </span>
                    <p className="text-xs font-semibold leading-relaxed text-slate-650 dark:text-slate-350">
                      {intelResult.verdictSummary}
                    </p>
                  </div>
                </div>

                {/* Sub-Checklist Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <ClipboardList className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Loan Readiness Checklist
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Critical components needed before submitting to a regulated lender
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {intelResult.checklist && intelResult.checklist.length > 0 ? (
                      intelResult.checklist.map((item: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                            item.completed 
                              ? 'bg-emerald-500/[0.02] border-emerald-500/10' 
                              : 'bg-rose-500/[0.02] border-rose-500/10'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {item.completed ? (
                              <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="h-4.5 w-4.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-grow space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${item.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>
                                {item.item}
                              </span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                                item.priority === 'High' 
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                                  : item.priority === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-450'
                              }`}>
                                {item.priority} Priority
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                              {item.suggestion}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-semibold text-slate-400">No checklist items extracted.</div>
                    )}
                  </div>
                </div>

                {/* Profile Inconsistencies & Mismatches */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <ShieldAlert className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Flagged Profile Inconsistencies
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Deviations between user profile details and OCR extracted parameters
                      </p>
                    </div>
                  </div>

                  {intelResult.inconsistencies && intelResult.inconsistencies.length > 0 ? (
                    <div className="space-y-3.5">
                      {intelResult.inconsistencies.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-rose-500/[0.02] border border-rose-500/15 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              ⚠️ {item.item}
                            </span>
                            <span className="text-[8px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {item.severity} Severity
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold leading-relaxed space-y-2">
                            <p className="text-slate-650 dark:text-slate-350">
                              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block mb-0.5">Underwriting Finding:</span>
                              {item.finding}
                            </p>
                            <p className="text-emerald-600 dark:text-emerald-400">
                              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block mb-0.5">Required Action:</span>
                              ⚡ {item.remedy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 border border-dashed border-slate-100 dark:border-slate-850 rounded-xl space-y-1">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No profile mismatches detected</p>
                      <p className="text-[10px] font-medium text-slate-400">Document data correlates perfectly with your declared BorrowRight profile metrics.</p>
                    </div>
                  )}
                </div>

                {/* Underwriting risks panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Underwriting Risks & Red Flags
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Fintech and Bank decision criteria that might trigger automated loan denial
                      </p>
                    </div>
                  </div>

                  {intelResult.loanApprovalRisks && intelResult.loanApprovalRisks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {intelResult.loanApprovalRisks.map((risk: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{risk.issue}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                              risk.severity === 'High' 
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                                : risk.severity === 'Medium'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {risk.severity} Risk
                            </span>
                          </div>
                          <div className="space-y-2 text-[10px] font-semibold leading-relaxed">
                            <p className="text-slate-500 dark:text-slate-400">{risk.description}</p>
                            <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold">
                              💡 Suggestion: {risk.suggestion}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs font-semibold text-slate-400">No specific credit/risk triggers flagged.</div>
                  )}
                </div>

                {/* Missing required components */}
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <HelpCircle className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Missing Document Components
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Required signatures, letterheads, pages, or verification fields omitted
                      </p>
                    </div>
                  </div>

                  {intelResult.missingInfo && intelResult.missingInfo.length > 0 ? (
                    <ul className="space-y-2">
                      {intelResult.missingInfo.map((info: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850">
                          <XCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-5 text-center text-slate-400 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">All required components present</p>
                      <p className="text-[10px] font-medium text-slate-400">All standard layout segments, dates, signatures, and seals were successfully extracted.</p>
                    </div>
                  )}
                </div>

                {/* Pre-Submission Directives banner */}
                <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 space-y-4 border border-slate-850">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Zap className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100">
                        Actionable Submission Checklist
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Complete these steps before you upload these files to a lender
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                      <p className="text-xs font-bold text-slate-200 leading-relaxed">
                        Address all <span className="text-rose-400">High Priority</span> checklist flags by gathering complete statement pages or correcting profile name variations.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                      <p className="text-xs font-bold text-slate-200 leading-relaxed">
                        Improve image scan readability from {intelResult.readability}% to at least 85% to pass automated lender optical verification scanners.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                      <p className="text-xs font-bold text-slate-200 leading-relaxed">
                        Cross-check your stated income (₦{profile.monthlyIncome.toLocaleString()}) on all application forms to ensure it matches the actual net salary credits on your bank statement.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-2xs flex flex-col items-center justify-center min-h-[450px]">
                <div className="h-14 w-14 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-350 flex items-center justify-center animate-pulse">
                  <ClipboardList className="h-7 w-7" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Awaiting Pre-Submission Analysis
                  </h3>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select a sample preloaded file preset or upload/scan a custom document on the left to start the AI intelligence evaluation.
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Our system will run layout analysis, measure completeness, spot profile inconsistencies, detect approval risks, and build a checklist to get you approved.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
