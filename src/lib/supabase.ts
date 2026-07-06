/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Debt, ScamReport, SupportTicket, Lender, LenderProduct, FinancialHealthScore } from '../types';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Safely retrieves the Supabase client instance.
 * Returns null if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are not configured.
 */
export function getSupabase(): SupabaseClient | null {
  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

/**
 * Checks if Supabase has been configured with valid credentials in settings.
 */
export const isSupabaseConfigured = (): boolean => {
  return getSupabase() !== null;
};

// =========================================================================
// DATA TRANSLATION MAPPERS (camelCase <-> snake_case)
// =========================================================================

export const mapProfileToDB = (profile: UserProfile, userId: string) => {
  return {
    id: userId,
    full_name: profile.fullName,
    gender: profile.gender || null,
    date_of_birth: profile.dateOfBirth || null,
    phone: profile.phone || null,
    email: profile.email,
    state: profile.state || null,
    city: profile.city || null,
    employment_status: profile.employmentStatus,
    employer: profile.employer || null,
    occupation: profile.occupation || null,
    monthly_income: profile.monthlyIncome,
    income_frequency: profile.incomeFrequency,
    financial_goals: profile.financialGoals || [],
    bvn: profile.bvn || null,
    nin: profile.nin || null,
    emergency_contact_name: profile.emergencyContactName || null,
    emergency_contact_phone: profile.emergencyContactPhone || null,
    avatar_url: profile.avatarUrl || null,
  };
};

export const mapProfileFromDB = (data: any): UserProfile => {
  return {
    fullName: data.full_name || '',
    gender: data.gender || '',
    dateOfBirth: data.date_of_birth || '',
    phone: data.phone || '',
    email: data.email || '',
    state: data.state || '',
    city: data.city || '',
    employmentStatus: data.employment_status || 'Employed',
    employer: data.employer || '',
    occupation: data.occupation || '',
    monthlyIncome: Number(data.monthly_income) || 0,
    incomeFrequency: data.income_frequency || 'Monthly',
    financialGoals: data.financial_goals || [],
    bvn: data.bvn || '',
    nin: data.nin || '',
    emergencyContactName: data.emergency_contact_name || '',
    emergencyContactPhone: data.emergency_contact_phone || '',
    avatarUrl: data.avatar_url || '',
  };
};

export const mapDebtToDB = (debt: Debt, userId: string) => {
  return {
    user_id: userId,
    lender_name: debt.lenderName,
    amount: debt.amount,
    interest_rate: debt.interestRate,
    monthly_payment: debt.monthlyPayment,
    remaining_term: debt.remainingTerm,
    next_due_date: debt.nextDueDate || null,
    priority: debt.priority || 3,
  };
};

export const mapDebtFromDB = (data: any): Debt => {
  return {
    id: data.id,
    lenderName: data.lender_name,
    amount: Number(data.amount),
    interestRate: Number(data.interest_rate),
    monthlyPayment: Number(data.monthly_payment),
    remainingTerm: Number(data.remaining_term),
    nextDueDate: data.next_due_date || '',
    priority: data.priority || 3,
  };
};

export const mapScamReportToDB = (report: ScamReport, userId?: string) => {
  return {
    user_id: userId || null,
    lender_name: report.lenderName,
    contact_info: report.contactInfo,
    scam_type: report.scamType,
    evidence_text: report.evidenceText,
    screenshot_url: report.screenshotUrl || null,
    status: report.status,
    risk_score: report.riskScore,
    analysis_reason: report.analysisReason || '',
  };
};

export const mapScamReportFromDB = (data: any): ScamReport => {
  return {
    id: data.id,
    lenderName: data.lender_name,
    contactInfo: data.contact_info || '',
    scamType: data.scam_type,
    evidenceText: data.evidence_text || '',
    screenshotUrl: data.screenshot_url || '',
    status: data.status,
    reportedAt: data.reported_at,
    riskScore: data.risk_score || 0,
    analysisReason: data.analysis_reason || '',
  };
};

export const mapSupportTicketToDB = (ticket: SupportTicket, userId: string) => {
  return {
    user_id: userId,
    subject: ticket.subject,
    category: ticket.category,
    description: ticket.description,
    status: ticket.status,
  };
};

export const mapSupportTicketFromDB = (data: any): SupportTicket => {
  return {
    id: data.id,
    subject: data.subject,
    category: data.category,
    description: data.description,
    status: data.status,
    createdAt: data.created_at,
    messages: data.messages || [],
  };
};

export const mapLenderFromDB = (data: any): Lender => {
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    licenseNumber: data.license_number,
    regulator: data.regulator,
    rating: Number(data.rating) || 0,
    ratingCount: data.rating_count || 0,
    website: data.website || '',
    contactEmail: data.contact_email || '',
    contactPhone: data.contact_phone || '',
    complaintsProcess: data.complaints_process || '',
    consumerRights: data.consumer_rights || [],
    digitalOnly: data.digital_only || false,
    approvalSpeed: data.approval_speed || 'Instant',
    minIncomeRequired: Number(data.min_income_required) || 0,
  };
};

export const mapProductFromDB = (data: any): LenderProduct => {
  return {
    id: data.id,
    lenderId: data.lender_id,
    lenderName: data.lenders?.name || 'Licensed Lender',
    name: data.name,
    minAmount: Number(data.min_amount),
    maxAmount: Number(data.max_amount),
    minInterestRate: Number(data.min_interest_rate),
    maxInterestRate: Number(data.max_interest_rate),
    apr: Number(data.apr),
    processingFee: Number(data.processing_fee) || 0,
    minTenor: Number(data.min_tenor),
    maxTenor: Number(data.max_tenor),
    collateralRequired: data.collateral_required || false,
    requirements: data.requirements || [],
  };
};

// =========================================================================
// DATABASE OPERATIONS
// =========================================================================

export async function fetchLenders(): Promise<Lender[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('lenders')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching lenders from Supabase:', error);
    return [];
  }

  return (data || []).map(mapLenderFromDB);
}

export async function fetchProducts(): Promise<LenderProduct[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('lender_products')
    .select('*, lenders ( name )')
    .order('name');

  if (error) {
    console.error('Error fetching products from Supabase:', error);
    return [];
  }

  return (data || []).map(mapProductFromDB);
}

export async function fetchUserDebts(userId: string): Promise<Debt[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: true });

  if (error) {
    console.error('Error fetching user debts:', error);
    return [];
  }

  return (data || []).map(mapDebtFromDB);
}

export async function saveUserDebt(userId: string, debt: Debt): Promise<Debt | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const dbDebt = mapDebtToDB(debt, userId);

  if (debt.id && !debt.id.startsWith('debt-')) {
    // Existing DB record
    const { data, error } = await supabase
      .from('debts')
      .update(dbDebt)
      .eq('id', debt.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating debt:', error);
      return null;
    }
    return mapDebtFromDB(data);
  } else {
    // New record or unsaved locally created debt
    const { data, error } = await supabase
      .from('debts')
      .insert(dbDebt)
      .select()
      .single();

    if (error) {
      console.error('Error inserting debt:', error);
      return null;
    }
    return mapDebtFromDB(data);
  }
}

export async function deleteUserDebt(debtId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || debtId.startsWith('debt-')) return true;

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', debtId);

  if (error) {
    console.error('Error deleting debt:', error);
    return false;
  }
  return true;
}

export async function fetchScamReports(): Promise<ScamReport[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('scam_reports')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching scam reports:', error);
    return [];
  }

  return (data || []).map(mapScamReportFromDB);
}

export async function submitScamReport(report: ScamReport, userId?: string): Promise<ScamReport | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const dbReport = mapScamReportToDB(report, userId);

  const { data, error } = await supabase
    .from('scam_reports')
    .insert(dbReport)
    .select()
    .single();

  if (error) {
    console.error('Error submitting scam report:', error);
    return null;
  }
  return mapScamReportFromDB(data);
}

export async function updateScamReportStatus(id: string, status: 'Verified Scam' | 'Safe' | 'Under Review', reason?: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('scam_reports')
    .update({ status, analysis_reason: reason })
    .eq('id', id);

  if (error) {
    console.error('Error updating scam report status:', error);
    return false;
  }
  return true;
}

export async function fetchSupportTickets(userId: string): Promise<SupportTicket[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching support tickets:', error);
    return [];
  }

  return (data || []).map(mapSupportTicketFromDB);
}

export async function createSupportTicket(ticket: SupportTicket, userId: string): Promise<SupportTicket | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const dbTicket = mapSupportTicketToDB(ticket, userId);

  const { data, error } = await supabase
    .from('support_tickets')
    .insert(dbTicket)
    .select()
    .single();

  if (error) {
    console.error('Error creating support ticket:', error);
    return null;
  }
  return mapSupportTicketFromDB(data);
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return mapProfileFromDB(data);
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const dbProfile = mapProfileToDB(profile, userId);

  const { error } = await supabase
    .from('profiles')
    .upsert(dbProfile);

  if (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
  return true;
}
