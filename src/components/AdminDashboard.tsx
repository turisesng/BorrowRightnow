/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { mockLenders, mockProducts } from '../data/mockLenders';
import { ShieldAlert, Users, Layers, AlertOctagon, MessagesSquare, FileText, Settings, Key, Trash2, Check, RefreshCw, Sparkles, Sliders } from 'lucide-react';
import { ScamReport, SupportTicket } from '../types';

export const AdminDashboard: React.FC = () => {
  const { scamReports, setScamReports, supportTickets, setSupportTickets, auditLogs, systemSettings, setSystemSettings, addAuditLog, addNotification } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'lenders' | 'scams' | 'tickets' | 'prompts' | 'audit'>('overview');

  // Simulated Users list for management
  const [usersList, setUsersList] = useState([
    { email: 'ijogbonnadebbie@gmail.com', name: 'Debbie Debbie', role: 'User', status: 'Active', plan: 'Basic' },
    { email: 'chidi.eze@borrowright.ai', name: 'Chidi Eze', role: 'Manager', status: 'Active', plan: 'Enterprise' },
    { email: 'fatima.bello@gmail.com', name: 'Fatima Bello', role: 'User', status: 'Flagged', plan: 'Basic' }
  ]);

  // Prompt configuration states
  const [advisorSystemPrompt, setAdvisorSystemPrompt] = useState(systemSettings.advisorSystemPrompt);
  const [scamDetectorSystemPrompt, setScamDetectorSystemPrompt] = useState(systemSettings.scamDetectorSystemPrompt);

  const handleTogglePlan = (email: string) => {
    setUsersList(usersList.map(u => u.email === email ? { ...u, plan: u.plan === 'Premium' ? 'Basic' : 'Premium' } : u));
    addAuditLog('admin@borrowright.ai', 'USER_PLAN_TOGGLE', `Modified license plan for user: ${email}`);
  };

  const handleResolveTicket = (id: string) => {
    setSupportTickets(supportTickets.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    addAuditLog('admin@borrowright.ai', 'TICKET_RESOLVE', `Marked ticket ${id} as resolved`);
    addNotification(`Your support ticket has been resolved by the credit advisory team.`);
  };

  const handleScamAction = (id: string, action: 'Safe' | 'Danger') => {
    setScamReports(scamReports.map(r => r.id === id ? { ...r, status: 'Reviewed', safetyLevel: action, riskScore: action === 'Safe' ? 10 : 95 } : r));
    addAuditLog('admin@borrowright.ai', 'SCAM_REVIEW', `Reviewed scam report ${id}. Action: Marked as ${action}`);
  };

  const handleSavePrompts = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemSettings({
      ...systemSettings,
      advisorSystemPrompt,
      scamDetectorSystemPrompt
    });
    addAuditLog('admin@borrowright.ai', 'SYSTEM_PROMPT_UPDATE', 'Updated Gemini model prompt templates');
    alert('System settings and Gemini prompts updated successfully.');
  };

  return (
    <div id="admin-management-portal" className="space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Operations & Core Control</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review user databases, regulate licenses, resolve support escalations, monitor audit trails, and edit Gemini prompt templates.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-xs font-semibold self-start md:self-auto">
          <Key className="h-4 w-4 text-emerald-500" /> Administrative Access (RBAC: ROOT)
        </div>
      </div>

      {/* Admin Horizontal Sub Navigation */}
      <div className="flex flex-wrap bg-slate-50 dark:bg-slate-950 rounded-2xl p-1 border border-slate-100 dark:border-slate-850">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'lenders', label: 'User & Lender List', icon: Users },
          { id: 'scams', label: `Scam Escapes (${scamReports.filter(r => r.status === 'Pending').length})`, icon: AlertOctagon },
          { id: 'tickets', label: `Tickets (${supportTickets.filter(t => t.status === 'Open').length})`, icon: MessagesSquare },
          { id: 'prompts', label: 'Gemini Prompts', icon: Sliders },
          { id: 'audit', label: 'Security Audit Logs', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              id={`admin-subtab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeAdminTab === tab.id ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}

      {/* 1. OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Advisory Users</span>
              <span className="text-2xl font-black mt-1 block">3</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Licensed Institutions</span>
              <span className="text-2xl font-black mt-1 block">{mockLenders.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Threat Escalations</span>
              <span className="text-2xl font-black mt-1 block text-rose-500">{scamReports.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 block uppercase">Active Tickets</span>
              <span className="text-2xl font-black mt-1 block text-amber-500">{supportTickets.filter(t => t.status === 'Open').length}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400 border-b border-slate-50 dark:border-slate-800 pb-3 mb-4">Core API Server Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="flex justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-slate-400">Underwriting Models:</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">● gemini-3.5-flash</span>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-slate-400">Lender Database:</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">● local + supabase schemas</span>
              </div>
              <div className="flex justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-slate-400">System Logs:</span>
                <span className="font-bold text-emerald-500">Active (SHA-256 encrypted)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS & LENDERS */}
      {activeAdminTab === 'lenders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Users List */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-3">User Directory</h3>
            <div className="space-y-3">
              {usersList.map((u, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{u.name}</h4>
                    <span className="text-[10px] text-slate-400 block">{u.email}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">License Plan: {u.plan}</span>
                  </div>

                  <button
                    id={`toggle-user-plan-${idx}`}
                    onClick={() => handleTogglePlan(u.email)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-[10px] font-bold rounded-lg cursor-pointer text-emerald-600"
                  >
                    Toggle Premium
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lenders Directory */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-3">Lender Register</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {mockLenders.map(l => (
                <div key={l.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{l.name}</span>
                    <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500">{l.licenseNumber}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Regulator: {l.regulator} ({l.type})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SCAM REPORTS */}
      {activeAdminTab === 'scams' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-3">Escalated Scam Applications ({scamReports.length})</h3>

          {scamReports.length > 0 ? (
            <div className="space-y-4">
              {scamReports.map(report => (
                <div key={report.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{report.lenderName}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">Channel: {report.contactInfo}</span>
                      <span className="text-[10px] font-semibold text-rose-500 block">Threat Type: {report.scamType}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${report.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {report.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Threat Score: {report.riskScore}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-850">
                    {report.evidenceText}
                  </p>

                  {report.status === 'Pending' && (
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        id={`mark-safe-${report.id}`}
                        onClick={() => handleScamAction(report.id, 'Safe')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Mark Safe
                      </button>
                      <button
                        id={`mark-danger-${report.id}`}
                        onClick={() => handleScamAction(report.id, 'Danger')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Acknowledge Danger App
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No reported scams to evaluate.
            </div>
          )}
        </div>
      )}

      {/* 4. SUPPORT TICKETS */}
      {activeAdminTab === 'tickets' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-3">User Dispute Escalations ({supportTickets.length})</h3>

          {supportTickets.length > 0 ? (
            <div className="space-y-4">
              {supportTickets.map(ticket => (
                <div key={ticket.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{ticket.category}</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{ticket.subject}</h4>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ticket.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-850">
                    {ticket.description}
                  </p>

                  {ticket.status === 'Open' && (
                    <div className="flex justify-end pt-1">
                      <button
                        id={`resolve-ticket-${ticket.id}`}
                        onClick={() => handleResolveTicket(ticket.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" /> Dispatch Resolution Counseling
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No open helpdesk tickets.
            </div>
          )}
        </div>
      )}

      {/* 5. PROMPT MANAGER */}
      {activeAdminTab === 'prompts' && (
        <form onSubmit={handleSavePrompts} id="admin-prompt-editor-form" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400">Gemini Prompt Templates Control Panel</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">HOT RELOAD ON SAVE</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Financial Advisor Neural System Instructions</label>
              <textarea
                id="advisor-prompt-input"
                rows={4}
                value={advisorSystemPrompt}
                onChange={(e) => setAdvisorSystemPrompt(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-600 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Scam Detector Pattern Classifier Prompts</label>
              <textarea
                id="scam-prompt-input"
                rows={4}
                value={scamDetectorSystemPrompt}
                onChange={(e) => setScamDetectorSystemPrompt(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>

          <button
            id="save-prompts-btn"
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Apply Prompt Configuration Instantly
          </button>
        </form>
      )}

      {/* 6. SECURITY AUDIT LOGS */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400">Live Infrastructure Events Log</h3>
            <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded text-slate-500 font-bold">SHA-256 PARITY</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs flex justify-between gap-4 border border-slate-100 dark:border-slate-850">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px]">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{log.userEmail}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0 self-start">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
