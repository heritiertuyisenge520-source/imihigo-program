
import React, { useState } from 'react';
import { Pillar, Sector, Outcome, Output, Indicator, QuarterlyData } from '../types';
import { Plus, Trash2, ChevronRight, ChevronDown, CheckCircle2, Layout } from 'lucide-react';

interface TemplateWizardProps {
  onComplete: (pillars: Pillar[]) => void;
}

const TemplateWizard: React.FC<TemplateWizardProps> = ({ onComplete }) => {
  const [wizardStep, setWizardStep] = useState<'count' | 'names' | 'builder'>('count');
  const [pillarCount, setPillarCount] = useState<number>(1);
  const [pillars, setPillars] = useState<Pillar[]>([]);

  // Navigation state for the builder
  const [activePillarIndex, setActivePillarIndex] = useState(0);

  // Initializing names
  const [tempNames, setTempNames] = useState<string[]>(['']);

  const handlePillarCountConfirm = () => {
    const names = Array(pillarCount).fill('').map((_, i) => tempNames[i] || `Pillar ${i + 1}`);
    setTempNames(names);
    setWizardStep('names');
  };

  const handleNamesConfirm = () => {
    const initialPillars: Pillar[] = tempNames.map(name => ({
      id: crypto.randomUUID(),
      name: name || 'Unnamed Pillar',
      sectors: []
    }));
    setPillars(initialPillars);
    setWizardStep('builder');
  };

  const addSector = (pillarIndex: number) => {
    const newPillars = [...pillars];
    newPillars[pillarIndex].sectors.push({
      id: crypto.randomUUID(),
      name: '',
      outcomes: []
    });
    setPillars(newPillars);
  };

  const addOutcome = (pillarIndex: number, sectorIndex: number) => {
    const newPillars = [...pillars];
    newPillars[pillarIndex].sectors[sectorIndex].outcomes.push({
      id: crypto.randomUUID(),
      name: '',
      outputs: []
    });
    setPillars(newPillars);
  };

  const addOutput = (pillarIndex: number, sectorIndex: number, outcomeIndex: number) => {
    const newPillars = [...pillars];
    newPillars[pillarIndex].sectors[sectorIndex].outcomes[outcomeIndex].outputs.push({
      id: crypto.randomUUID(),
      name: '',
      indicators: []
    });
    setPillars(newPillars);
  };

  const addIndicator = (pillarIndex: number, sectorIndex: number, outcomeIndex: number, outputIndex: number) => {
    const newPillars = [...pillars];
    const newIndicator: Indicator = {
      id: crypto.randomUUID(),
      name: '',
      baseline: '',
      sourceOfData: '',
      annualTarget: 0,
      quarters: {
        1: { target: 0, achievement: 0 },
        2: { target: 0, achievement: 0 },
        3: { target: 0, achievement: 0 },
        4: { target: 0, achievement: 0 },
      }
    };
    newPillars[pillarIndex].sectors[sectorIndex].outcomes[outcomeIndex].outputs[outputIndex].indicators.push(newIndicator);
    setPillars(newPillars);
  };

  const updateIndicator = (pIdx: number, sIdx: number, ocIdx: number, opIdx: number, iIdx: number, field: keyof Indicator, value: any) => {
    const newPillars = [...pillars];
    const indicator = newPillars[pIdx].sectors[sIdx].outcomes[ocIdx].outputs[opIdx].indicators[iIdx];

    if (field === 'quarters') {
      indicator.quarters = value;
      // Re-calculate annual target automatically
      indicator.annualTarget = Object.values(value as Indicator['quarters']).reduce((acc, q) => acc + (q as QuarterlyData).target, 0);
    } else {
      (indicator as any)[field] = value;
    }
    setPillars(newPillars);
  };

  if (wizardStep === 'count') {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 md:p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Layout size={24} className="sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Setup Imihigo Pillars</h2>
        <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 px-2">How many strategic pillars will this performance contract contain?</p>
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full p-3 sm:p-4 border-2 border-indigo-300 rounded-2xl text-center text-2xl sm:text-3xl font-bold bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-indigo-900 focus:border-indigo-500 focus:bg-gradient-to-br focus:from-indigo-100 focus:via-purple-100 focus:to-pink-100 focus:ring-4 focus:ring-indigo-200/50 outline-none transition-all touch-target hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 shadow-sm hover:shadow-md"
              value={pillarCount}
              onChange={e => {
                const value = e.target.value;
                // Allow empty string or valid numbers
                if (value === '' || /^[0-9]+$/.test(value)) {
                  const numValue = value === '' ? 1 : Math.max(1, parseInt(value, 10));
                  setPillarCount(numValue);
                }
              }}
              onFocus={(e) => e.target.select()}
              placeholder="1"
            />
          </div>
          <button
            onClick={handlePillarCountConfirm}
            className="w-full py-3 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all touch-target text-sm sm:text-base"
          >
            Continue to Naming
          </button>
        </div>
      </div>
    );
  }

  if (wizardStep === 'names') {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6 md:p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Name your {pillarCount} Pillars</h2>
        <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8">Provide descriptive names for your strategic areas.</p>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 sm:mb-8">
          {tempNames.map((name, i) => (
            <div key={i} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pillar {i + 1}</label>
              <input
                className="w-full p-3 border-2 border-indigo-200/60 rounded-xl bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/40 focus:bg-gradient-to-br focus:from-blue-100/90 focus:via-indigo-100/90 focus:to-purple-100/90 outline-none text-sm sm:text-base touch-target transition-all hover:border-indigo-400 hover:bg-gradient-to-br hover:from-blue-100/60 hover:via-indigo-100/60 hover:to-purple-100/60 shadow-sm hover:shadow"
                placeholder="e.g., Economic Transformation"
                value={name}
                onChange={e => {
                  const n = [...tempNames];
                  n[i] = e.target.value;
                  setTempNames(n);
                }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleNamesConfirm}
          className="w-full py-3 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all touch-target text-sm sm:text-base"
        >
          Start Structure Building
        </button>
      </div>
    );
  }

  const currentPillar = pillars[activePillarIndex];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">Structure Progress</h2>
          <p className="text-slate-900 font-bold text-xl">
            We have <span className="text-indigo-600">{pillars.length}</span> pillars.
            <span className="block md:inline mt-1 md:mt-0">Currently building: <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg md:ml-2 text-sm">{currentPillar.name}</span></span>
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
          {pillars.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePillarIndex(i)}
              className={`min-w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${activePillarIndex === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 pb-20">
        {/* Sector Level */}
        <div className="space-y-6">
          {currentPillar.sectors.map((sector, sIdx) => (
            <div key={sector.id} className="bg-white border-2 border-slate-100 rounded-3xl p-4 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">S</div>
                <input
                  className="text-xl font-bold text-slate-800 bg-gradient-to-r from-amber-50/50 via-orange-50/50 to-red-50/50 border-b-2 border-transparent focus:border-indigo-500 focus:bg-gradient-to-r focus:from-amber-100/70 focus:via-orange-100/70 focus:to-red-100/70 px-2 py-1 rounded-t-lg outline-none flex-1 min-w-0 transition-all hover:bg-gradient-to-r hover:from-amber-100/40 hover:via-orange-100/40 hover:to-red-100/40 hover:border-indigo-400"
                  placeholder="Enter Sector Name (e.g., Agriculture)..."
                  value={sector.name}
                  onChange={e => {
                    const n = [...pillars];
                    n[activePillarIndex].sectors[sIdx].name = e.target.value;
                    setPillars(n);
                  }}
                />
              </div>

              {/* Outcome Level */}
              <div className="md:ml-8 space-y-6 md:border-l-2 md:border-slate-100 md:pl-8">
                {sector.outcomes.map((outcome, ocIdx) => (
                  <div key={outcome.id} className="bg-slate-50/50 rounded-2xl p-4 md:p-6 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-indigo-100 text-indigo-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0">OC</div>
                      <input
                        className="font-bold text-slate-700 bg-gradient-to-r from-emerald-50/50 via-teal-50/50 to-cyan-50/50 border-b-2 border-transparent focus:border-indigo-500 focus:bg-gradient-to-r focus:from-emerald-100/70 focus:via-teal-100/70 focus:to-cyan-100/70 px-2 py-1 rounded-t-lg outline-none flex-1 min-w-0 transition-all hover:bg-gradient-to-r hover:from-emerald-100/40 hover:via-teal-100/40 hover:to-cyan-100/40 hover:border-indigo-400"
                        placeholder="Enter Outcome Name..."
                        value={outcome.name}
                        onChange={e => {
                          const n = [...pillars];
                          n[activePillarIndex].sectors[sIdx].outcomes[ocIdx].name = e.target.value;
                          setPillars(n);
                        }}
                      />
                    </div>

                    {/* Output Level */}
                    <div className="md:ml-4 space-y-4">
                      {outcome.outputs.map((output, opIdx) => (
                        <div key={output.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Output</span>
                            <input
                              className="font-semibold text-slate-700 bg-gradient-to-r from-violet-50/50 via-purple-50/50 to-fuchsia-50/50 border-b-2 border-transparent focus:border-indigo-500 focus:bg-gradient-to-r focus:from-violet-100/70 focus:via-purple-100/70 focus:to-fuchsia-100/70 px-2 py-1 rounded-t-lg outline-none flex-1 transition-all hover:bg-gradient-to-r hover:from-violet-100/40 hover:via-purple-100/40 hover:to-fuchsia-100/40 hover:border-indigo-400"
                              placeholder="Enter Output..."
                              value={output.name}
                              onChange={e => {
                                const n = [...pillars];
                                n[activePillarIndex].sectors[sIdx].outcomes[ocIdx].outputs[opIdx].name = e.target.value;
                                setPillars(n);
                              }}
                            />
                          </div>

                          {/* Indicator Level */}
                          <div className="grid grid-cols-1 gap-4">
                            {output.indicators.map((ind, iIdx) => (
                              <div key={ind.id} className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Indicator Name</label>
                                    <input
                                      className="w-full bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-2.5 border-2 border-indigo-300/70 rounded-lg outline-none mt-1 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/40 focus:bg-gradient-to-br focus:from-indigo-100 focus:via-blue-100 focus:to-cyan-100 transition-all hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-100/80 hover:via-blue-100/80 hover:to-cyan-100/80 shadow-sm hover:shadow"
                                      value={ind.name}
                                      onChange={e => updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'name', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Baseline</label>
                                    <input
                                      className="w-full bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-2.5 border-2 border-rose-300/70 rounded-lg outline-none mt-1 text-slate-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-200/40 focus:bg-gradient-to-br focus:from-rose-100 focus:via-pink-100 focus:to-fuchsia-100 transition-all hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-100/80 hover:via-pink-100/80 hover:to-fuchsia-100/80 shadow-sm hover:shadow"
                                      value={ind.baseline}
                                      onChange={e => updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'baseline', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Source of Information</label>
                                    <input
                                      className="w-full bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-2.5 border-2 border-emerald-300/70 rounded-lg outline-none mt-1 text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/40 focus:bg-gradient-to-br focus:from-emerald-100 focus:via-green-100 focus:to-lime-100 transition-all hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-100/80 hover:via-green-100/80 hover:to-lime-100/80 shadow-sm hover:shadow"
                                      value={ind.sourceOfData}
                                      onChange={e => updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'sourceOfData', e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {[1, 2, 3, 4].map(q => (
                                    <div key={q}>
                                      <label className="text-[9px] font-bold text-slate-400 uppercase">Q{q} Target</label>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="w-full bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-2.5 border-2 border-amber-300/70 rounded-lg outline-none mt-1 text-sm font-semibold text-slate-800 touch-target focus:border-amber-500 focus:ring-4 focus:ring-amber-200/40 focus:bg-gradient-to-br focus:from-amber-100 focus:via-yellow-100 focus:to-orange-100 transition-all hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-100/80 hover:via-yellow-100/80 hover:to-orange-100/80 shadow-sm hover:shadow"
                                        value={ind.quarters[q as 1 | 2 | 3 | 4].target}
                                        onChange={e => {
                                          const value = e.target.value;
                                          if (value === '' || /^[0-9]+$/.test(value)) {
                                            const numValue = value === '' ? 0 : Number(value);
                                            const newQuarters = { ...ind.quarters };
                                            newQuarters[q as 1 | 2 | 3 | 4] = { ...newQuarters[q as 1 | 2 | 3 | 4], target: numValue };
                                            updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'quarters', newQuarters);
                                          }
                                        }}
                                        onFocus={(e) => e.target.select()}
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">
                                    Annual Target: {ind.annualTarget}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => addIndicator(activePillarIndex, sIdx, ocIdx, opIdx)}
                              className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-indigo-100 text-indigo-400 rounded-xl hover:bg-indigo-50 transition-colors text-xs font-bold"
                            >
                              <Plus size={14} /> Add Indicator
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addOutput(activePillarIndex, sIdx, ocIdx)}
                        className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:underline"
                      >
                        <Plus size={14} /> Add Output to Outcome
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addOutcome(activePillarIndex, sIdx)}
                  className="flex items-center gap-2 text-slate-600 text-sm font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm"
                >
                  <Plus size={16} /> Add Outcome to Sector
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => addSector(activePillarIndex)}
            className="w-full p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
          >
            <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-indigo-100 transition-all">
              <Plus size={32} />
            </div>
            <span className="font-bold">Add a New Sector to "{currentPillar.name}"</span>
          </button>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 md:bottom-8 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-auto flex md:gap-4 bg-white/90 backdrop-blur-md p-4 md:rounded-3xl border-t md:border border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] md:shadow-2xl z-50 justify-between md:justify-start">
        <button
          onClick={() => {
            if (activePillarIndex > 0) setActivePillarIndex(activePillarIndex - 1);
          }}
          disabled={activePillarIndex === 0}
          className="px-4 md:px-6 py-3 bg-slate-100 text-slate-500 rounded-xl md:rounded-2xl font-bold disabled:opacity-30 hover:bg-slate-200 transition-all text-sm md:text-base"
        >
          Previous
        </button>
        {activePillarIndex < pillars.length - 1 ? (
          <button
            onClick={() => setActivePillarIndex(activePillarIndex + 1)}
            className="flex-1 md:flex-none px-6 md:px-10 py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm md:text-base ml-4 md:ml-0"
          >
            Next Pillar <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => onComplete(pillars)}
            className="flex-1 md:flex-none px-6 md:px-10 py-3 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm md:text-base ml-4 md:ml-0"
          >
            Finish Contract <CheckCircle2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateWizard;
