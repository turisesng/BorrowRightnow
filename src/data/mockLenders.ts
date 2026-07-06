/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lender, LenderProduct } from '../types';

export const mockLenders: Lender[] = [
  {
    id: 'lender-1',
    name: 'Access Bank PLC',
    type: 'Commercial Bank',
    licenseNumber: 'CBN/COM/002',
    regulator: 'CBN',
    rating: 4.5,
    ratingCount: 1420,
    website: 'https://www.accessbankplc.com',
    contactEmail: 'contactcenter@accessbankplc.com',
    contactPhone: '+234 1 271 2005',
    complaintsProcess: 'Log a formal complaint via email to complaints@accessbankplc.com or visit any physical branch. Responses are regulated by CBN to be resolved within 30 days.',
    consumerRights: [
      'Right to fair treatment and full disclosure of all interest rates and hidden fees.',
      'Right to protection of personal data under the NDPR.',
      'Right to seek redress from the Central Bank of Nigeria (CBN) consumer protection department.'
    ],
    digitalOnly: false,
    approvalSpeed: '3-7 Days',
    minIncomeRequired: 150000
  },
  {
    id: 'lender-2',
    name: 'Renmoney Microfinance Bank',
    type: 'Microfinance Bank',
    licenseNumber: 'CBN/MFB/2039',
    regulator: 'CBN',
    rating: 4.2,
    ratingCount: 890,
    website: 'https://www.renmoney.com',
    contactEmail: 'hello@renmoney.com',
    contactPhone: '+234 700 5000 500',
    complaintsProcess: 'Send an email to complaints@renmoney.com. Internal grievance mechanism responds within 3 working days.',
    consumerRights: [
      'Right to transparent interest rates (APR must be displayed).',
      'Right to be free from abusive recovery practices or public shaming.',
      'Right to cancel loan applications before disbursement.'
    ],
    digitalOnly: true,
    approvalSpeed: 'Under 24h',
    minIncomeRequired: 80000
  },
  {
    id: 'lender-3',
    name: 'FairMoney Microfinance Bank',
    type: 'Microfinance Bank',
    licenseNumber: 'CBN/MFB/0394',
    regulator: 'CBN',
    rating: 4.6,
    ratingCount: 3200,
    website: 'https://www.fairmoney.io',
    contactEmail: 'support@fairmoney.ng',
    contactPhone: '+234 1 700 1276',
    complaintsProcess: 'Submit support request via FairMoney App or email support@fairmoney.ng. Escalation path available to CBN consumer division.',
    consumerRights: [
      'Protection against predatory or compounding interest.',
      'Explicit consent required before accessing phone contact books (highly monitored by FCCPC).',
      'No hidden processing or administrative fees during repayment.'
    ],
    digitalOnly: true,
    approvalSpeed: 'Instant',
    minIncomeRequired: 30000
  },
  {
    id: 'lender-4',
    name: 'Carbon Microfinance Bank',
    type: 'Microfinance Bank',
    licenseNumber: 'CBN/MFB/0211',
    regulator: 'CBN',
    rating: 4.4,
    ratingCount: 2450,
    website: 'https://www.getcarbon.co',
    contactEmail: 'customer@getcarbon.co',
    contactPhone: '+234 1 460 0370',
    complaintsProcess: 'In-app support messaging system or formal written complaints via customer@getcarbon.co. Fast responses within 24 hours.',
    consumerRights: [
      'Clear statements of accounts sent monthly without charge.',
      'Right to early payoff without penalty or extra interest fees.',
      'Right to dispute inaccurate credit bureau reporting.'
    ],
    digitalOnly: true,
    approvalSpeed: 'Instant',
    minIncomeRequired: 40000
  },
  {
    id: 'lender-5',
    name: 'DLM Finance Company',
    type: 'Finance Company',
    licenseNumber: 'CBN/FC/0014',
    regulator: 'CBN',
    rating: 4.0,
    ratingCount: 150,
    website: 'https://dlm.group',
    contactEmail: 'info@dlm.group',
    contactPhone: '+234 1 277 8900',
    complaintsProcess: 'Contact complaints officer via complaints@dlm.group or CBN regulatory help desk.',
    consumerRights: [
      'Right to comprehensive loan offer sheets containing all terms.',
      'Protection from arbitrary interest rate reviews during the loan period.'
    ],
    digitalOnly: false,
    approvalSpeed: '1-3 Days',
    minIncomeRequired: 200000
  }
];

export const mockProducts: LenderProduct[] = [
  {
    id: 'prod-1',
    lenderId: 'lender-1',
    lenderName: 'Access Bank PLC',
    name: 'Access Bank Personal Loan',
    minAmount: 100000,
    maxAmount: 5000000,
    minInterestRate: 2.5, // Monthly %
    maxInterestRate: 3.5, // Monthly %
    apr: 36.0,
    processingFee: 1.0, // 1% processing fee
    minTenor: 6,
    maxTenor: 36,
    collateralRequired: false,
    requirements: [
      'Active Salary Account with Access Bank',
      'Letter of Employment',
      '3 Months Bank Statements',
      'Valid Government Issued ID (NIN/Driver License/Passport)',
      'Utility Bill of Residential Address'
    ]
  },
  {
    id: 'prod-2',
    lenderId: 'lender-2',
    lenderName: 'Renmoney Microfinance Bank',
    name: 'Renmoney Personal Cash Loan',
    minAmount: 50000,
    maxAmount: 4000000,
    minInterestRate: 3.8, // Monthly %
    maxInterestRate: 5.5, // Monthly %
    apr: 54.0,
    processingFee: 2.0,
    minTenor: 3,
    maxTenor: 24,
    collateralRequired: false,
    requirements: [
      'Steady salary or verifiable business income (minimum ₦80,000 monthly)',
      '6 Months Bank Statements',
      'Valid Government ID',
      'Employment Letter or Business Registration Documents'
    ]
  },
  {
    id: 'prod-3',
    lenderId: 'lender-3',
    lenderName: 'FairMoney Microfinance Bank',
    name: 'FairMoney Instant Loan',
    minAmount: 1500,
    maxAmount: 1000000,
    minInterestRate: 4.5, // Monthly %
    maxInterestRate: 8.0, // Monthly %
    apr: 72.0,
    processingFee: 0.0,
    minTenor: 1,
    maxTenor: 12,
    collateralRequired: false,
    requirements: [
      'Valid BVN & NIN for identity verification',
      'Active phone number and Bank account',
      'Permission to analyze automated SMS transactions (optional for credit sizing)'
    ]
  },
  {
    id: 'prod-4',
    lenderId: 'lender-4',
    lenderName: 'Carbon Microfinance Bank',
    name: 'Carbon Personal Loan',
    minAmount: 5000,
    maxAmount: 2000000,
    minInterestRate: 4.0, // Monthly %
    maxInterestRate: 7.5, // Monthly %
    apr: 65.0,
    processingFee: 0.0,
    minTenor: 1,
    maxTenor: 12,
    collateralRequired: false,
    requirements: [
      'Valid Bank Verification Number (BVN)',
      'Selfie for biometrics check',
      'Bank details and transaction statement history (via open banking integrations)'
    ]
  },
  {
    id: 'prod-5',
    lenderId: 'lender-5',
    lenderName: 'DLM Finance Company',
    name: 'DLM Business Expansion Loan',
    minAmount: 500000,
    maxAmount: 15000000,
    minInterestRate: 2.2, // Monthly %
    maxInterestRate: 3.0, // Monthly %
    apr: 28.0,
    processingFee: 1.5,
    minTenor: 12,
    maxTenor: 60,
    collateralRequired: true,
    requirements: [
      'Registered Business with CAC',
      'Verifiable business cashflow for past 12 months',
      'Acceptable collateral or directors personal guarantees',
      'Tax clearance certificates'
    ]
  }
];

export const mockKnowledgeBase = [
  {
    id: 'kb-1',
    title: 'How to Recognize and Avoid Fake Loan Apps (Scam Lenders)',
    category: 'Scam Awareness',
    summary: 'Learn the primary warning signs of unlicensed predatory loan apps, including advance fee demands, threatening recovery agents, and extreme interest rates.',
    content: `In recent years, many unauthorized digital lending applications have targeted borrowers. These predatory lenders operate without licenses from the Central Bank of Nigeria (CBN) or approval from the Federal Competition and Consumer Protection Commission (FCCPC).

### Warning Signs of Scam Lenders:
1. **Advance Fee Demands**: Real lenders NEVER ask you to pay an "activation fee", "insurance fee", or "bureau check fee" before transferring the loan. Any upfront payment is 100% a scam.
2. **Defamation and Threatening Recovery Tactics**: Unlicensed lenders often capture your phone's contact list and send abusive or defamatory messages to your family, friends, and colleagues if you are late by even 1 day.
3. **No BVN or Official Identity Verification**: Genuine licensed lenders verify your identity using BVN (Bank Verification Number) and NIN (National Identification Number). If an app doesn't require these or operates entirely via WhatsApp, be highly suspicious.
4. **Extreme High Interest and Short Terms**: Scam apps often offer loans with 50% interest rates and tenors of only 7 days (the "7-day loan trap"). CBN regulations mandate transparent terms and prohibit deceptive tenors.
5. **Missing Physical Addresses or Contact Information**: Scammer web portals and apps list generic gmail addresses instead of domain-owned support accounts and do not disclose actual physical office locations.`
  },
  {
    id: 'kb-2',
    title: 'Understanding Borrower Rights in Nigeria',
    category: 'Regulatory Rights',
    summary: 'A deep dive into CBN and FCCPC consumer protection regulations protecting you against aggressive collection, hidden fees, and data leaks.',
    content: `Every borrower in Nigeria is protected by laws enforced by the Central Bank of Nigeria (CBN) and the Federal Competition and Consumer Protection Commission (FCCPC). Knowing your rights keeps you safe from predatory lending.

### Your Core Borrower Rights:
* **Right to Clear Information**: Before you sign a loan agreement, the lender must provide a 'Key Terms Sheet' outlining the total cost of borrowing, interest rates, APR, late fee penalty schedules, and any processing charges.
* **Right to Privacy**: Lenders are strictly prohibited from harvesting your phone contacts, private photos, or call logs without explicit, informed consent. Defaming borrowers to third parties violates national data protection laws.
* **Right to Seek Redress**: If a lender treats you unfairly, you can log a complaint directly with the lender. If they fail to resolve it within the regulatory timeframe, you can escalate to the CBN Consumer Protection Department or the FCCPC.
* **No Compound Penalties**: Late interest penalties must not be compounded indefinitely. Regulations put limits on maximum penalty charges to avoid borrower insolvency traps.`
  },
  {
    id: 'kb-3',
    title: 'The Snowball vs. Avalanche Debt Payoff Strategies',
    category: 'Debt Management',
    summary: 'Analyze which structured debt payoff framework suits your psychological temperament and financial resources.',
    content: `If you have multiple loans, paying them off in a structured manner can save you thousands of Naira and speed up your journey to financial freedom. Two popular methods are the Debt Snowball and Debt Avalanche.

### 1. The Debt Snowball Method
The Debt Snowball focuses on psychological wins:
* **How it works**: List your debts in order of **smallest balance** to **largest balance**, regardless of the interest rate.
* **The process**: Pay the minimum due on all debts except the smallest. Put all excess funds toward completely wiping out the smallest debt. Once that is gone, roll its payment amount into the next smallest.
* **Why it works**: You get fast, encouraging "wins" as debts are completely erased. This builds major momentum.

### 2. The Debt Avalanche Method
The Debt Avalanche focuses on mathematical optimization:
* **How it works**: List your debts in order of **highest interest rate** to **lowest interest rate**, regardless of the balance.
* **The process**: Pay the minimum due on all debts except the one with the highest interest. Direct all excess cash to pay down the highest-rate debt first.
* **Why it works**: Mathematically, this minimizes the total interest you pay over time, saving you money.`
  }
];
