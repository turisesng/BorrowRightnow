/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Debt, ScamReport, SupportTicket, AuditLog, SystemSettings, FinancialHealthScore, Lender, LenderProduct } from '../types';
import { mockLenders, mockProducts } from '../data/mockLenders';
import {
  getSupabase,
  isSupabaseConfigured,
  fetchLenders,
  fetchProducts,
  fetchUserProfile,
  saveUserProfile,
  fetchUserDebts,
  saveUserDebt,
  deleteUserDebt,
  fetchScamReports,
  submitScamReport,
  updateScamReportStatus,
  fetchSupportTickets,
  createSupportTicket
} from '../lib/supabase';

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
  
  // Supabase states & operations
  supabaseUser: any | null;
  lenders: Lender[];
  products: LenderProduct[];
  isSupabaseSynced: boolean;
  isSupabaseConfigured: boolean;
  signUpWithSupabase: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithSupabase: (email: string, password: string) => Promise<{ error: any }>;
  signOutSupabase: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  signInWithEmailOtp: (email: string) => Promise<{ error: any }>;
  verifyOtpToken: (phoneOrEmail: string, token: string, type: 'sms' | 'email') => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<{ error: any }>;
  sendPasswordReset: (email: string) => Promise<{ error: any }>;
  updatePasswordWithSupabase: (password: string) => Promise<{ error: any }>;
}

const defaultProfile: UserProfile = {
  fullName: '',
  gender: 'Female',
  dateOfBirth: '',
  phone: '',
  email: '',
  state: '',
  city: '',
  employmentStatus: 'Employed',
  employer: '',
  occupation: '',
  monthlyIncome: 0,
  incomeFrequency: 'Monthly',
  financialGoals: [],
  bvn: '',
  nin: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  avatarUrl: ''
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
  // Supabase connection states
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [lenders, setLenders] = useState<Lender[]>(mockLenders);
  const [products, setProducts] = useState<LenderProduct[]>(mockProducts);
  const [isSupabaseSynced, setIsSupabaseSynced] = useState<boolean>(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(isSupabaseConfigured());

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
    'Welcome back! Check your revised Financial Health Score today.',
    'ALERT: 2 verified loan scams added to the directory. Beware of "NairaExpress".',
    'Your Carbon Microfinance loan payment of ₦27,500 is due in 23 days.'
  ]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Monitor Supabase Configuration changes
  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured());
  }, [(import.meta as any).env.VITE_SUPABASE_URL, (import.meta as any).env.VITE_SUPABASE_ANON_KEY]);

  // Fetch and Sync Lenders and Products (and setup real-time subscriptions)
  useEffect(() => {
    if (!supabaseConfigured) {
      setLenders(mockLenders);
      setProducts(mockProducts);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    const loadLendersAndProducts = async () => {
      try {
        let dbLenders = await fetchLenders();
        let dbProducts = await fetchProducts();

        // Automatically seed if empty! This ensures a beautiful experience.
        if (dbLenders.length === 0 && dbProducts.length === 0) {
          console.log('Database empty, seeding default lenders and products...');
          // Seed lenders
          const { error: lErr } = await supabase
            .from('lenders')
            .insert(mockLenders.map(l => ({
              id: l.id,
              name: l.name,
              type: l.type,
              license_number: l.licenseNumber,
              regulator: l.regulator,
              rating: l.rating,
              rating_count: l.ratingCount,
              website: l.website,
              contact_email: l.contactEmail,
              contact_phone: l.contactPhone,
              complaints_process: l.complaintsProcess,
              consumer_rights: l.consumerRights,
              digital_only: l.digitalOnly,
              approval_speed: l.approvalSpeed,
              min_income_required: l.minIncomeRequired
            })));

          if (lErr) {
            console.error('Error seeding lenders:', lErr);
          }

          // Seed products
          const { error: pErr } = await supabase
            .from('lender_products')
            .insert(mockProducts.map(p => ({
              id: p.id,
              lender_id: p.lenderId,
              name: p.name,
              min_amount: p.minAmount,
              max_amount: p.maxAmount,
              min_interest_rate: p.minInterestRate,
              max_interest_rate: p.maxInterestRate,
              apr: p.apr,
              processing_fee: p.processingFee,
              min_tenor: p.minTenor,
              max_tenor: p.maxTenor,
              collateral_required: p.collateralRequired,
              requirements: p.requirements
            })));

          if (pErr) {
            console.error('Error seeding products:', pErr);
          }

          dbLenders = await fetchLenders();
          dbProducts = await fetchProducts();
        }

        setLenders(dbLenders);
        setProducts(dbProducts);
      } catch (err) {
        console.error('Error loading lenders/products:', err);
      }
    };

    loadLendersAndProducts();

    // Subscribe to real-time changes
    const lendersChannel = supabase
      .channel('public:lenders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lenders' },
        async () => {
          console.log('Realtime update: lenders table changed.');
          const updatedLenders = await fetchLenders();
          setLenders(updatedLenders);
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel('public:lender_products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lender_products' },
        async () => {
          console.log('Realtime update: lender_products table changed.');
          const updatedProducts = await fetchProducts();
          setProducts(updatedProducts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lendersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [supabaseConfigured]);

  // Auth Listener
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseConfigured]);

  // Sync Supabase Data on authentication
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!supabaseUser) {
        setIsSupabaseSynced(false);
        return;
      }

      try {
        // 1. Fetch Profile
        const dbProfile = await fetchUserProfile(supabaseUser.id);
        if (dbProfile) {
          setProfileState(dbProfile);
        } else {
          // If profile doesn't exist in DB, create it with user's Auth metadata
          const meta = supabaseUser.user_metadata || {};
          const email = supabaseUser.email || meta.email || '';
          const fullName = meta.full_name || meta.name || email.split('@')[0] || 'BorrowRight User';
          const phone = supabaseUser.phone || '';
          
          const initialProfile: UserProfile = {
            fullName,
            gender: 'Male',
            dateOfBirth: '2000-01-01',
            phone,
            email,
            state: 'Lagos',
            city: 'Ikeja',
            employmentStatus: 'Employed',
            employer: '',
            occupation: '',
            monthlyIncome: 100000,
            incomeFrequency: 'Monthly',
            financialGoals: [],
            bvn: '',
            nin: '',
            emergencyContactName: '',
            emergencyContactPhone: ''
          };
          
          await saveUserProfile(supabaseUser.id, initialProfile);
          setProfileState(initialProfile);
        }

        // 2. Fetch Debts
        const dbDebts = await fetchUserDebts(supabaseUser.id);
        if (dbDebts && dbDebts.length > 0) {
          setDebtsState(dbDebts);
        }

        // 3. Fetch Support Tickets
        const dbTickets = await fetchSupportTickets(supabaseUser.id);
        if (dbTickets && dbTickets.length > 0) {
          setSupportTicketsState(dbTickets);
        }

        // 4. Fetch Lenders & Products
        // Handled by independent active syncing listener effect

        // 5. Fetch Scam Reports
        const dbScams = await fetchScamReports();
        if (dbScams && dbScams.length > 0) {
          setScamReportsState(dbScams);
        }

        setIsSupabaseSynced(true);
        addNotification('Connected to Supabase cloud! Data synchronized.');
      } catch (err) {
        console.error('Error syncing with Supabase:', err);
      }
    };

    loadSupabaseData();
  }, [supabaseUser]);

  useEffect(() => {
    if (!supabaseUser) {
      localStorage.setItem('br_profile', JSON.stringify(profile));
    }
  }, [profile, supabaseUser]);

  useEffect(() => {
    if (healthScore) {
      localStorage.setItem('br_health_score', JSON.stringify(healthScore));
    }
  }, [healthScore]);

  useEffect(() => {
    if (!supabaseUser) {
      localStorage.setItem('br_debts', JSON.stringify(debts));
    }
  }, [debts, supabaseUser]);

  useEffect(() => {
    if (!supabaseUser) {
      localStorage.setItem('br_scam_reports', JSON.stringify(scamReports));
    }
  }, [scamReports, supabaseUser]);

  useEffect(() => {
    if (!supabaseUser) {
      localStorage.setItem('br_support_tickets', JSON.stringify(supportTickets));
    }
  }, [supportTickets, supabaseUser]);

  useEffect(() => {
    localStorage.setItem('br_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const setProfile = async (newProfile: UserProfile) => {
    setProfileState(newProfile);
    addAuditLog(profile.email, 'UPDATE_PROFILE', 'Modified profile fields and financial goals.');
    
    if (supabaseUser) {
      await saveUserProfile(supabaseUser.id, newProfile);
    }
  };

  const setHealthScore = (score: FinancialHealthScore) => {
    setHealthScoreState(score);
    addAuditLog(profile.email, 'HEALTH_CALC', `Recalculated score: ${score.score}/100.`);
  };

  const setDebts = async (newDebts: Debt[]) => {
    const oldDebts = debts;
    setDebtsState(newDebts);
    addAuditLog(profile.email, 'DEBTS_SYNC', `Updated outstanding debts list (total ${newDebts.length}).`);

    if (supabaseUser) {
      try {
        // Find deleted debts
        const deleted = oldDebts.filter(od => !newDebts.some(nd => nd.id === od.id));
        for (const d of deleted) {
          await deleteUserDebt(d.id);
        }

        // Find added or updated debts
        const addedOrUpdated = newDebts.filter(nd => {
          const old = oldDebts.find(od => od.id === nd.id);
          return !old || JSON.stringify(old) !== JSON.stringify(nd);
        });

        for (const d of addedOrUpdated) {
          const saved = await saveUserDebt(supabaseUser.id, d);
          if (saved) {
            setDebtsState(prev => prev.map(item => item.id === d.id ? saved : item));
          }
        }
      } catch (e) {
        console.error('Error syncing debts with Supabase:', e);
      }
    }
  };

  const setScamReports = async (newReports: ScamReport[]) => {
    const oldReports = scamReports;
    setScamReportsState(newReports);

    if (supabaseUser) {
      try {
        // Find newly added reports
        const added = newReports.filter(nr => !oldReports.some(or => or.id === nr.id));
        for (const r of added) {
          const saved = await submitScamReport(r, supabaseUser.id);
          if (saved) {
            setScamReportsState(prev => prev.map(item => item.id === r.id ? saved : item));
          }
        }

        // Find updated reports (status or details changed)
        const updated = newReports.filter(nr => {
          const old = oldReports.find(or => or.id === nr.id);
          return old && (old.status !== nr.status || old.analysisReason !== nr.analysisReason);
        });

        for (const r of updated) {
          if (!r.id.startsWith('scam-')) {
            await updateScamReportStatus(r.id, r.status as any, r.analysisReason);
          }
        }
      } catch (e) {
        console.error('Error syncing scam reports with Supabase:', e);
      }
    }
  };

  const setSupportTickets = async (newTickets: SupportTicket[]) => {
    const oldTickets = supportTickets;
    setSupportTicketsState(newTickets);

    if (supabaseUser) {
      try {
        // Find newly added tickets
        const added = newTickets.filter(nt => !oldTickets.some(ot => ot.id === nt.id));
        for (const t of added) {
          const saved = await createSupportTicket(t, supabaseUser.id);
          if (saved) {
            setSupportTicketsState(prev => prev.map(item => item.id === t.id ? saved : item));
          }
        }

        // Find updated tickets
        const updated = newTickets.filter(nt => {
          const old = oldTickets.find(ot => ot.id === nt.id);
          return old && old.status !== nt.status;
        });

        for (const t of updated) {
          if (!t.id.startsWith('ticket-')) {
            const supabase = getSupabase();
            if (supabase) {
              await supabase.from('support_tickets').update({ status: t.status }).eq('id', t.id);
            }
          }
        }
      } catch (e) {
        console.error('Error syncing support tickets with Supabase:', e);
      }
    }
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

    // Save to Supabase if logged in
    const supabase = getSupabase();
    if (supabase && supabaseUser) {
      supabase.from('audit_logs').insert({
        actor_id: supabaseUser.id,
        actor_email: actorEmail,
        action,
        details,
        timestamp: newLog.timestamp
      }).then(({ error }) => {
        if (error) console.error('Error writing audit log to Supabase:', error);
      });
    }
  };

  const signUpWithSupabase = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) return { error };

    if (data.user) {
      const initialProfile: UserProfile = {
        ...profile,
        fullName,
        email,
      };
      await saveUserProfile(data.user.id, initialProfile);
      setProfileState(initialProfile);
      setSupabaseUser(data.user);
    }

    return { error: null };
  };

  const signInWithSupabase = async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      setSupabaseUser(data.user);
    }

    return { error: null };
  };

  const signOutSupabase = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSupabaseUser(null);
    setIsSupabaseSynced(false);
    setProfileState(defaultProfile);
    setDebtsState(defaultDebts);
    setScamReportsState(defaultScamReports);
    setSupportTicketsState(defaultSupportTickets);
    setLenders(mockLenders);
    setProducts(mockProducts);
    addNotification('Logged out from Supabase cloud session.');
  };

  const signInWithPhone = async (phone: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    return { error };
  };

  const signInWithEmailOtp = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  };

  const verifyOtpToken = async (phoneOrEmail: string, token: string, type: 'sms' | 'email') => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    
    const verifyParams: any = {
      token,
    };
    
    if (type === 'sms') {
      verifyParams.phone = phoneOrEmail;
      verifyParams.type = 'sms';
    } else {
      verifyParams.email = phoneOrEmail;
      verifyParams.type = 'magiclink';
    }

    let { data, error } = await supabase.auth.verifyOtp(verifyParams);
    
    if (error && type === 'email') {
      verifyParams.type = 'signup';
      const retry = await supabase.auth.verifyOtp(verifyParams);
      if (!retry.error) {
        data = retry.data;
        error = null;
      }
    }

    if (error) return { error };
    if (data.user) {
      setSupabaseUser(data.user);
    }
    return { error: null };
  };

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const sendPasswordReset = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error };
  };

  const updatePasswordWithSupabase = async (password: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase is not configured yet.' } };
    const { data, error } = await supabase.auth.updateUser({ password });
    return { error };
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
        toggleTheme,
        
        // Supabase values
        supabaseUser,
        lenders,
        products,
        isSupabaseSynced,
        isSupabaseConfigured: supabaseConfigured,
        signUpWithSupabase,
        signInWithSupabase,
        signOutSupabase,
        signInWithPhone,
        signInWithEmailOtp,
        verifyOtpToken,
        signInWithProvider,
        sendPasswordReset,
        updatePasswordWithSupabase
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

