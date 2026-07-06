import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LenderProduct } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  Check, 
  Info, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  ArrowUpRight 
} from 'lucide-react';

export const LenderComparisonChart: React.FC = () => {
  const { products } = useApp();
  
  // Local state to keep track of checked products for the chart
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    products.map(p => p.id)
  );

  // Sync selectedProductIds when products load/update dynamically
  useEffect(() => {
    setSelectedProductIds(products.map(p => p.id));
  }, [products]);

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(id)) {
        // Prevent deselecting all so chart is never empty
        if (prev.length === 1) return prev;
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAll = () => {
    setSelectedProductIds(products.map(p => p.id));
  };

  const selectNone = () => {
    // Keep at least the first one selected
    if (products.length > 0) {
      setSelectedProductIds([products[0].id]);
    }
  };

  // Filter selected products for the chart data
  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

  // Build formatted chart data
  const chartData = selectedProducts.map(prod => {
    // Create compact short names for labels to prevent overlap on mobile/desktop
    const shortLenderName = prod.lenderName
      .replace(' Microfinance Bank', ' MFB')
      .replace(' PLC', '')
      .replace(' Finance Company', ' FC');

    return {
      id: prod.id,
      fullName: prod.lenderName,
      productName: prod.name,
      lender: shortLenderName,
      // For the bar chart: compare maximum monthly rate and annual APR
      monthlyRate: prod.maxInterestRate,
      minRate: prod.minInterestRate,
      apr: prod.apr,
      processingFee: prod.processingFee
    };
  });

  // Calculate some fun comparison metrics
  const lowestAprProduct = selectedProducts.reduce((lowest, current) => {
    return current.apr < lowest.apr ? current : lowest;
  }, selectedProducts[0] || products[0]);

  const lowestMonthlyProduct = selectedProducts.reduce((lowest, current) => {
    return current.maxInterestRate < lowest.maxInterestRate ? current : lowest;
  }, selectedProducts[0] || products[0]);

  return (
    <div 
      id="lender-comparison-chart-container" 
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Interest Rate & APR Visualizer
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Interactive
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Compare Monthly Rates vs. Annual APR percentages across verified CBN-regulated lenders
            </p>
          </div>
        </div>

        {/* Bulk select buttons */}
        <div className="flex gap-2">
          <button
            id="chart-select-all"
            type="button"
            onClick={selectAll}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-[10px] font-extrabold text-slate-600 dark:text-slate-350 border border-slate-100 dark:border-slate-850 rounded-lg cursor-pointer transition-colors"
          >
            Show All Lenders
          </button>
          <button
            id="chart-select-reset"
            type="button"
            onClick={selectNone}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-[10px] font-extrabold text-slate-400 dark:text-slate-550 border border-slate-100 dark:border-slate-850 rounded-lg cursor-pointer transition-colors"
          >
            Reset Selection
          </button>
        </div>
      </div>

      {/* Grid: Checkboxes on the left, Chart in the middle */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Checkbox Selector Column */}
        <div className="xl:col-span-3 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
            Select Lenders to Compare
          </span>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {products.map((prod) => {
              const isChecked = selectedProductIds.includes(prod.id);
              return (
                <button
                  id={`chart-toggle-prod-${prod.id}`}
                  key={prod.id}
                  type="button"
                  onClick={() => toggleProductSelection(prod.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isChecked 
                      ? 'bg-slate-50/70 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800' 
                      : 'bg-transparent border-slate-100/60 hover:bg-slate-50/30 dark:border-slate-850/40 dark:hover:bg-slate-950/10'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 truncate leading-snug">
                      {prod.lenderName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">
                      {prod.name}
                    </span>
                  </div>
                  <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition-all ${
                    isChecked 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                  }`}>
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Dual-Axis Recharts Bar Chart */}
        <div className="xl:col-span-9 space-y-4">
          <div className="h-[280px] w-full bg-slate-50/40 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-850/60 rounded-xl p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis 
                  dataKey="lender" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                {/* Left YAxis for Monthly Interest Rate (%) */}
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  domain={[0, 'dataMax + 2']}
                  tick={{ fill: '#10b981', fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                {/* Right YAxis for APR (%) */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 'dataMax + 10']}
                  tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 shadow-lg space-y-1.5 text-[10px]">
                          <p className="font-extrabold text-slate-800 dark:text-slate-100">{data.fullName}</p>
                          <p className="text-slate-400 font-bold">{data.productName}</p>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                          <div className="flex justify-between gap-6">
                            <span className="text-emerald-600 font-bold">Monthly Interest Rate:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">{data.minRate}% - {data.monthlyRate}%</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-blue-500 font-bold">Annual Percentage Rate (APR):</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">{data.apr}%</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-400 font-bold">Processing Fee:</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">
                              {data.processingFee > 0 ? `${data.processingFee}%` : 'Free'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={32}
                  iconType="circle"
                  formatter={(value) => {
                    const isMonthly = value === 'monthlyRate';
                    return (
                      <span className={`text-[10px] font-bold ${isMonthly ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500 dark:text-blue-400'} mx-2`}>
                        {isMonthly ? 'Max Monthly Rate (%)' : 'Annual APR (%)'}
                      </span>
                    );
                  }}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="monthlyRate" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={30}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="apr" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick analysis summary row */}
          {lowestAprProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card lowest monthly rate */}
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
                    Lowest Monthly Rate
                  </span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                    {lowestMonthlyProduct.lenderName}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    Interest rate starts at <strong className="text-emerald-600">{lowestMonthlyProduct.minInterestRate}%/month</strong>
                  </span>
                </div>
              </div>

              {/* Card lowest APR */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold uppercase text-blue-500 dark:text-blue-400 tracking-wider block">
                    Cheapest Annual APR
                  </span>
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                    {lowestAprProduct.lenderName}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    Annual percentage rate is only <strong className="text-blue-500">{lowestAprProduct.apr}% APR</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advisory Note */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/80 rounded-xl flex gap-3">
        <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Why is comparing Monthly Rates vs. APR critical?
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            Lenders often state <strong className="text-slate-600 dark:text-slate-300">monthly interest rates</strong> (e.g., 3%) to make loans appear cheap. However, when compounded annually and when adding initial processing or insurance fees, the true <strong className="text-slate-600 dark:text-slate-300">Annual Percentage Rate (APR)</strong> represents the total real cost of borrowing over a full year. The higher the APR, the more expensive the loan is in practice.
          </p>
        </div>
      </div>
    </div>
  );
};
