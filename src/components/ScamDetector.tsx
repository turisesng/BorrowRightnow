/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Search, MessageSquare, Link, Image, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Upload, Bot } from 'lucide-react';

export const ScamDetector: React.FC = () => {
  const { addAuditLog } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'paste' | 'search' | 'image'>('paste');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ riskScore: number; safetyLevel: 'Safe' | 'Warning' | 'Danger'; analysisReason: string } | null>(null);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Image simulation states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleAnalyze = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/scam-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          type: activeSubTab
        })
      });
      const data = await res.json();
      setResult(data);
      addAuditLog('user@borrowright.ai', 'SCAM_SCAN', `Scanned content. Safety level evaluated: ${data.safetyLevel}. Risk: ${data.riskScore}%`);
    } catch (err) {
      console.error('Scam detector error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSafetyCardStyle = (level: 'Safe' | 'Warning' | 'Danger') => {
    switch (level) {
      case 'Safe':
        return 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300';
      case 'Warning':
        return 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-800/40 text-amber-800 dark:text-amber-300';
      case 'Danger':
        return 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 animate-pulse-slow';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedImage(file.name);
      // Analyze text simulation from image
      handleAnalyze(`SIMULATION ANALYZING ATTACHED SCREENSHOT: ${file.name}. Offer: Urgent ₦20,000 cash loan immediately. Collateral Free. Text instructions: Pay ₦2,000 upfront credit verification fee on WhatsApp link.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file.name);
      handleAnalyze(`SIMULATION ANALYZING ATTACHED SCREENSHOT: ${file.name}. Offer: Urgent ₦20,000 cash loan immediately. Collateral Free. Text instructions: Pay ₦2,000 upfront credit verification fee on WhatsApp link.`);
    }
  };

  return (
    <div id="scam-detector-module" className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Lending Scam Detector</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Detect advance fee credit fraud, abusive debt collection, or fake licensing claims before falling victim.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium self-start md:self-auto">
          <ShieldAlert className="h-4 w-4" /> Anti-Predatory Threat Analysis
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Input tab cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* Sub tabs selector */}
          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-2xl p-1 border border-slate-100 dark:border-slate-850">
            <button
              id="scam-tab-paste"
              onClick={() => {
                setActiveSubTab('paste');
                setResult(null);
                setUploadedImage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'paste' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <MessageSquare className="h-3.5 w-3.5" /> Paste SMS/Chat
            </button>
            <button
              id="scam-tab-search"
              onClick={() => {
                setActiveSubTab('search');
                setResult(null);
                setUploadedImage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'search' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Search className="h-3.5 w-3.5" /> Search App/URL
            </button>
            <button
              id="scam-tab-image"
              onClick={() => {
                setActiveSubTab('image');
                setResult(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'image' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Image className="h-3.5 w-3.5" /> Upload Image
            </button>
          </div>

          {/* Subtab paste inputs */}
          {activeSubTab === 'paste' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Paste Loan SMS / WhatsApp Message</label>
              <textarea
                id="scam-paste-text"
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl p-3 text-sm transition-all font-semibold"
                placeholder="Example: 'Congratulations Debbie! You have been approved for ₦250,000 cash. To claim, pay ₦5,000 security insurance activation fee to account 10293848. Click link t.me/fastcash'"
              />
              <button
                id="scam-analyze-paste-btn"
                onClick={() => handleAnalyze(inputText)}
                disabled={loading || !inputText.trim()}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl transition-all cursor-pointer font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Run Instant Threat Analysis'}
              </button>
            </div>
          )}

          {/* Subtab search inputs */}
          {activeSubTab === 'search' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Search Lender Name or Web URL</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 h-4.5 w-4.5" />
                <input
                  id="scam-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl py-2 pl-9 pr-3 text-sm font-semibold"
                  placeholder="e.g. fastnairacashapp.org"
                />
              </div>
              <button
                id="scam-analyze-search-btn"
                onClick={() => handleAnalyze(`Analyze this digital lender website / application named: ${searchQuery}. Review if CAC or FCCPC licensed.`)}
                disabled={loading || !searchQuery.trim()}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl transition-all cursor-pointer font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Search Lender Licensing & Trust Record'}
              </button>
            </div>
          )}

          {/* Subtab Image Upload */}
          {activeSubTab === 'image' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Upload Screenshot of Chat / Offer</label>
              
              <div
                id="scam-drag-area"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 bg-slate-50 dark:bg-slate-950'}`}
                onClick={() => document.getElementById('scam-file-picker')?.click()}
              >
                <input
                  id="scam-file-picker"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                {uploadedImage ? (
                  <span className="text-xs text-emerald-500 font-bold">{uploadedImage} Uploaded!</span>
                ) : (
                  <>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & Drop Screenshot here</span>
                    <span className="text-[10px] text-slate-400 mt-1">or click to browse local files</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right output Threat analysis panel */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Alert Status Card */}
              <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${getSafetyCardStyle(result.safetyLevel)} shadow-sm`}>
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-xs uppercase font-extrabold tracking-widest block opacity-75">Threat Level Assessed</span>
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-3xl font-black">{result.safetyLevel}</span>
                    <span className="text-xs font-bold opacity-70">(Score: {result.riskScore}/100)</span>
                  </div>
                  <p className="text-xs font-semibold opacity-85 mt-2 max-w-sm">
                    {result.safetyLevel === 'Safe' ? 'This lender exhibits regulated CBN traits. Proceed safely.' : result.safetyLevel === 'Warning' ? 'Indicators suggest unlicensed behavior. Caution advised.' : 'CRITICAL THREAT: Advance fee or harassment patterns detected! Avoid.'}
                  </p>
                </div>

                {/* Score bar */}
                <div className="h-20 w-20 rounded-full border-4 border-current flex items-center justify-center text-xl font-black flex-shrink-0">
                  {result.riskScore}%
                </div>
              </div>

              {/* Analysis Explanation */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-rose-500" />
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">AI Analysis Breakdown</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-850">
                  {result.analysisReason}
                </p>
              </div>

              {/* Tips */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 p-4 rounded-xl flex gap-3 text-xs">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-amber-800 dark:text-amber-400">What to do next:</p>
                  <p className="font-medium">• NEVER pay advance fees of any size to any digital cash loan app.</p>
                  <p className="font-medium">• Verify this lender against our live licensed register in the **Compliance Hub**.</p>
                  <p className="font-medium">• Report this app immediately using our **Report Scammer** form to alert our legal team.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Paste SMS or Chat Offers</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mt-1">
                  Our neural network scans vocabulary indicators, upfront fee cues, licensing syntax, and database history to assign immediate safety scores.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
