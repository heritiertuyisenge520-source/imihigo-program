
import React, { useMemo } from 'react';
import { Pillar, QuarterlyData } from '../types';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, CheckCircle2, Target } from 'lucide-react';

interface AnalyticsViewProps {
  pillars: Pillar[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ pillars }) => {
  const analyticsData = useMemo(() => {
    let totalAchieved = 0;
    let totalTarget = 0;
    let indicatorCount = 0;
    
    const pillarData = pillars.map(p => {
      let pAch = 0;
      let pTar = 0;
      p.sectors.forEach(s => s.outcomes.forEach(oc => oc.outputs.forEach(op => op.indicators.forEach(ind => {
        const ach = (Object.values(ind.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0);
        pAch += ach;
        pTar += ind.annualTarget;
      }))));
      return {
        name: p.name,
        progress: pTar > 0 ? (pAch / pTar) * 100 : 0
      };
    });

    const statusCounts = { onTrack: 0, warning: 0, critical: 0 };
    pillars.forEach(p => p.sectors.forEach(s => s.outcomes.forEach(oc => oc.outputs.forEach(op => op.indicators.forEach(ind => {
      const ach = (Object.values(ind.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0);
      const progress = ind.annualTarget > 0 ? (ach / ind.annualTarget) * 100 : 0;
      indicatorCount++;
      totalAchieved += ach;
      totalTarget += ind.annualTarget;

      if (progress >= 90) statusCounts.onTrack++;
      else if (progress >= 70) statusCounts.warning++;
      else statusCounts.critical++;
    })))));

    return {
      overallProgress: totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0,
      indicatorCount,
      pillarData,
      statusCounts
    };
  }, [pillars]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Overview */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-indigo-600">
              <TrendingUp size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight">Performance Summary</h3>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-10 border-b border-slate-100 mb-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96" cy="96" r="88"
                  fill="transparent" stroke="#f1f5f9" strokeWidth="12"
                />
                <circle
                  cx="96" cy="96" r="88"
                  fill="transparent"
                  stroke={analyticsData.overallProgress >= 90 ? "#10b981" : analyticsData.overallProgress >= 70 ? "#f59e0b" : "#f43f5e"}
                  strokeWidth="12"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 - (552.92 * analyticsData.overallProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900">{analyticsData.overallProgress.toFixed(1)}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="text-emerald-600 font-black text-2xl">{analyticsData.statusCounts.onTrack}</div>
              <div className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">On Track</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="text-amber-600 font-black text-2xl">{analyticsData.statusCounts.warning}</div>
              <div className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Warning</div>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <div className="text-rose-600 font-black text-2xl">{analyticsData.statusCounts.critical}</div>
              <div className="text-[9px] font-black text-rose-700 uppercase tracking-widest">Critical</div>
            </div>
          </div>
        </div>

        {/* Pillar Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-indigo-600">
              <BarChart3 size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight">Pillar Breakdown</h3>
            </div>
          </div>
          
          <div className="space-y-6">
            {analyticsData.pillarData.map((p, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-slate-700 max-w-[80%] line-clamp-1">{p.name}</span>
                  <span className="text-sm font-black text-slate-900">{p.progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${p.progress >= 90 ? 'bg-emerald-500' : p.progress >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/10">
            <PieChart size={48} className="text-indigo-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black mb-3">Strategic Insights</h3>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-3xl">
              Currently monitoring <span className="text-white font-black">{analyticsData.indicatorCount} indicators</span> across all strategic sectors. 
              Performance is {analyticsData.overallProgress >= 70 ? 'strong' : 'requiring attention'}, with 
              <span className="text-emerald-300 font-black"> {((analyticsData.statusCounts.onTrack / (analyticsData.indicatorCount || 1)) * 100).toFixed(0)}%</span> of metrics currently on target.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 opacity-5">
          <Target size={300} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
