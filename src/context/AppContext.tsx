/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Debt, ScamReport, SupportTicket, AuditLog, SystemSettings, FinancialHealthScore } from '../types';

interface AppContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  healthScore: FinancialHealthScore | null;
  setHealthScore: (score: FinancialHealthScore) => void;
  debts: Debt[];
  setDebts: (debts: Debt[]) => void;
  scamReports: ScamReport[];
  setScamReports: (reports: ScamReport[]) => void;
  supportTickets: SupportTicket[];
  setSupportTickets: (tickets: SupportTicket[]) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;
  systemSettings: SystemSettings;
  setSystemSettings: (settings: SystemSettings) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: string[];
  addNotification: (msg: string) => void;
  clearNotifications: () => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const defaultProfile: UserProfile = {
  fullName: 'Debbie Ijogbonna',
  gender: 'Female',
  dateOfBirth: '1998-04-12',
  phone: '+234 812 345 6789',
  email: 'ijogbonnadebbie@gmail.com',
  state: 'Lagos',
  city: 'Ikeja',
  employmentStatus: 'Employed',
  employer: 'Interswitch Group',
  occupation: 'Senior Software QA',
  monthlyIncome: 350000,
  incomeFrequency: 'Monthly',
  financialGoals: ['Pay off personal debts', 'Acquire SME business loan', 'Establish 3-Month Emergency Fund'],
  bvn: '222******34',
  nin: '483******91',
  emergencyContactName: 'Bose Ijogbonna',
  emergencyContactPhone: '+234 803 987 6543'
};

const defaultDebts: Debt[] = [
  {
    id: 'debt-1',
    lenderName: 'SupaCredit App (Unlicensed)',
    amount: 120000,
    interestRate: 15.0, // 15% monthly!
    monthlyPayment: 32000,
    remainingTerm: 5,
    nextDueDate: '2026-07-15',
    priority: 1
  },
  {
    id: 'debt-2',
    lenderName: 'Carbon Microfinance Bank',
    amount: 250000,
    interestRate: 4.5,
    monthlyPayment: 27500,
    remainingTerm: 11,
    nextDueDate: '2026-07-28',
    priority: 3
  }
];

const defaultScamReports: ScamReport[] = [
  {
    id: 'scam-1',
    lenderName: 'NairaExpress Mobile',
    contactInfo: 'WhatsApp +234 901 223 9982',
    scamType: 'Abusive Recovery Shaming',
    evidenceText: 'Threatened to broadcast my picture to all my contacts labeling me a thief, just 6 hours after due date.',
    status: 'Verified Scam',
    reportedAt: '2026-07-02T10:30:00Z',
    riskScore: 98,
    analysisReason: 'Clear regulatory violation of FCCPC consumer shaming guidelines, harvesting personal contact lists, and aggressive, threatening recovery communications.'
  },
  {
    id: 'scam-2',
    lenderName: 'QuickCash Advance Hub',
    contactInfo: 'email: quickcashactivation@gmail.com',
    scamType: 'Advance Fee Fraud',
    evidenceText: 'Asked me to pay ₦5,000 "card validation fee" before releasing the ₦50,000 loan approved for me.',
    status: 'Verified Scam',
    reportedAt: '2026-07-04T15:45:00Z',
    riskScore: 95,
    analysisReason: 'Demanding upfront processing or activation fees is a signature marker of credit fraud. Real licensed financial companies deduct processing fees from the principal upon disbursement.'
  }
];

const defaultSupportTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    subject: 'Report on abusive lender harassment',
    category: 'Regulatory Redress',
    description: 'An unlicensed app called SupaCredit is calling my contacts. I need assistance escalations to FCCPC.',
    status: 'In Progress',
    createdAt: '2026-07-04T09:00:00Z',
    messages: [
      { sender: 'user', text: 'I need guidance on blocking their threats.', timestamp: '2026-07-04T09:00:00Z' },
      { sender: 'support', text: 'Hello Debbie, we are drafting a formal FCCPC report template for you. Please check our Borrowers Rights guide in the Compliance Hub and do not send them any further payments.', timestamp: '2026-07-04T11:20:00Z' }
    ]
  }
];

const defaultAuditLogs: AuditLog[] = [
  { id: 'log-1', adminEmail: 'system@borrowright.ai', action: 'SYSTEM_BOOT', details: 'Lenders database populated with CBN/FCCPC compliance directories.', timestamp: '2026-07-05T00:00:00Z' },
  { id: 'log-2', adminEmail: 'admin@borrowright.ai', action: 'PROMPT_UPDATE', details: 'Refined Gemini advisor system instructions to include DTI thresholds.', timestamp: '2026-07-05T08:15:00Z' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('br_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [healthScore, setHealthScoreState] = useState<FinancialHealthScore | null>(() => {
    const saved = localStorage.getItem('br_health_score');
    return saved ? JSON.parse(saved) : null;
  });

  const [debts, setDebtsState] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('br_debts');
    return saved ? JSON.parse(saved) : defaultDebts;
  });

  const [scamReports, setScamReportsState] = useState<ScamReport[]>(() => {
    const saved = localStorage.getItem('br_scam_reports');
    return saved ? JSON.parse(saved) : defaultScamReports;
  });

  const [supportTickets, setSupportTicketsState] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('br_support_tickets');
    return saved ? JSON.parse(saved) : defaultSupportTickets;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('br_audit_logs');
    return saved ? JSON.parse(saved) : defaultAuditLogs;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    aiPromptTemplate: 'You are BorrowRight AI, an elite credit underwriter advising borrowers in Nigeria...',
    maintenanceMode: false,
    allowSelfRegistration: true,
    minDisclaimersRequired: true
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<string[]>([
    'Welcome back Debbie! Check your revised Financial Health Score today.',
    'ALERT: 2 verified loan scams added to the directory. Beware of "NairaExpress".',
    'Your Carbon Microfinance loan payment of ₦27,500 is due in 23 days.'
  ]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    localStorage.setItem('br_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (healthScore) {
      localStorage.setItem('br_health_score', JSON.stringify(healthScore));
    }
  }, [healthScore]);

  useEffect(() => {
    localStorage.setItem('br_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('br_scam_reports', JSON.stringify(scamReports));
  }, [scamReports]);

  useEffect(() => {
    localStorage.setItem('br_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('br_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    addAuditLog(profile.email, 'UPDATE_PROFILE', 'Modified profile fields and financial goals.');
  };

  const setHealthScore = (score: FinancialHealthScore) => {
    setHealthScoreState(score);
    addAuditLog(profile.email, 'HEALTH_CALC', `Recalculated score: ${score.score}/100.`);
  };

  const setDebts = (newDebts: Debt[]) => {
    setDebtsState(newDebts);
    addAuditLog(profile.email, 'DEBTS_SYNC', `Updated outstanding debts list (total ${newDebts.length}).`);
  };

  const setScamReports = (newReports: ScamReport[]) => {
    setScamReportsState(newReports);
  };

  const setSupportTickets = (newTickets: SupportTicket[]) => {
    setSupportTicketsState(newTickets);
  };

  const addAuditLog = (actorEmail: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminEmail: actorEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        healthScore,
        setHealthScore,
        debts,
        setDebts,
        scamReports,
        setScamReports,
        supportTickets,
        setSupportTickets,
        auditLogs,
        addAuditLog,
        systemSettings,
        setSystemSettings,
        activeTab,
        setActiveTab,
        notifications,
        addNotification,
        clearNotifications,
        isAdmin,
        setIsAdmin,
        theme,
        toggleTheme
      }}
    >
      <div className={theme === 'dark' ? 'dark bg-slate-950 text-slate-100 min-h-screen' : 'bg-slate-50 text-slate-900 min-h-screen'}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
