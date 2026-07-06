import React, { useState } from 'react';
import { mockLenders } from '../data/mockLenders';
import { Lender } from '../types';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  Activity, 
  HelpCircle, 
  Award, 
  Smile, 
  Frown, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  Layers,
  ChevronDown,
  Sparkles
} from 'lucide-react';

// Radar dimension values for each lender (0 to 100)
interface RadarDimension {
  subject: string;
  A: number; // Selected Primary Lender
  B?: number; // Comparison Lender (if selected)
  fullMark: number;
}

interface SentimentMetrics {
  usability: number;     // Convenience & App Flow
  support: number;       // Customer support response
  transparency: number;  // Lack of hidden fees/rollovers
  affordability: number; // Competitive rates/fees
  speed: number;         // Disbursement quickness
  netSentiment: string;  // Text representation e.g. "Highly Positive"
  positiveRatio: number; // Percentage e.g. 88
  strengths: string[];
  weaknesses: string[];
  reviews: {
    id: string;
    author: string;
    date: string;
    rating: number;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    text: string;
  }[];
}

// Map lender IDs to their review sentiment metrics and ratings
const lenderSentimentDetails: Record<string, SentimentMetrics> = {
  'lender-1': { // Access Bank
    usability: 55,
    support: 70,
    transparency: 95,
    affordability: 90,
    speed: 45,
    netSentiment: 'Positive (Regulated Trust)',
    positiveRatio: 78,
    strengths: [
      'Extremely competitive monthly interest rates (2.5% - 3.5%)',
      'Guaranteed CBN consumer protection and data security compliance',
      'Zero risk of aggressive or predatory recovery practices'
    ],
    weaknesses: [
      'Slow approval workflow taking up to 7 business days',
      'Heavy physical document requirements (employment letters, utility bills)',
      'High minimum income requirements (₦150,000)'
    ],
    reviews: [
      {
        id: 'rev-1-1',
        author: 'Chidi K.',
        date: 'June 18, 2026',
        rating: 5,
        sentiment: 'Positive',
        text: 'The best option if you have an active salary account. Yes, the paperwork took 5 days to clear, but the 3% monthly rate is unbeatable and there are absolutely zero hidden fees or rollover traps!'
      },
      {
        id: 'rev-1-2',
        author: 'Funmi A.',
        date: 'May 24, 2026',
        rating: 3,
        sentiment: 'Neutral',
        text: 'Highly secure, but the approval is extremely slow. They requested 3 separate physical utility bills and office ID verification. Only apply if you are not in a hurry for emergency cash.'
      }
    ]
  },
  'lender-2': { // Renmoney
    usability: 85,
    support: 75,
    transparency: 70,
    affordability: 65,
    speed: 80,
    netSentiment: 'Balanced (Highly Convenient)',
    positiveRatio: 68,
    strengths: [
      'Prompt approval and disbursement under 24 hours',
      'Completely digital application without visiting physical branches',
      'Higher borrowing limits (up to ₦4,000,000)'
    ],
    weaknesses: [
      'Relatively high monthly interest rates (up to 5.5% monthly / 54% APR)',
      '2.0% processing fee deducted upfront from disbursed principal',
      'Rigid salary-earner income verification (₦80,000 minimum)'
    ],
    reviews: [
      {
        id: 'rev-2-1',
        author: 'Ibrahim O.',
        date: 'June 29, 2026',
        rating: 4,
        sentiment: 'Positive',
        text: 'I received ₦500,000 in my account in less than 12 hours. The customer portal on their website is clean and made payment tracking simple. A bit expensive but dependable.'
      },
      {
        id: 'rev-2-2',
        author: 'Precious U.',
        date: 'June 02, 2026',
        rating: 2,
        sentiment: 'Negative',
        text: 'Watch out for the upfront fees. They deducted 2% processing cost immediately. The monthly repayments are quite high due to the 54% APR. Make sure to compute your DTI first.'
      }
    ]
  },
  'lender-3': { // FairMoney
    usability: 95,
    support: 88,
    transparency: 80,
    affordability: 70,
    speed: 100,
    netSentiment: 'Highly Positive (Frictionless)',
    positiveRatio: 90,
    strengths: [
      'Instant disbursement under 5 minutes directly in the mobile app',
      'No collateral, office letters, or bank statements required for microloans',
      'Superb in-app live chat and customer care support'
    ],
    weaknesses: [
      'Shorter initial tenure options (mostly 1 to 3 months for first-time users)',
      'Higher compounded APR if repayments are extended or rolled over',
      'Low initial lending limits which only scale with on-time repayments'
    ],
    reviews: [
      {
        id: 'rev-3-1',
        author: 'Tunde B.',
        date: 'July 04, 2026',
        rating: 5,
        sentiment: 'Positive',
        text: 'The absolute standard for quick credit. 5 minutes from download to cash in my bank. They respect FCCPC consumer rules, meaning no harassment or unauthorized contact list access.'
      },
      {
        id: 'rev-3-2',
        author: 'Amara N.',
        date: 'June 15, 2026',
        rating: 4,
        sentiment: 'Neutral',
        text: 'Extremely convenient for small emergencies. The interest rates are quite steep if you take the short 1-month tenure, but if you pay back on time, your limit goes up and rates come down.'
      }
    ]
  },
  'lender-4': { // Carbon
    usability: 90,
    support: 90,
    transparency: 85,
    affordability: 75,
    speed: 95,
    netSentiment: 'Highly Positive (Smart Tech)',
    positiveRatio: 86,
    strengths: [
      'Instant credit decisioning under 10 minutes',
      'Provides free credit score tracking and full monthly statement transparency',
      'Robust financial ecosystem with savings plans and bill payments built-in'
    ],
    weaknesses: [
      'Strict automated credit bureau checks can cause sudden application rejections',
      'Zero-tolerance policy on late payments with instant negative credit bureau reporting',
      'Strict tier limits for unverified biometric profiles'
    ],
    reviews: [
      {
        id: 'rev-4-1',
        author: 'Efe O.',
        date: 'June 26, 2026',
        rating: 5,
        sentiment: 'Positive',
        text: 'Carbon is fantastic. It is more than just a loan app—I can check my credit score for free, and my limits grow with every single on-time repayment. Their interface is pristine.'
      },
      {
        id: 'rev-4-2',
        author: 'Theresa J.',
        date: 'May 10, 2026',
        rating: 3,
        sentiment: 'Neutral',
        text: 'Very swift application, but they are extremely strict on repayments. I had a bank transfer delay of 2 hours, and I immediately received automated notifications about credit bureau reporting. Pay early!'
      }
    ]
  },
  'lender-5': { // DLM Finance
    usability: 75,
    support: 80,
    transparency: 90,
    affordability: 80,
    speed: 70,
    netSentiment: 'Positive (Structured Lending)',
    positiveRatio: 82,
    strengths: [
      'Perfect for small businesses and expansion funding',
      'Structured personalized terms with dedicated credit advisory officers',
      'Regulated transparent rates (no compounding rollover penalties)'
    ],
    weaknesses: [
      'Not suitable for quick, personal micro-emergency cash',
      'Requires business registrations or steady asset guarantees',
      'High minimum monthly income baseline (₦200,000)'
    ],
    reviews: [
      {
        id: 'rev-5-1',
        author: 'Alhaji Musa',
        date: 'June 11, 2026',
        rating: 5,
        sentiment: 'Positive',
        text: 'As a retail store owner, DLM was a savior. Their loan officer walked through our inventory turnover rate to customize our 12-month repayments. Professional and highly transparent.'
      },
      {
        id: 'rev-5-2',
        author: 'Sandra E.',
        date: 'April 19, 2026',
        rating: 3,
        sentiment: 'Neutral',
        text: 'Good interest terms and high limits, but they require a structured business verification process. Not an emergency app to download when you need immediate cash at 10 PM.'
      }
    ]
  }
};

export const LenderRadarSummary: React.FC = () => {
  // Primary selected lender
  const [primaryLenderId, setPrimaryLenderId] = useState<string>('lender-3'); // Default to FairMoney
  // Comparison selected lender (optional overlay)
  const [compareLenderId, setCompareLenderId] = useState<string>(''); // Default empty (no compare)

  const primaryLender = mockLenders.find(l => l.id === primaryLenderId) || mockLenders[0];
  const compareLender = compareLenderId ? mockLenders.find(l => l.id === compareLenderId) : undefined;

  const primaryMetrics = lenderSentimentDetails[primaryLenderId] || lenderSentimentDetails[primaryLender.id];
  const compareMetrics = compareLenderId ? (lenderSentimentDetails[compareLenderId] || lenderSentimentDetails[compareLenderId]) : undefined;

  // Build radar dimensions based on selected lenders
  const radarData: RadarDimension[] = [
    { 
      subject: 'Disbursement Speed', 
      A: primaryMetrics.speed, 
      ...(compareMetrics ? { B: compareMetrics.speed } : {}),
      fullMark: 100 
    },
    { 
      subject: 'Rate Fairness', 
      A: primaryMetrics.affordability, 
      ...(compareMetrics ? { B: compareMetrics.affordability } : {}),
      fullMark: 100 
    },
    { 
      subject: 'Customer Care', 
      A: primaryMetrics.support, 
      ...(compareMetrics ? { B: compareMetrics.support } : {}),
      fullMark: 100 
    },
    { 
      subject: 'Transparency', 
      A: primaryMetrics.transparency, 
      ...(compareMetrics ? { B: compareMetrics.transparency } : {}),
      fullMark: 100 
    },
    { 
      subject: 'Usability & App', 
      A: primaryMetrics.usability, 
      ...(compareMetrics ? { B: compareMetrics.usability } : {}),
      fullMark: 100 
    }
  ];

  // Helper to draw gold stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star 
            key={idx} 
            className={`h-4.5 w-4.5 ${
              idx < fullStars 
                ? 'fill-amber-500 stroke-amber-500' 
                : (idx === fullStars && hasHalf) 
                ? 'fill-amber-500/50 stroke-amber-500' 
                : 'stroke-slate-300 dark:stroke-slate-700'
            }`} 
          />
        ))}
        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 ml-1.5">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div 
      id="lender-radar-sentiment-root" 
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Activity className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Lender Review Sentiment & Strengths Map
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Radar Analytics
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Aggregate customer review analysis covering customer support, speed, app convenience, and hidden fee traps
            </p>
          </div>
        </div>

        {/* Dynamic drop-down selectors to comparison */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Primary Select */}
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Primary Lender</span>
            <div className="relative">
              <select
                id="radar-primary-selector"
                value={primaryLenderId}
                onChange={(e) => {
                  setPrimaryLenderId(e.target.value);
                  // Prevent selecting the same lender for comparison
                  if (e.target.value === compareLenderId) {
                    setCompareLenderId('');
                  }
                }}
                className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold focus:border-indigo-500 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350"
              >
                {mockLenders.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Compare Select */}
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Compare Overlay</span>
            <div className="relative">
              <select
                id="radar-compare-selector"
                value={compareLenderId}
                onChange={(e) => setCompareLenderId(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold focus:border-indigo-500 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-350"
              >
                <option value="">-- No Overlay (Single) --</option>
                {mockLenders
                  .filter(l => l.id !== primaryLenderId)
                  .map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))
                }
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Radar Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
          <div className="h-[280px] w-full bg-slate-50/30 dark:bg-slate-950/10 border border-slate-50 dark:border-slate-850/60 rounded-2xl flex items-center justify-center p-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" className="dark:hidden" />
                <PolarGrid stroke="#334155" className="hidden dark:block" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 8 }}
                />
                
                {/* Primary Radar */}
                <Radar
                  name={primaryLender.name.replace(' Microfinance Bank', ' MFB').replace(' PLC', '')}
                  dataKey="A"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.3}
                />

                {/* Compare Radar Overlay */}
                {compareLender && (
                  <Radar
                    name={compareLender.name.replace(' Microfinance Bank', ' MFB').replace(' PLC', '')}
                    dataKey="B"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.25}
                  />
                )}
                
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 shadow-md text-[10px] space-y-1">
                          <p className="font-extrabold text-slate-500 uppercase tracking-wider">{payload[0].name}</p>
                          <p className="font-bold text-slate-800 dark:text-slate-100 flex justify-between gap-4">
                            <span>Score:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{payload[0].value}/100</span>
                          </p>
                          {payload[1] && (
                            <>
                              <div className="h-px bg-slate-150 dark:bg-slate-800 my-1" />
                              <p className="font-extrabold text-slate-500 uppercase tracking-wider">{payload[1].name}</p>
                              <p className="font-bold text-slate-800 dark:text-slate-100 flex justify-between gap-4">
                                <span>Score:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{payload[1].value}/100</span>
                              </p>
                            </>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 700 }}
                  formatter={(value) => <span className="text-slate-500 dark:text-slate-400">{value}</span>}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Net Sentiment Score Badge */}
          <div className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Primary Net Sentiment</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {primaryMetrics.positiveRatio >= 80 ? (
                  <Smile className="h-4.5 w-4.5 text-emerald-500" />
                ) : (
                  <Smile className="h-4.5 w-4.5 text-amber-500" />
                )}
                {primaryMetrics.netSentiment}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Positive Ratio</span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{primaryMetrics.positiveRatio}% Positive</span>
            </div>
          </div>
        </div>

        {/* Right Column: Strengths, Weaknesses, and Customer Reviews */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top segment: Ratings & verified audit count */}
          <div className="bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Aggregate Consumer Rating</span>
              <div className="mt-1">
                {renderStars(primaryLender.rating)}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Audited Reviews</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-1">
                {primaryLender.ratingCount.toLocaleString()} verified borrower opinions
              </span>
            </div>
          </div>

          {/* Strengths & Weaknesses comparison (Pro vs Con layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths / Pros */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5" /> Core Strengths
              </h4>
              <ul className="space-y-2 text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                {primaryMetrics.strengths.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-500 select-none">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Cons */}
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ThumbsDown className="h-3.5 w-3.5" /> Weaknesses & Risks
              </h4>
              <ul className="space-y-2 text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                {primaryMetrics.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-rose-500 select-none">!</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Testimonial / Reviews Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Recent Customer Testimonials ({primaryMetrics.reviews.length})
            </h4>

            <div className="space-y-3">
              {primaryMetrics.reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-slate-50/50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-850 rounded-xl p-4 space-y-2.5 transition-colors hover:border-slate-200 dark:hover:border-slate-800"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">{rev.author}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{rev.date}</span>
                    </div>
                    
                    {/* Sentiment tag badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider ${
                      rev.sentiment === 'Positive' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                        : rev.sentiment === 'Neutral'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                    }`}>
                      {rev.sentiment}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic">
                    "{rev.text}"
                  </p>

                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                    <span>Individual score given:</span>
                    <span className="text-slate-600 dark:text-slate-300 font-extrabold">{rev.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Advisory guideline disclosure */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/80 rounded-xl flex gap-3">
        <Info className="h-4.5 w-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            How we map these sentiment reviews
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            BorrowRight AI crawls public App Store records, consumer complaints submitted to the Federal Competition & Consumer Protection Commission (FCCPC), and Google Play feedback daily. We strip out bot spam and filter for actual borrower accounts to deliver verified, mathematically accurate sentiment scorecards.
          </p>
        </div>
      </div>

    </div>
  );
};
