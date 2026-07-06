import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, X, BookOpen, Percent, ShieldCheck, Scale, AlertTriangle } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'General Advisory' | 'Interest & Costs' | 'Eligibility & Ratios' | 'Consumer Rights';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'General Advisory',
    question: 'Is BorrowRight AI a lender or financial institution?',
    answer: 'No, BorrowRight AI is strictly an independent, consumer-focused financial advisory platform. We do not provide loans, process credit transactions, or accept cash deposits. Our goal is to empower users with algorithmic assessments, financial education, and verify the legitimate licensing status of active credit agencies.'
  },
  {
    id: 'faq-2',
    category: 'General Advisory',
    question: 'Does searching for loans on this app affect my credit bureau score?',
    answer: 'Absolutely not. BorrowRight AI performs simulated "soft checks" using your self-declared income, employment, and active loan data to generate a credit health score. None of your activities on our platform are reported to official credit bureaus (like CRC or CreditRegistry), meaning your formal score remains completely untouched.'
  },
  {
    id: 'faq-3',
    category: 'Interest & Costs',
    question: 'What is the Annual Percentage Rate (APR) and why does it matter?',
    answer: 'The Annual Percentage Rate (APR) represents the true cost of borrowing on an annualized basis. While many mobile lenders advertise seemingly low "monthly" rates (e.g., 5% monthly), the APR compounds these rates and includes all administrative, processing, and insurance fees. A 5% flat monthly interest rate can easily compound to an APR exceeding 80% once administrative fees are factored in.'
  },
  {
    id: 'faq-4',
    category: 'Interest & Costs',
    question: 'Are weekly rollovers and late fees regulated in Nigeria?',
    answer: 'Yes. Under Central Bank of Nigeria (CBN) and FCCPC consumer protection regulations, credit institutions are prohibited from applying compounding, predatory interest rates or weekly rollovers that exceed strict caps. Furthermore, excessive penalty interest on late payments is a direct violation of regulatory fair lending guidelines.'
  },
  {
    id: 'faq-5',
    category: 'Eligibility & Ratios',
    question: 'What is the Debt-to-Income (DTI) ratio, and how is it calculated?',
    answer: 'Your Debt-to-Income (DTI) ratio is calculated by dividing your total monthly debt payments (including loans, credit cards, and active retail installments) by your total gross monthly income. For example, if you pay ₦150,000 monthly toward loans and earn ₦450,000, your DTI is 33.3%. Regulators and credit counselors recommend keeping your DTI under 33% to prevent high-risk debt traps.'
  },
  {
    id: 'faq-6',
    category: 'Eligibility & Ratios',
    question: 'How can I improve my financial credit health score?',
    answer: 'You can improve your score by maintaining a Debt-to-Income (DTI) ratio below 33%, prioritizing high-interest debts using the Debt Optimizer (e.g., Avalanche or Debt Snowball methods), avoiding multiple overlapping micro-loans from multiple platforms, and consistently paying off existing balances on time rather than requesting rollovers.'
  },
  {
    id: 'faq-7',
    category: 'Consumer Rights',
    question: 'How do I verify if a digital lender is legally licensed?',
    answer: 'All licensed banks, microfinance institutions, and digital lenders must possess valid certifications from either the Central Bank of Nigeria (CBN) or hold registration status with the FCCPC. You can easily query active lenders inside our "Compliance Hub" to verify their registered license status, contact emails, and business address before signing any contract.'
  },
  {
    id: 'faq-8',
    category: 'Consumer Rights',
    question: 'What should I do if a predatory loan app is harassing or shaming me?',
    answer: 'Do not comply with illegal extortion or shaming demands. First, collect screenshots, SMS logs, and email correspondence as evidence. Second, file an anonymous complaint through our "Compliance Hub - Report Scammer" module. Third, report the application directly to the FCCPC portal and block the app’s access to your phone contacts through your device settings.'
  }
];

export const FAQComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const [feedbackRecord, setFeedbackRecord] = useState<Record<string, 'yes' | 'no'>>({});

  const categories = ['All', 'General Advisory', 'Interest & Costs', 'Eligibility & Ratios', 'Consumer Rights'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General Advisory':
        return <BookOpen className="h-4 w-4 text-sky-500" />;
      case 'Interest & Costs':
        return <Percent className="h-4 w-4 text-emerald-500" />;
      case 'Eligibility & Ratios':
        return <Scale className="h-4 w-4 text-purple-500" />;
      case 'Consumer Rights':
        return <ShieldCheck className="h-4 w-4 text-rose-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const filteredFaqs = FAQ_DATA.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaqId(prev => (prev === id ? null : id));
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 rounded-[3px] px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div id="faq-interactive-module" className="space-y-5">
      {/* Search and Categories Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">BorrowRight Knowledge Directory</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Categorized consumer guidelines, loan mechanics, and legal rights</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400 h-4.5 w-4.5" />
          <input
            id="faq-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keyword (e.g. APR, DTI, shaming)..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold focus:border-emerald-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
          />
          {searchQuery && (
            <button
              id="clear-faq-search-btn"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Categories Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-50 dark:border-slate-850/65 pt-3">
          {categories.map((cat) => (
            <button
              id={`faq-cat-btn-${cat.toLowerCase().replace(' ', '-')}`}
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setExpandedFaqId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat !== 'All' && getCategoryIcon(cat)}
              <span>{cat === 'All' ? 'View All FAQs' : cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-2.5" id="faq-accordion-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div 
                id={`faq-item-row-${faq.id}`}
                key={faq.id} 
                className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded 
                    ? 'border-emerald-500/40 dark:border-emerald-500/30 shadow-xs' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <button
                  id={`faq-trigger-${faq.id}`}
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left py-3.5 px-4.5 flex justify-between items-center font-bold text-xs cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-all text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex-shrink-0">{getCategoryIcon(faq.category)}</span>
                    <span className="leading-relaxed">{highlightText(faq.question, searchQuery)}</span>
                  </span>
                  <span className="ml-4 flex-shrink-0 p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850">
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </span>
                </button>

                {/* FAQ Answer panel with conditional rendering and simple height wrapper */}
                {isExpanded && (
                  <div 
                    id={`faq-answer-panel-${faq.id}`}
                    className="py-3.5 px-4.5 bg-slate-50/70 dark:bg-slate-950/35 border-t border-slate-100 dark:border-slate-850 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold animate-fadeIn"
                  >
                    <p className="whitespace-pre-line">{highlightText(faq.answer, searchQuery)}</p>
                    <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
                      <span className="font-extrabold uppercase bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                        {faq.category}
                      </span>
                      <span>•</span>
                      {feedbackRecord[faq.id] ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold animate-pulse">
                          {feedbackRecord[faq.id] === 'yes' ? '✓ Thank you for your feedback!' : '✓ Feedback recorded! We will improve this answer.'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>Was this helpful?</span>
                          <button
                            id={`faq-feedback-yes-${faq.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeedbackRecord(prev => ({ ...prev, [faq.id]: 'yes' }));
                            }}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-extrabold"
                          >
                            Yes
                          </button>
                          <span>/</span>
                          <button
                            id={`faq-feedback-no-${faq.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeedbackRecord(prev => ({ ...prev, [faq.id]: 'no' }));
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline cursor-pointer font-extrabold"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3.5">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
            <div>
              <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400">No matching borrowing questions found</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto font-medium">
                Try a different keyword or reset categories to "View All FAQs".
              </p>
            </div>
            <button
              id="faq-reset-filter-btn"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 dark:text-emerald-400 rounded-xl text-[10px] font-bold border border-emerald-100/30 dark:border-emerald-950/40 cursor-pointer"
            >
              Reset Search Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
