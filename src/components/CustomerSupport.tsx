/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { SupportTicket } from '../types';
import { FAQComponent } from './FAQComponent';

export const CustomerSupport: React.FC = () => {
  const { supportTickets, setSupportTickets, addAuditLog, addNotification } = useApp();
  
  // New ticket states
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General Advice');
  const [submitted, setSubmitted] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      subject,
      description: message,
      status: 'Open',
      category,
      createdAt: new Date().toISOString(),
      messages: []
    };

    setSupportTickets([newTicket, ...supportTickets]);
    addAuditLog('user@borrowright.ai', 'SUPPORT_TICKET_CREATE', `Created ticket with subject: ${subject}`);
    addNotification(`Your support ticket '${subject}' has been submitted. Response within 2 hours.`);
    setSubmitted(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div id="customer-support-module" className="space-y-8 animate-fadeIn">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support & Escalations</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Resolve account questions, file advisory inquiries, or view your current escalation tickets.
          </p>
        </div>
        <button
          id="new-ticket-trigger-btn"
          onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold self-start md:self-auto cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Open Support Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Categorized FAQs with search and accordion */}
        <div className="lg:col-span-7 space-y-4">
          <FAQComponent />
        </div>

        {/* Right: Ticket form or Ticket List */}
        <div className="lg:col-span-5 space-y-6">
          {showForm ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              {submitted ? (
                <div className="text-center py-8 space-y-3 animate-fadeIn">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold">Ticket Submitted Successfully</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your ticket has been routed to our credit compliance counselors. We will notification ping you upon resolution.
                  </p>
                  <button
                    id="back-to-tickets-btn"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    View My Tickets
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400">Create Helpdesk Escalation</h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Subject</label>
                    <input
                      id="ticket-subject"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                      placeholder="e.g. Discrepancy with FairMoney interest calculation"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Inquiry Category</label>
                    <select
                      id="ticket-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                    >
                      <option value="General Advice">General Debt Counseling</option>
                      <option value="Licensing Discrepancy">Lender Licensing Dispute</option>
                      <option value="Technical Error">Application Performance Bug</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Inquiry Description</label>
                    <textarea
                      id="ticket-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-emerald-500 rounded-xl p-3 text-sm font-semibold"
                      placeholder="Be specific about lender names, contract dates, or interest amounts..."
                    />
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      id="cancel-ticket-btn"
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-850 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-ticket-btn"
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer text-center"
                    >
                      File Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400 flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-3">
                <MessageSquare className="h-4.5 w-4.5 text-emerald-500" /> Open Tickets ({supportTickets.length})
              </h3>

              {supportTickets.length > 0 ? (
                <div className="space-y-3">
                  {supportTickets.map(ticket => (
                    <div key={ticket.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.category}</span>
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{ticket.subject}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{ticket.description}</p>
                      <span className="text-[10px] text-slate-400 block pt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Submitted: {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active support escalations on file.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
