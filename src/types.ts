/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  employmentStatus: 'Employed' | 'Self-Employed' | 'Unemployed' | 'Student';
  employer: string;
  occupation: string;
  monthlyIncome: number;
  incomeFrequency: 'Monthly' | 'Weekly' | 'Bi-Weekly' | 'Irregular';
  financialGoals: string[];
  bvn?: string;
  nin?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  dti: number; // Debt to Income %
  savingsRatio: number; // Savings %
  cashFlowScore: number; // Cash Flow Score
  emergencyFundScore: number; // Emergency Fund Score
  loanBurdenScore: number; // Loan Burden Score
  monthlyDisposableIncome: number;
  recommendations: string[];
  calculatedAt: string;
}

export interface EligibilityBoostTask {
  title: string;
  description: string;
  category: 'Identity' | 'Debt Ratio' | 'Income Proof' | 'Credit Record';
  impact: 'High' | 'Medium' | 'Low';
  points: number;
  actionLabel: string;
}

export interface LoanEligibility {
  income: number;
  employment: string;
  currentDebt: number;
  loanPurpose: string;
  desiredAmount: number;
  repaymentPeriod: number; // in months
  creditHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  approvalChance: number; // %
  suggestedAmount: number;
  suitableProducts: string[];
  requiredDocuments: string[];
  suggestedRepaymentPlan: string;
  aiExplanation: string;
  boostTasks?: EligibilityBoostTask[];
}

export interface Lender {
  id: string;
  name: string;
  type: 'Commercial Bank' | 'Microfinance Bank' | 'Finance Company' | 'Digital Lender';
  licenseNumber: string;
  regulator: 'CBN' | 'FCCPC' | 'SEC';
  rating: number; // 1-5
  ratingCount: number;
  website: string;
  contactEmail: string;
  contactPhone: string;
  complaintsProcess: string;
  consumerRights: string[];
  digitalOnly: boolean;
  approvalSpeed: 'Instant' | 'Under 24h' | '1-3 Days' | '3-7 Days';
  minIncomeRequired: number;
}

export interface LenderProduct {
  id: string;
  lenderId: string;
  lenderName: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minInterestRate: number; // Monthly %
  maxInterestRate: number; // Monthly %
  apr: number; // Annual Percentage Rate %
  processingFee: number; // % or fixed
  minTenor: number; // in months
  maxTenor: number; // in months
  collateralRequired: boolean;
  requirements: string[];
}

export interface Debt {
  id: string;
  lenderName: string;
  amount: number;
  interestRate: number; // Monthly %
  monthlyPayment: number;
  remainingTerm: number; // months
  nextDueDate: string;
  priority: number; // 1 (highest) to 5
}

export interface RepaymentPlanItem {
  month: number;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface ScamReport {
  id: string;
  lenderName: string;
  contactInfo: string;
  scamType: string;
  evidenceText: string;
  screenshotUrl?: string;
  status: 'Pending' | 'Verified Scam' | 'Safe' | 'Under Review';
  reportedAt: string;
  riskScore: number; // 0-100
  analysisReason: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  messages: Array<{
    sender: 'user' | 'support';
    text: string;
    timestamp: string;
  }>;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  aiPromptTemplate: string;
  maintenanceMode: boolean;
  allowSelfRegistration: boolean;
  minDisclaimersRequired: boolean;
}
