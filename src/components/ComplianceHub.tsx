import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { mockKnowledgeBase } from '../data/mockLenders';
import { 
  Search, ShieldCheck, ShieldAlert, FileText, AlertTriangle, 
  MessageSquare, ArrowRight, CheckCircle2, AlertOctagon, X, 
  Archive, RefreshCw, Eye, Check, Calendar, Filter, BellRing, 
  ChevronRight, Inbox, BookOpen, Trash2 
} from 'lucide-react';
import { ScamReport } from '../types';

export interface RegulatoryArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Policy Change' | 'Enforcement Action' | 'Compliance Alert' | 'Industry News';
  source: string;
  publishDate: string;
  isRead: boolean;
  isArchived: boolean;
  severity: 'Info' | 'Warning' | 'Critical';
}

const INITIAL_REGULATORY_ARTICLES: RegulatoryArticle[] = [
  {
    id: 'reg-1',
    title: 'CBN Unveils Strict New Guidelines for Microfinance and Digital Lending Rates',
    summary: 'The Central Bank of Nigeria has mandated a maximum permissible annualized percentage rate (APR) ceiling on all digital-only MFB credit operations to eliminate predatory collection practices.',
    content: `To protect low-income consumers, the CBN Consumer Protection department has released operational directives capping digital interest rates and fees. Under the new protocol:

1. Maximum monthly interest rate inclusive of all administrative fees is restricted to a structured tiered percentage.
2. Predatory weekly rollovers (often exceeding 30% weekly) are formally outlawed.
3. Every digital lender must disclose the full Annual Percentage Rate (APR) to the borrower prior to agreement signing.

Non-compliance will result in immediate suspension of the lender's operations.`,
    category: 'Policy Change',
    source: 'Central Bank of Nigeria (CBN)',
    publishDate: '2026-06-28',
    isRead: false,
    isArchived: false,
    severity: 'Critical'
  },
  {
    id: 'reg-2',
    title: 'FCCPC Sweep De-lists and Shuts Down 15 Predatory Unregistered Loan Providers',
    summary: 'In an enforcement crackdown in coordination with Google Play and local telecommunication carriers, the FCCPC has banned 15 more unauthorized mobile lending apps.',
    content: `The Federal Competition and Consumer Protection Commission (FCCPC) executed search-and-seizure warrants at unregistered lending offices in Lagos. These platforms were found using illegal contact-harvesting strategies to shame borrowers.

The general public is advised to strictly consult the FCCPC "Database of Approved Digital Lending Platforms" before committing to any digital credit providers. Check the 'Verify Lender' tab to verify if your lender is fully licensed.`,
    category: 'Enforcement Action',
    source: 'FCCPC Nigeria',
    publishDate: '2026-07-02',
    isRead: false,
    isArchived: false,
    severity: 'Warning'
  },
  {
    id: 'reg-3',
    title: 'NDPC Issues Security and Data Privacy Audit Directives for Fintech Lending Platforms',
    summary: 'The Nigeria Data Protection Commission directs all digital lending companies to undergo data privacy compliance audits within 45 days.',
    content: `Following multiple complaints of harassment and privacy violations, the NDPC is requiring all fintech credit providers to submit a comprehensive audit of their data collection processes.

Under NDPC guidelines, digital lenders are strictly prohibited from accessing a user's contact lists, photogalleries, or GPS locations as a condition for granting credit. Any app found requesting these permissions will have its certification revoked.`,
    category: 'Compliance Alert',
    source: 'NDPC Nigeria',
    publishDate: '2026-06-15',
    isRead: false,
    isArchived: false,
    severity: 'Warning'
  },
  {
    id: 'reg-4',
    title: 'Fintech Association Launches Peer-to-Peer Code of Conduct for Ethical Debt Collection',
    summary: 'A new self-regulatory industry standard aims to eliminate abusive collection strategies, establishing a direct feedback channel for consumer complaints.',
    content: `The Fintech Association of Nigeria (FinTechNGR) has introduced an industry-wide Code of Conduct on Debt Collection practices. Signed by major digital lenders, the pact commits institutions to transparent, non-coercive collection protocols.

Key resolutions:
1. No contacts outside the borrower and declared guarantors may be reached.
2. Collection staff are prohibited from using defamatory, threatening, or vulgar communications.
3. Establish a standard dispute mechanism with 24-hour resolution SLA.`,
    category: 'Industry News',
    source: 'FinTechNGR',
    publishDate: '2026-06-10',
    isRead: true,
    isArchived: false,
    severity: 'Info'
  },
  {
    id: 'reg-5',
    title: 'Joint Task Force Advisory on Digital Asset Lending & Cryptographic Collateral Regulations',
    summary: 'CBN and SEC release Joint Advisory clarifying policy constraints regarding loans collateralized by digital tokens or cryptographic assets.',
    content: `The joint regulatory panel of CBN and SEC issued fresh clarifications advising consumers that cryptocurrencies remain unapproved assets for securing standard micro-loans. Users are warned that any platform claiming CBN-backed insurance on tokenized deposits is fraudulent.`,
    category: 'Compliance Alert',
    source: 'CBN / SEC Joint Panel',
    publishDate: '2026-07-04',
    isRead: false,
    isArchived: false,
    severity: 'Info'
  }
];

export const ComplianceHub: React.FC = () => {
  const { scamReports, setScamReports, addAuditLog, addNotification, lenders } = useApp();
  const [activeSubView, setActiveSubView] = useState<'verify' | 'rights' | 'report' | 'regulatory'>('verify');
  
  // Regulatory updates states
  const [regulatoryArticles, setRegulatoryArticles] = useState<RegulatoryArticle[]>(() => {
    const saved = localStorage.getItem('borrowright_regulatory_articles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_REGULATORY_ARTICLES;
  });
  
  const [regLoading, setRegLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<RegulatoryArticle | null>(null);
  const [regCategoryFilter, setRegCategoryFilter] = useState<string>('All');
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [showArchivedReg, setShowArchivedReg] = useState<boolean>(false);

  const updateArticles = (updated: RegulatoryArticle[]) => {
    setRegulatoryArticles(updated);
    localStorage.setItem('borrowright_regulatory_articles', JSON.stringify(updated));
  };

  const fetchRegulatoryUpdates = () => {
    setRegLoading(true);
    // Simulate API network latency of 750ms
    setTimeout(() => {
      setRegLoading(false);
      addNotification('INFO: Regulatory Compliance Feed successfully updated.');
      addAuditLog('user@borrowright.ai', 'FETCH_REGULATORY', 'Fetched recent regulatory changes via mock CBN/FCCPC API feed');
    }, 750);
  };

  // Run initial fetch check on mount if empty or first-time
  useEffect(() => {
    if (regulatoryArticles.length === 0) {
      updateArticles(INITIAL_REGULATORY_ARTICLES);
    }
  }, []);

  const markAsRead = (id: string, read: boolean = true) => {
    const updated = regulatoryArticles.map(a => a.id === id ? { ...a, isRead: read } : a);
    updateArticles(updated);
    addAuditLog('user@borrowright.ai', 'REGULATORY_READ_STATUS', `Marked article ${id} as ${read ? 'read' : 'unread'}`);
  };

  const markAllAsRead = () => {
    const updated = regulatoryArticles.map(a => showArchivedReg === a.isArchived ? { ...a, isRead: true } : a);
    updateArticles(updated);
    addNotification('SUCCESS: All regulatory updates in current view marked as read.');
    addAuditLog('user@borrowright.ai', 'REGULATORY_MARK_ALL_READ', 'Marked all viewed regulatory updates as read');
  };

  const toggleArchive = (id: string) => {
    const item = regulatoryArticles.find(a => a.id === id);
    if (!item) return;
    const nextArchived = !item.isArchived;
    const updated = regulatoryArticles.map(a => a.id === id ? { ...a, isArchived: nextArchived, isRead: true } : a);
    updateArticles(updated);
    
    addNotification(`INFO: "${item.title.slice(0, 30)}..." moved to ${nextArchived ? 'Archive' : 'Active Inbox'}.`);
    addAuditLog('user@borrowright.ai', nextArchived ? 'REGULATORY_ARCHIVE' : 'REGULATORY_UNARCHIVE', `Toggled archive for regulatory update: ${id}`);
    
    if (selectedArticle?.id === id) {
      setSelectedArticle({ ...selectedArticle, isArchived: nextArchived, isRead: true });
    }
  };
  
  // Verify states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  
  // Helper to highlight matching text as the user types in real-time
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 rounded-[3px] px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };
  
  // Report scam states
  const [lenderName, setLenderName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [scamType, setScamType] = useState('Predatory Interest');
  const [evidenceText, setEvidenceText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Real-time search and category filter
  const verifiedLenders = lenders.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || l.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleReportScam = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: ScamReport = {
      id: `scam-${Date.now()}`,
      lenderName,
      contactInfo,
      scamType,
      evidenceText,
      status: 'Pending',
      reportedAt: new Date().toISOString(),
      riskScore: 85, // Default calculation
      analysisReason: 'Pending admin review and Gemini neural analysis verification.'
    };

    setScamReports([newReport, ...scamReports]);
    addAuditLog('user@borrowright.ai', 'REPORT_SCAM', `Logged scam report against: ${lenderName}`);
    addNotification(`ALERT: Your scam report against ${lenderName} has been recorded. Admin review pending.`);
    setSubmitted(true);
    
    // Clear forms
    setLenderName('');
    setContactInfo('');
    setEvidenceText('');
  };

  return (
    <div id="regulatory-compliance-hub-module" className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Regulatory Compliance Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Verify lender licenses, report illegal predatory loan apps, and master your legal borrower rights under CBN and FCCPC.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-950 rounded-2xl p-1 border border-slate-100 dark:border-slate-850 self-start md:self-auto">
          <button
            id="hub-sub-verify"
            onClick={() => { setActiveSubView('verify'); setSubmitted(false); }}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeSubView === 'verify' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 border-transparent'}`}
          >
            Verify Lender
          </button>
          <button
            id="hub-sub-rights"
            onClick={() => { setActiveSubView('rights'); setSubmitted(false); }}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeSubView === 'rights' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 border-transparent'}`}
          >
            Borrower Rights
          </button>
          <button
            id="hub-sub-report"
            onClick={() => { setActiveSubView('report'); setSubmitted(false); }}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeSubView === 'report' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 border-transparent'}`}
          >
            Report Scammer
          </button>
          <button
            id="hub-sub-regulatory"
            onClick={() => { setActiveSubView('regulatory'); setSubmitted(false); }}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeSubView === 'regulatory' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 border-transparent'}`}
          >
            Regulatory Updates
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Verify Lender subtab */}
        {activeSubView === 'verify' && (
          <div className="lg:col-span-12 space-y-6">
            {/* Filter Input and Pill Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs animate-fadeIn">
              <div className="w-full lg:max-w-md relative">
                <Search className="absolute left-3.5 top-3 text-slate-400 h-5 w-5" />
                <input
                  id="lender-search-bar"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl py-2.5 pl-10 pr-10 text-sm transition-all font-semibold shadow-inner placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Search licensed bank or license ID (e.g. CBN/MFB)"
                />
                {searchQuery && (
                  <button
                    id="clear-lender-search"
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Type Filters as Pill Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">Category:</span>
                {['All', 'Commercial Bank', 'Microfinance Bank', 'Finance Company'].map((type) => (
                  <button
                    id={`filter-pill-${type.toLowerCase().replace(' ', '-')}`}
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedType === type
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {type === 'All' ? 'All Types' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Match Indicators / Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${verifiedLenders.length > 0 ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${verifiedLenders.length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
                <span>
                  Showing {verifiedLenders.length} of {lenders.length} licensed institutions
                </span>
              </div>
              
              {/* Quick Search Suggestions */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Quick Suggestions:</span>
                {['Access Bank', 'Carbon', 'CBN/MFB'].map((term) => (
                  <button
                    id={`quick-search-${term.toLowerCase().replace('/', '-')}`}
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      setSelectedType('All');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-bold"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verifiedLenders.length > 0 ? (
                verifiedLenders.map(l => (
                  <div key={l.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                          {highlightText(l.name, searchQuery)}
                        </h4>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest mt-0.5">
                          {highlightText(l.type, searchQuery)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/45 px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                        <ShieldCheck className="h-3.5 w-3.5" /> LICENSED
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Regulator:</span>
                        <span className="font-bold">{l.regulator} (Central Bank of Nigeria)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">License Number:</span>
                        <span className="font-mono text-slate-500 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded-md">
                          {highlightText(l.licenseNumber, searchQuery)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold">Contact Support:</span>
                        <span className="font-medium">{l.contactPhone}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-xs">
                      <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Grievance Escalation Process</p>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{l.complaintsProcess}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-950/25 p-8 text-center rounded-2xl space-y-2">
                  <ShieldAlert className="h-8 w-8 text-rose-500 mx-auto" />
                  <h4 className="font-bold text-rose-800 dark:text-rose-400">UNREGISTERED OR UNLICENSED INSTANCE</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    This search returned 0 approved records. This lender is likely operating illegally without FCCPC or CBN approval. Do NOT supply your BVN, NIN, or contact authorization details to them.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Borrower Rights subtab */}
        {activeSubView === 'rights' && (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockKnowledgeBase.map(kb => (
              <div key={kb.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/10 px-2 py-0.5 rounded-full">{kb.category}</span>
                  <h3 className="font-bold text-base tracking-tight mt-3 text-slate-800 dark:text-slate-100">{kb.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">{kb.summary}</p>
                </div>

                <div className="border-t border-slate-50 dark:border-slate-800 pt-4 mt-5">
                  <span className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-line text-left block">
                    {kb.content.slice(0, 160)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Scam subtab */}
        {activeSubView === 'report' && (
          <div className="lg:col-span-6 mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            {submitted ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="font-bold">Scam Report Submitted Safely</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Thank you. We have recorded the malicious lender. Our AI system has dispatched verification bots to scan and block their contact routes.
                  </p>
                </div>
                <button
                  id="report-another-btn"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Report Another App
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportScam} className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wide text-rose-500 flex items-center gap-1.5 mb-2">
                  <AlertOctagon className="h-5 w-5" /> Anonymous Predatory App Escalation
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Malicious App / Lender Name</label>
                  <input
                    id="report-lender-name"
                    type="text"
                    required
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-rose-500 font-semibold"
                    placeholder="e.g. EasyCash Now Mobile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Threat Channel (WhatsApp / SMS Sender ID)</label>
                  <input
                    id="report-contact"
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-rose-500 font-semibold"
                    placeholder="e.g. SMS Sender 'EASYCASH' or +234 809..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Violative Behavior</label>
                  <select
                    id="report-scam-type"
                    value={scamType}
                    onChange={(e) => setScamType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="Predatory Interest">Predatory Interest Rate (&gt;30% weekly)</option>
                    <option value="Advance Fee Fraud">Upfront Processing Fee Fraud</option>
                    <option value="Abusive recovery shaming">Threats to broadcast photo to contacts</option>
                    <option value="Unregistered / Fake License claim">Fake CBN or CAC representation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Describe Harassment / Evidence Details</label>
                  <textarea
                    id="report-evidence"
                    rows={4}
                    required
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-rose-500 rounded-xl p-3 text-sm font-semibold"
                    placeholder="Provide text details of threats, upfront payments demanded, or links provided..."
                  />
                </div>

                <button
                  id="submit-scam-report-btn"
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-sm"
                >
                  File Urgent Regulatory Grievance
                </button>
              </form>
            )}
          </div>
        )}

        {/* Regulatory Updates subtab */}
        {activeSubView === 'regulatory' && (
          <div className="lg:col-span-12 space-y-6 animate-fadeIn" id="regulatory-updates-container">
            {/* Upper Feed Banner & Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BellRing className="h-5.5 w-5.5 animate-pulse text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Verified CBN & FCCPC Policy Circulars</h3>
                    <p className="text-xs text-slate-400 font-semibold">
                      Live feed of regulatory circulars synchronized with federal enforcement portals
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="refresh-reg-btn"
                    onClick={fetchRegulatoryUpdates}
                    disabled={regLoading}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-850 cursor-pointer disabled:opacity-50 select-none transition-all"
                  >
                    <RefreshCw className={`h-4 w-4 ${regLoading ? 'animate-spin text-emerald-600' : ''}`} />
                    {regLoading ? 'Syncing...' : 'Sync Feed'}
                  </button>

                  <button
                    id="mark-all-read-btn"
                    onClick={markAllAsRead}
                    disabled={regulatoryArticles.filter(a => showArchivedReg === a.isArchived && !a.isRead).length === 0}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 dark:text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-100/30 dark:border-emerald-950/40 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all"
                  >
                    <Check className="h-4 w-4" />
                    Mark All Read
                  </button>
                </div>
              </div>

              {/* Inbox / Archive Filter Tabs */}
              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850 pt-4 gap-4 flex-wrap">
                <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl p-1">
                  <button
                    id="reg-inbox-tab"
                    onClick={() => { setShowArchivedReg(false); setSelectedArticle(null); }}
                    className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${!showArchivedReg ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Inbox className="h-3.5 w-3.5" />
                    Active Feed ({regulatoryArticles.filter(a => !a.isArchived).length})
                    {regulatoryArticles.filter(a => !a.isArchived && !a.isRead).length > 0 && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                  <button
                    id="reg-archive-tab"
                    onClick={() => { setShowArchivedReg(true); setSelectedArticle(null); }}
                    className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${showArchivedReg ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archived ({regulatoryArticles.filter(a => a.isArchived).length})
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <span>Unread circulars in current view:</span>
                  <span className="bg-amber-500/10 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold">
                    {regulatoryArticles.filter(a => showArchivedReg === a.isArchived && !a.isRead).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter controls panel */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
              {/* Dynamic search bar */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3.5 top-3.5 text-slate-400 h-4.5 w-4.5" />
                <input
                  id="reg-search-bar"
                  type="text"
                  value={regSearchQuery}
                  onChange={(e) => setRegSearchQuery(e.target.value)}
                  placeholder="Search updates by keyword, title, source..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-8 text-xs font-semibold focus:border-emerald-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                />
                {regSearchQuery && (
                  <button
                    id="clear-reg-search"
                    onClick={() => setRegSearchQuery('')}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'Policy Change', 'Enforcement Action', 'Compliance Alert', 'Industry News'].map(cat => (
                  <button
                    id={`reg-cat-pill-${cat.toLowerCase().replace(' ', '-')}`}
                    key={cat}
                    onClick={() => setRegCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${regCategoryFilter === cat ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Split feed screen */}
            {regLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
                <div>
                  <h4 className="font-bold text-sm">Syncing with Regulatory Central Servers</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Establishing secure API channel to CBN circular database and FCCPC legal registry...
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Articles List */}
                <div className={`${selectedArticle ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3.5`}>
                  {regulatoryArticles.filter(a => {
                    const matchesSearch = 
                      a.title.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                      a.summary.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                      a.content.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                      a.source.toLowerCase().includes(regSearchQuery.toLowerCase());
                    const matchesCategory = regCategoryFilter === 'All' || a.category === regCategoryFilter;
                    const matchesArchived = a.isArchived === showArchivedReg;
                    return matchesSearch && matchesCategory && matchesArchived;
                  }).length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4">
                      <Inbox className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-500 dark:text-slate-400">No matching regulatory notifications</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Try adjusting your search queries or category filters.
                        </p>
                      </div>
                    </div>
                  ) : (
                    regulatoryArticles.filter(a => {
                      const matchesSearch = 
                        a.title.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                        a.summary.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                        a.content.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                        a.source.toLowerCase().includes(regSearchQuery.toLowerCase());
                      const matchesCategory = regCategoryFilter === 'All' || a.category === regCategoryFilter;
                      const matchesArchived = a.isArchived === showArchivedReg;
                      return matchesSearch && matchesCategory && matchesArchived;
                    }).map(art => {
                      const isArtSelected = selectedArticle?.id === art.id;
                      return (
                        <div
                          id={`reg-card-${art.id}`}
                          key={art.id}
                          className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all duration-250 hover:shadow-xs relative ${
                            isArtSelected 
                              ? 'border-emerald-500 dark:border-emerald-500/50 bg-emerald-50/5 dark:bg-emerald-950/5 shadow-inner animate-pulse' 
                              : !art.isRead 
                                ? 'border-amber-100 dark:border-amber-950/35 bg-amber-50/5 dark:bg-amber-950/2' 
                                : 'border-slate-100 dark:border-slate-850'
                          }`}
                        >
                          {/* Unread Indicator Bar */}
                          {!art.isRead && (
                            <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-500 animate-pulse" title="Unread Update" />
                          )}

                          <div className="space-y-3">
                            {/* Badges line */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                art.category === 'Policy Change' 
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/10' 
                                  : art.category === 'Enforcement Action'
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/10'
                                    : art.category === 'Compliance Alert'
                                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100/10'
                                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/10'
                              }`}>
                                {art.category}
                              </span>

                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                                art.severity === 'Critical'
                                  ? 'bg-rose-500 text-white dark:bg-rose-900/60'
                                  : art.severity === 'Warning'
                                    ? 'bg-amber-500 text-slate-900 dark:bg-amber-600/40 dark:text-amber-200'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {art.severity} Impact
                              </span>

                              <span className="text-[10px] text-slate-400 font-semibold ml-auto flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {new Date(art.publishDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                              </span>
                            </div>

                            {/* Headline & Summary */}
                            <div>
                              <h4 
                                onClick={() => { setSelectedArticle(art); markAsRead(art.id, true); }}
                                className="text-xs font-bold leading-snug cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              >
                                {highlightText(art.title, regSearchQuery)}
                              </h4>
                              <p className="text-[11px] text-slate-400 dark:text-slate-450 leading-relaxed font-semibold mt-1 line-clamp-2">
                                {highlightText(art.summary, regSearchQuery)}
                              </p>
                            </div>

                            {/* Info and Actions */}
                            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850/60 pt-2.5">
                              <span className="text-[10px] font-bold text-slate-400">
                                Agency: <span className="text-slate-600 dark:text-slate-300 font-semibold">{highlightText(art.source, regSearchQuery)}</span>
                              </span>

                              <div className="flex items-center gap-1.5">
                                {/* Toggle Read Status */}
                                <button
                                  id={`toggle-read-btn-${art.id}`}
                                  type="button"
                                  onClick={() => markAsRead(art.id, !art.isRead)}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                  title={art.isRead ? "Mark as unread" : "Mark as read"}
                                >
                                  {art.isRead ? <Inbox className="h-3.5 w-3.5 text-slate-400" /> : <Check className="h-3.5 w-3.5 text-amber-500" />}
                                </button>

                                {/* Toggle Archive Status */}
                                <button
                                  id={`toggle-archive-btn-${art.id}`}
                                  type="button"
                                  onClick={() => toggleArchive(art.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                  title={art.isArchived ? "Restore to active feed" : "Move to Archive"}
                                >
                                  <Archive className={`h-3.5 w-3.5 ${art.isArchived ? 'text-emerald-600' : ''}`} />
                                </button>

                                {/* Read Circular details */}
                                <button
                                  id={`read-circular-btn-${art.id}`}
                                  type="button"
                                  onClick={() => { setSelectedArticle(art); markAsRead(art.id, true); }}
                                  className="flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-0.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
                                >
                                  Circular Detail <ChevronRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right: Selected Article Detail Pane */}
                {selectedArticle && (
                  <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5.5 shadow-2xs space-y-4 sticky top-24 animate-slideLeft" id="reg-detail-pane">
                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guideline Document Registry</span>
                      <button
                        id="close-reg-detail"
                        onClick={() => setSelectedArticle(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Close guideline details"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Sub-header info block */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            selectedArticle.category === 'Policy Change' 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                              : selectedArticle.category === 'Enforcement Action'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {selectedArticle.category}
                          </span>
                          
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 ml-auto">
                            <Calendar className="h-3 w-3" /> Circular date: {selectedArticle.publishDate}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100 leading-snug">
                          {selectedArticle.title}
                        </h3>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/60">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Issuing Regulatory Body</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedArticle.source}</span>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Official Circular Directives</span>
                        <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold space-y-2 max-h-72 overflow-y-auto pr-1 whitespace-pre-line border border-slate-50 dark:border-slate-850 p-3 rounded-xl bg-slate-50/30 dark:bg-slate-950/20">
                          {selectedArticle.content}
                        </div>
                      </div>

                      {/* Consumer Compliance Impact Card */}
                      <div className="bg-amber-50/10 dark:bg-amber-950/10 border border-amber-100/20 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <ShieldCheck className="h-4 w-4" /> Consumer Compliance Instructions
                        </div>
                        <ul className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold list-disc list-inside space-y-1">
                          <li>Before executing agreements with apps, demand to inspect full APR rates.</li>
                          <li>If any lender demands access to your contacts list, exit and report them.</li>
                          <li>Do not execute weekly rollovers violating the mandated CBN APR.</li>
                        </ul>
                      </div>

                      {/* Detail control buttons */}
                      <div className="flex items-center gap-2 border-t border-slate-50 dark:border-slate-850/60 pt-4">
                        <button
                          id="ack-circular-btn"
                          onClick={() => {
                            addNotification(`SUCCESS: Acknowledged regulatory circular ${selectedArticle.id}.`);
                            addAuditLog('user@borrowright.ai', 'ACKNOWLEDGE_REGULATORY', `User acknowledged regulatory circular regarding: ${selectedArticle.title}`);
                            setSelectedArticle(null);
                          }}
                          className="flex-grow bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer transition-all text-center"
                        >
                          Acknowledge Circular & Exit
                        </button>

                        <button
                          id="detail-archive-toggle"
                          onClick={() => toggleArchive(selectedArticle.id)}
                          className="flex items-center justify-center p-2 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 cursor-pointer"
                          title={selectedArticle.isArchived ? "Restore to active feed" : "Move to Archive"}
                        >
                          <Archive className={`h-4.5 w-4.5 ${selectedArticle.isArchived ? 'text-emerald-600' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
