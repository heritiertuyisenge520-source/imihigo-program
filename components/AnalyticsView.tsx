
import React, { useState, useMemo } from 'react';
import { Pillar, QuarterlyData } from '../types';
import { BarChart3, PieChart, TrendingUp, Filter, ChevronDown, Target, Activity } from 'lucide-react';

interface AnalyticsViewProps {
  pillars: Pillar[];
  savedTemplates: Pillar[][];
  onTemplateSelect: (index: number | null) => void;
  selectedTemplateIndex: number | null;
}

type FilterLevel = 'indicator' | 'output' | 'outcome';

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  pillars, 
  savedTemplates, 
  onTemplateSelect, 
  selectedTemplateIndex 
}) => {
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('indicator');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Calculate quarterly and annual data
  const analyticsData = useMemo(() => {
    const indicators: Array<{
      id: string;
      name: string;
      pillar: string;
      sector: string;
      outcome: string;
      output: string;
      baseline: number;
      annualTarget: number;
      quarters: { [key: number]: { target: number; achievement: number } };
    }> = [];

    const outputs: Array<{
      id: string;
      name: string;
      pillar: string;
      sector: string;
      outcome: string;
      indicators: typeof indicators;
    }> = [];

    const outcomes: Array<{
      id: string;
      name: string;
      pillar: string;
      sector: string;
      outputs: typeof outputs;
    }> = [];

    pillars.forEach(pillar => {
      pillar.sectors.forEach(sector => {
        sector.outcomes.forEach(outcome => {
          const outcomeData = {
            id: outcome.id,
            name: outcome.name,
            pillar: pillar.name,
            sector: sector.name,
            outputs: [] as typeof outputs
          };

          outcome.outputs.forEach(output => {
            const outputData = {
              id: output.id,
              name: output.name,
              pillar: pillar.name,
              sector: sector.name,
              outcome: outcome.name,
              indicators: [] as typeof indicators
            };

            output.indicators.forEach(indicator => {
              const baselineNum = parseFloat(indicator.baseline.toString()) || 0;
              const indicatorData = {
                id: indicator.id,
                name: indicator.name,
                pillar: pillar.name,
                sector: sector.name,
                outcome: outcome.name,
                output: output.name,
                baseline: baselineNum,
                annualTarget: indicator.annualTarget,
                quarters: indicator.quarters
              };
              indicators.push(indicatorData);
              outputData.indicators.push(indicatorData);
            });

            outcomeData.outputs.push(outputData);
          });

          outcomes.push(outcomeData);
        });
      });
    });

    // Calculate quarterly totals
    const quarterlyData = {
      1: { target: 0, achievement: 0, baseline: 0 },
      2: { target: 0, achievement: 0, baseline: 0 },
      3: { target: 0, achievement: 0, baseline: 0 },
      4: { target: 0, achievement: 0, baseline: 0 }
    };

    let totalAnnualTarget = 0;
    let totalAnnualAchievement = 0;
    let totalBaseline = 0;

    indicators.forEach(ind => {
      [1, 2, 3, 4].forEach(q => {
        quarterlyData[q].target += ind.quarters[q]?.target || 0;
        quarterlyData[q].achievement += ind.quarters[q]?.achievement || 0;
        quarterlyData[q].baseline += ind.baseline / 4; // Distribute baseline across quarters
      });
      totalAnnualTarget += ind.annualTarget;
      const annualAch = (Object.values(ind.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0);
      totalAnnualAchievement += annualAch;
      totalBaseline += ind.baseline;
    });

    return {
      indicators,
      outputs,
      outcomes,
      quarterlyData,
      annualData: {
        target: totalAnnualTarget,
        achievement: totalAnnualAchievement,
        baseline: totalBaseline
      }
    };
  }, [pillars]);

  // Filter items based on selected level
  const filteredItems = useMemo(() => {
    if (filterLevel === 'indicator') {
      return analyticsData.indicators.map(ind => ({
        id: ind.id,
        name: ind.name,
        fullPath: `${ind.pillar} > ${ind.sector} > ${ind.outcome} > ${ind.output}`
      }));
    } else if (filterLevel === 'output') {
      return analyticsData.outputs.map(op => ({
        id: op.id,
        name: op.name,
        fullPath: `${op.pillar} > ${op.sector} > ${op.outcome}`
      }));
    } else {
      return analyticsData.outcomes.map(oc => ({
        id: oc.id,
        name: oc.name,
        fullPath: `${oc.pillar} > ${oc.sector}`
      }));
    }
  }, [filterLevel, analyticsData]);

  // Get data for selected item
  const selectedItemData = useMemo(() => {
    if (!selectedItem) return null;

    if (filterLevel === 'indicator') {
      const ind = analyticsData.indicators.find(i => i.id === selectedItem);
      if (!ind) return null;
      
      return {
        name: ind.name,
        baseline: ind.baseline,
        annualTarget: ind.annualTarget,
        annualAchievement: (Object.values(ind.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0),
        quarters: ind.quarters
      };
    } else if (filterLevel === 'output') {
      const op = analyticsData.outputs.find(o => o.id === selectedItem);
      if (!op) return null;

      let baseline = 0;
      let annualTarget = 0;
      let annualAchievement = 0;
      const quarters: { [key: number]: { target: number; achievement: number; baseline: number } } = {
        1: { target: 0, achievement: 0, baseline: 0 },
        2: { target: 0, achievement: 0, baseline: 0 },
        3: { target: 0, achievement: 0, baseline: 0 },
        4: { target: 0, achievement: 0, baseline: 0 }
      };

      op.indicators.forEach(ind => {
        baseline += ind.baseline;
        annualTarget += ind.annualTarget;
        const annualAch = (Object.values(ind.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0);
        annualAchievement += annualAch;
        [1, 2, 3, 4].forEach(q => {
          quarters[q].target += ind.quarters[q]?.target || 0;
          quarters[q].achievement += ind.quarters[q]?.achievement || 0;
          quarters[q].baseline += ind.baseline / 4;
        });
      });

      return {
        name: op.name,
        baseline,
        annualTarget,
        annualAchievement,
        quarters
      };
    } else {
      const oc = analyticsData.outcomes.find(o => o.id === selectedItem);
      if (!oc) return null;

      let baseline = 0;
      let annualTarget = 0;
      let annualAchievement = 0;
      const quarters: { [key: number]: { target: number; achievement: number; baseline: number } } = {
        1: { target: 0, achievement: 0, baseline: 0 },
        2: { target: 0, achievement: 0, baseline: 0 },
        3: { target: 0, achievement: 0, baseline: 0 },
        4: { target: 0, achievement: 0, baseline: 0 }
      };

      oc.outputs.forEach(op => {
        op.indicators.forEach(ind => {
          baseline += ind.baseline;
          annualTarget += ind.annualTarget;
          const annualAch = (Object.values(ind.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0);
          annualAchievement += annualAch;
          [1, 2, 3, 4].forEach(q => {
            quarters[q].target += ind.quarters[q]?.target || 0;
            quarters[q].achievement += ind.quarters[q]?.achievement || 0;
            quarters[q].baseline += ind.baseline / 4;
          });
        });
      });

      return {
        name: oc.name,
        baseline,
        annualTarget,
        annualAchievement,
        quarters
      };
    }
  }, [selectedItem, filterLevel, analyticsData]);

  // Use selected item data or overall data
  const displayData = selectedItemData || {
    name: 'Overall Performance',
    baseline: analyticsData.annualData.baseline,
    annualTarget: analyticsData.annualData.target,
    annualAchievement: analyticsData.annualData.achievement,
    quarters: analyticsData.quarterlyData
  };

  const maxValue = Math.max(
    displayData.annualTarget,
    displayData.annualAchievement,
    displayData.baseline,
    ...Object.values(displayData.quarters).map(q => Math.max(q.target || 0, q.achievement || 0, (q as any).baseline || 0))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Template Selection */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Target className="text-indigo-600" size={20} />
              Select Template
            </h3>
            <p className="text-sm text-slate-600">Choose a template to analyze performance data</p>
          </div>
          <select
            value={selectedTemplateIndex ?? ''}
            onChange={(e) => onTemplateSelect(e.target.value === '' ? null : parseInt(e.target.value))}
            className="px-4 py-2.5 bg-white border-2 border-indigo-300 rounded-xl text-slate-800 font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all hover:border-indigo-400 shadow-sm min-w-[250px]"
          >
            <option value="">Select a template...</option>
            {savedTemplates.map((template, idx) => (
              <option key={idx} value={idx}>
                {template[0]?.name || `Template ${idx + 1}`} ({template.length} Pillars)
              </option>
            ))}
          </select>
        </div>
      </div>

      {pillars.length > 0 && (
        <>
          {/* Filter Section */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="text-indigo-600" size={20} />
                <h3 className="text-lg font-bold text-slate-800">Filter by Level</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['indicator', 'output', 'outcome'] as FilterLevel[]).map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      setFilterLevel(level);
                      setSelectedItem(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      filterLevel === level
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Selection */}
            {filteredItems.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Select {filterLevel.charAt(0).toUpperCase() + filterLevel.slice(1)}
                </label>
                <select
                  value={selectedItem || ''}
                  onChange={(e) => setSelectedItem(e.target.value || null)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all hover:border-indigo-400"
                >
                  <option value="">View Overall Performance</option>
                  {filteredItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.fullPath})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quarterly Chart */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-indigo-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Quarterly Performance</h3>
            </div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map(q => {
                const qData = displayData.quarters[q as 1 | 2 | 3 | 4];
                const baseline = (qData as any).baseline || displayData.baseline / 4;
                const target = qData.target || 0;
                const achievement = qData.achievement || 0;
                const targetPercent = maxValue > 0 ? (target / maxValue) * 100 : 0;
                const achievementPercent = maxValue > 0 ? (achievement / maxValue) * 100 : 0;
                const baselinePercent = maxValue > 0 ? (baseline / maxValue) * 100 : 0;

                return (
                  <div key={q} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Quarter {q}</span>
                      <div className="flex gap-4 text-xs font-semibold">
                        <span className="text-slate-500">Baseline: <span className="text-slate-700">{baseline.toFixed(0)}</span></span>
                        <span className="text-indigo-600">Target: <span className="text-indigo-800">{target.toFixed(0)}</span></span>
                        <span className="text-emerald-600">Achieved: <span className="text-emerald-700">{achievement.toFixed(0)}</span></span>
                      </div>
                    </div>
                    <div className="relative h-16 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                      {/* Baseline */}
                      <div
                        className="absolute bottom-0 left-0 bg-slate-400/40 border-r-2 border-slate-500"
                        style={{ width: `${baselinePercent}%`, height: '33.33%' }}
                        title={`Baseline: ${baseline.toFixed(0)}`}
                      />
                      {/* Target */}
                      <div
                        className="absolute bottom-0 left-0 bg-indigo-400/60 border-r-2 border-indigo-600"
                        style={{ width: `${targetPercent}%`, height: '66.66%' }}
                        title={`Target: ${target.toFixed(0)}`}
                      />
                      {/* Achievement */}
                      <div
                        className="absolute bottom-0 left-0 bg-emerald-500 border-r-2 border-emerald-700"
                        style={{ width: `${achievementPercent}%`, height: '100%' }}
                        title={`Achievement: ${achievement.toFixed(0)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-400/40 border border-slate-500"></div>
                <span className="text-slate-700 font-semibold">Baseline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-400/60 border border-indigo-600"></div>
                <span className="text-slate-700 font-semibold">Target</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 border border-emerald-700"></div>
                <span className="text-slate-700 font-semibold">Achievement</span>
              </div>
            </div>
          </div>

          {/* Annual Chart */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-indigo-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Annual Performance Summary</h3>
            </div>
            <div className="space-y-6">
              <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                {maxValue > 0 && (
                  <>
                    {/* Baseline */}
                    <div
                      className="absolute bottom-0 left-0 bg-slate-400/40 border-r-2 border-slate-500 flex items-end"
                      style={{ width: `${(displayData.baseline / maxValue) * 100}%`, height: '100%' }}
                    >
                      <div className="w-full text-center text-xs font-bold text-slate-700 p-1">
                        Baseline
                      </div>
                    </div>
                    {/* Target */}
                    <div
                      className="absolute bottom-0 bg-indigo-400/60 border-r-2 border-indigo-600 flex items-end"
                      style={{ 
                        left: `${(displayData.baseline / maxValue) * 100}%`,
                        width: `${((displayData.annualTarget - displayData.baseline) / maxValue) * 100}%`,
                        height: '100%'
                      }}
                    >
                      <div className="w-full text-center text-xs font-bold text-indigo-800 p-1">
                        Target
                      </div>
                    </div>
                    {/* Achievement */}
                    <div
                      className="absolute bottom-0 bg-emerald-500 border-r-2 border-emerald-700 flex items-end"
                      style={{ 
                        left: `${((displayData.baseline + displayData.annualTarget - displayData.baseline) / maxValue) * 100}%`,
                        width: `${(displayData.annualAchievement / maxValue) * 100}%`,
                        height: '100%'
                      }}
                    >
                      <div className="w-full text-center text-xs font-bold text-white p-1">
                        Achievement
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                  <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Baseline</div>
                  <div className="text-2xl font-bold text-slate-800">{displayData.baseline.toFixed(0)}</div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
                  <div className="text-xs font-semibold text-indigo-600 uppercase mb-1">Annual Target</div>
                  <div className="text-2xl font-bold text-indigo-800">{displayData.annualTarget.toFixed(0)}</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-600 uppercase mb-1">Achievement</div>
                  <div className="text-2xl font-bold text-emerald-800">{displayData.annualAchievement.toFixed(0)}</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                <div className="text-xs font-semibold text-indigo-700 uppercase mb-1">Performance Rate</div>
                <div className="text-3xl font-bold text-indigo-900">
                  {displayData.annualTarget > 0 
                    ? ((displayData.annualAchievement / displayData.annualTarget) * 100).toFixed(1) 
                    : '0'}%
                </div>
                <div className="text-xs text-indigo-600 mt-1">
                  {displayData.annualAchievement >= displayData.annualTarget * 0.9 
                    ? '✓ On Track' 
                    : displayData.annualAchievement >= displayData.annualTarget * 0.7 
                    ? '⚠ Needs Attention' 
                    : '✗ Critical'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {pillars.length === 0 && (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-slate-200">
          <PieChart className="mx-auto text-slate-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Data Available</h3>
          <p className="text-slate-500">Please select a template to view analytics</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
