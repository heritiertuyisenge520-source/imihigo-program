
import React from 'react';
import { Indicator, QuarterlyData } from '../types';
import { getStatusColor, getCurrentQuarter } from '../constants';

interface IndicatorCardProps {
  indicator: Indicator;
  onUpdate: (indicatorId: string, quarter: number, achievement: number) => void;
  isFillMode?: boolean;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, onUpdate, isFillMode = false }) => {
  const activeQuarter = getCurrentQuarter();

  const calculateQuarterProgress = (q: number) => {
    const data = indicator.quarters[q as 1 | 2 | 3 | 4];
    if (data.target === 0) return 0;
    return (data.achievement / data.target) * 100;
  };

  const calculateAnnualProgress = () => {
    const totalAchieved = (Object.values(indicator.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0);
    if (indicator.annualTarget === 0) return 0;
    return (totalAchieved / indicator.annualTarget) * 100;
  };

  const annualPercentage = calculateAnnualProgress();

  return (
    <div className={`bg-white rounded-xl border ${isFillMode ? 'border-indigo-200 ring-1 ring-indigo-50 shadow-md' : 'border-slate-200 shadow-sm'} transition-all p-5 overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <div className="max-w-[75%]">
          <h4 className="font-bold text-slate-800 leading-tight text-lg">{indicator.name}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <p className="text-xs text-slate-500">Source: <span className="font-medium text-slate-700">{indicator.sourceOfData}</span></p>
            <p className="text-xs text-slate-500">Baseline: <span claessName="font-medium text-slate-700">{indicator.baseline}</span></p>
            <p className="text-xs text-indigo-500 font-bold uppercase tracking-tighter">Annual Target: {indicator.annualTarget}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(annualPercentage)}`}>
          {annualPercentage.toFixed(1)}% Annual
        </div>
      </div>

      <div className={`grid ${isFillMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 xs:grid-cols-2 sm:grid-cols-4'} gap-2 md:gap-3 mb-6`}>
        {[1, 2, 3, 4].map(q => {
          const isEditable = isFillMode || q === activeQuarter;
          const qProgress = calculateQuarterProgress(q);
          const qStatus = getStatusColor(qProgress);

          return (
            <div
              key={q}
              className={`p-4 rounded-xl border transition-all ${isEditable ? 'bg-indigo-50 border-indigo-200 scale-[1.01]' : 'bg-slate-50 border-slate-100 opacity-60'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black uppercase tracking-widest ${isEditable ? 'text-indigo-600' : 'text-slate-400'}`}>Quarter {q}</span>
                {qProgress > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${qStatus}`}>{qProgress.toFixed(0)}%</span>}
              </div>
              <div className="text-xs font-medium text-slate-500 mb-2">Target: <span className="text-slate-900 font-bold">{indicator.quarters[q as 1 | 2 | 3 | 4].target}</span></div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Achievement</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={!isEditable}
                  placeholder="0"
                  className={`w-full text-sm p-3 rounded-lg border font-semibold outline-none bg-white transition-all ${isEditable ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-400 shadow-sm' : 'border-slate-200 cursor-not-allowed'}`}
                  value={indicator.quarters[q as 1 | 2 | 3 | 4].achievement || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or valid numbers
                    if (value === '' || /^[0-9]+$/.test(value)) {
                      onUpdate(indicator.id, q, value === '' ? 0 : Number(value));
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 py-3 border-t border-slate-50">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase">Annual Progress Tracker</span>
            <span className="font-black text-slate-800">{annualPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-700 ease-out shadow-inner ${annualPercentage >= 90 ? 'bg-emerald-500' : annualPercentage >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(annualPercentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
          {isFillMode ? "ALL QUARTERS UNLOCKED" : `Q${activeQuarter} ACTIVE`}
        </div>
      </div>
    </div>
  );
};

export default IndicatorCard;
