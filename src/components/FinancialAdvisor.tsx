/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, Bot, User, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const templates = [
  { label: 'Can I afford a loan?', prompt: 'Can I afford to borrow ₦300,000 based on my current salary and debts?' },
  { label: 'My salary is ₦250,000', prompt: 'My salary is ₦250,000 and I have two quick loans. How can I plan my budget to pay them off?' },
  { label: 'Help me with Snowball payoff', prompt: 'Can you explain how to set up the Debt Snowball payoff strategy for my debts?' },
  { label: 'Lender demanding advance fee', prompt: 'A digital lender is asking me to pay ₦10,000 as "insurance card" upfront. Is this legitimate?' }
];

export const FinancialAdvisor: React.FC = () => {
  const { profile, debts } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello ${profile.fullName}! I am your **BorrowRight AI Advisor**.\n\nI can help you audit loan offers, evaluate your borrowing capacity (DTI), draft budgets, or map out payoff pathways for your current liabilities.\n\nWhat can I advise you on today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          userProfile: profile
        })
      });
      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed querying AI Advisor:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'model',
          text: '⚠️ I encountered a connection issue reaching the credit advisory network. Please check your internet connection or verify your GEMINI_API_KEY.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-financial-advisor-module" className="h-[calc(100vh-140px)] flex flex-col justify-between animate-fadeIn">
      {/* Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-emerald-500 fill-current animate-pulse" /> AI Financial Advisor
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Personalized digital lending coach and credit consultant.</p>
        </div>
        <div className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> SECURE CHAT
        </div>
      </div>

      {/* Message window */}
      <div className="flex-grow overflow-y-auto space-y-4 pr-2 scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-1">
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line border ${msg.role === 'user' ? 'bg-emerald-600 text-white border-emerald-600 rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800 rounded-tl-none shadow-xs font-medium'}`}>
                {msg.text}
              </div>
              <span className={`text-[10px] text-slate-400 block ${msg.role === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex-shrink-0 flex items-center justify-center text-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 font-semibold flex items-center gap-2">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-emerald-500 border-t-transparent" />
              BorrowRight Advisor is drafting professional recommendations...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Prompt templates rail */}
      <div className="flex-shrink-0 pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 space-y-3">
        {messages.length === 1 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Suggested Conversations</span>
            <div className="flex flex-wrap gap-2.5">
              {templates.map((temp, idx) => (
                <button
                  id={`chat-template-${idx}`}
                  key={idx}
                  onClick={() => handleSubmit(temp.prompt)}
                  className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 transition-all font-semibold shadow-2xs cursor-pointer text-left"
                >
                  {temp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input form */}
        <form
          id="advisor-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
          }}
          className="flex gap-2 relative"
        >
          <input
            id="advisor-chat-input"
            type="text"
            required
            disabled={loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl py-3 pl-4 pr-12 text-sm transition-all font-medium"
            placeholder="Type your debt or lending question here... e.g. How do I clear a ₦50,000 loan?"
          />
          <button
            id="advisor-send-btn"
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all cursor-pointer disabled:bg-slate-200 dark:disabled:bg-slate-850 disabled:text-slate-400"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Advisory disclaimer */}
        <div className="flex items-start gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-[10px] text-slate-400">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            Counsel from the AI Advisor represents structured logic, NOT binding financial agreements. Always perform thorough due diligence before signing any legally binding underwriting documents.
          </span>
        </div>
      </div>
    </div>
  );
};
