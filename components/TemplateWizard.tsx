
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
      <div className="max-w-md mx-auto p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Layout size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Setup Imihigo Pillars</h2>
        <p className="text-slate-500 mb-8">How many strategic pillars will this performance contract contain?</p>
        <div className="flex flex-col gap-6">
          <input 
            type="number"
            min="1"
            className="w-full p-4 border-2 border-slate-100 rounded-2xl text-center text-3xl font-bold focus:border-indigo-500 outline-none transition-all"
            value={pillarCount}
            onChange={e => setPillarCount(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <button 
            onClick={handlePillarCountConfirm}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Continue to Naming
          </button>
        </div>
      </div>
    );
  }

  if (wizardStep === 'names') {
    return (
      <div className="max-w-lg mx-auto p-10 bg-white border border-slate-200 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Name your {pillarCount} Pillars</h2>
        <p className="text-slate-500 mb-8">Provide descriptive names for your strategic areas.</p>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-8">
          {tempNames.map((name, i) => (
            <div key={i} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pillar {i + 1}</label>
              <input 
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">Structure Progress</h2>
          <p className="text-slate-900 font-bold text-xl">
            We have <span className="text-indigo-600">{pillars.length}</span> pillars. 
            Currently building: <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg ml-2">{currentPillar.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {pillars.map((_, i) => (
            <button 
              key={i}
              onClick={() => setActivePillarIndex(i)}
              className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${activePillarIndex === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
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
            <div key={sector.id} className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">S</div>
                <input 
                  className="text-xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent focus:border-indigo-300 outline-none flex-1"
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
              <div className="ml-8 space-y-6 border-l-2 border-slate-100 pl-8">
                {sector.outcomes.map((outcome, ocIdx) => (
                  <div key={outcome.id} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-indigo-100 text-indigo-600 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px]">OC</div>
                      <input 
                        className="font-bold text-slate-700 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none flex-1"
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
                    <div className="ml-4 space-y-4">
                      {outcome.outputs.map((output, opIdx) => (
                        <div key={output.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Output</span>
                             <input 
                                className="font-semibold text-slate-700 bg-transparent border-b border-transparent focus:border-indigo-300 outline-none flex-1"
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
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Indicator Name</label>
                                    <input 
                                      className="w-full bg-white p-2 border border-indigo-100 rounded-lg outline-none mt-1"
                                      value={ind.name}
                                      onChange={e => updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'name', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Baseline</label>
                                    <input 
                                      className="w-full bg-white p-2 border border-indigo-100 rounded-lg outline-none mt-1"
                                      value={ind.baseline}
                                      onChange={e => updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'baseline', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Source of Information</label>
                                    <input 
                                      className="w-full bg-white p-2 border border-indigo-100 rounded-lg outline-none mt-1"
                                      value={ind.sourceOfData}
                                      onChange={e => updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'sourceOfData', e.target.value)}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                  {[1, 2, 3, 4].map(q => (
                                    <div key={q}>
                                      <label className="text-[9px] font-bold text-slate-400 uppercase">Q{q} Target</label>
                                      <input 
                                        type="number"
                                        className="w-full bg-white p-2 border border-slate-200 rounded-lg outline-none mt-1 text-sm"
                                        value={ind.quarters[q as 1|2|3|4].target}
                                        onChange={e => {
                                          const newQuarters = { ...ind.quarters };
                                          newQuarters[q as 1|2|3|4] = { ...newQuarters[q as 1|2|3|4], target: Number(e.target.value) };
                                          updateIndicator(activePillarIndex, sIdx, ocIdx, opIdx, iIdx, 'quarters', newQuarters);
                                        }}
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
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-2xl z-50">
        <button 
          onClick={() => {
            if (activePillarIndex > 0) setActivePillarIndex(activePillarIndex - 1);
          }}
          disabled={activePillarIndex === 0}
          className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold disabled:opacity-30 hover:bg-slate-200 transition-all"
        >
          Previous Pillar
        </button>
        {activePillarIndex < pillars.length - 1 ? (
          <button 
            onClick={() => setActivePillarIndex(activePillarIndex + 1)}
            className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            Next Pillar <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            onClick={() => onComplete(pillars)}
            className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            Finish Contract <CheckCircle2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateWizard;
