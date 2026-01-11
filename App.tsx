
import React, { useState, useMemo, useEffect } from 'react';
import { Pillar, ViewMode, QuarterlyData } from './types';
import TemplateWizard from './components/TemplateWizard';
import IndicatorCard from './components/IndicatorCard';
import AnalyticsView from './components/AnalyticsView';
import { LayoutDashboard, FilePlus, ChevronDown, ChevronRight, BarChart3, Target, ClipboardCheck, ArrowLeft, CheckCircle, Download, PieChart, Settings, LogOut, User, Bell, Shield, Database, Menu, X } from 'lucide-react';

const STORAGE_KEY = 'imihigo-saved-templates';
const STORAGE_SELECTED_KEY = 'imihigo-selected-template-index';

const INITIAL_DATA: Pillar[] = [
  {
    id: 'p-1',
    name: 'Economic Development Pillar',
    sectors: [
      {
        id: 's-1',
        name: 'Agriculture & Livestock',
        outcomes: [
          {
            id: 'oc-1',
            name: 'Increased agricultural productivity',
            outputs: [
              {
                id: 'op-1',
                name: 'Fertilizer distribution improved',
                indicators: [
                  {
                    id: 'ind-1',
                    name: 'Quantity of chemical fertilizers used by farmers (Tons)',
                    baseline: '500',
                    sourceOfData: 'Ministry of Agriculture Reports',
                    annualTarget: 1000,
                    quarters: {
                      1: { target: 250, achievement: 240 },
                      2: { target: 250, achievement: 260 },
                      3: { target: 250, achievement: 100 },
                      4: { target: 250, achievement: 0 },
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const App: React.FC = () => {
  // Load templates from localStorage on mount
  const loadTemplatesFromStorage = (): Pillar[][] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.length > 0 ? parsed : [INITIAL_DATA];
      }
    } catch (error) {
      console.error('Error loading templates from localStorage:', error);
    }
    return [INITIAL_DATA];
  };

  const loadSelectedIndexFromStorage = (): number | null => {
    try {
      const stored = localStorage.getItem(STORAGE_SELECTED_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    } catch (error) {
      console.error('Error loading selected index from localStorage:', error);
    }
    return 0;
  };

  const [view, setView] = useState<ViewMode>('dashboard');
  const [savedTemplates, setSavedTemplates] = useState<Pillar[][]>(loadTemplatesFromStorage);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(loadSelectedIndexFromStorage);
  const [expandedSectors, setExpandedSectors] = useState<string[]>(['s-1']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTemplates));
    } catch (error) {
      console.error('Error saving templates to localStorage:', error);
    }
  }, [savedTemplates]);

  // Save selected template index to localStorage whenever it changes
  useEffect(() => {
    try {
      if (selectedTemplateIndex !== null) {
        localStorage.setItem(STORAGE_SELECTED_KEY, selectedTemplateIndex.toString());
      } else {
        localStorage.removeItem(STORAGE_SELECTED_KEY);
      }
    } catch (error) {
      console.error('Error saving selected index to localStorage:', error);
    }
  }, [selectedTemplateIndex]);

  // Active pillars derived from selection
  const pillars = selectedTemplateIndex !== null && savedTemplates[selectedTemplateIndex] 
    ? savedTemplates[selectedTemplateIndex] 
    : [];

  const toggleSector = (id: string) => {
    setExpandedSectors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleIndicatorUpdate = (indicatorId: string, quarter: number, achievement: number) => {
    if (selectedTemplateIndex === null) return;

    const updatedTemplates = [...savedTemplates];
    updatedTemplates[selectedTemplateIndex] = updatedTemplates[selectedTemplateIndex].map(p => ({
      ...p,
      sectors: p.sectors.map(s => ({
        ...s,
        outcomes: s.outcomes.map(oc => ({
          ...oc,
          outputs: oc.outputs.map(op => ({
            ...op,
            indicators: op.indicators.map(ind => {
              if (ind.id === indicatorId) {
                return {
                  ...ind,
                  quarters: {
                    ...ind.quarters,
                    [quarter]: { ...ind.quarters[quarter as 1 | 2 | 3 | 4], achievement }
                  }
                };
              }
              return ind;
            })
          }))
        }))
      }))
    }));
    setSavedTemplates(updatedTemplates);
    // localStorage is saved automatically via useEffect
  };

  const handleTemplateComplete = (newPillars: Pillar[]) => {
    const newTemplates = [...savedTemplates, newPillars];
    setSavedTemplates(newTemplates);
    const newIndex = newTemplates.length - 1;
    setSelectedTemplateIndex(newIndex);
    setView('fill');
    // localStorage is saved automatically via useEffect
  };

  const stats = useMemo(() => {
    let totalAch = 0;
    let totalTar = 0;
    let count = 0;

    pillars.forEach(p => p.sectors.forEach(s => s.outcomes.forEach(oc => oc.outputs.forEach(op => op.indicators.forEach(ind => {
      const ach = (Object.values(ind.quarters) as QuarterlyData[]).reduce((acc, q) => acc + q.achievement, 0);
      totalAch += ach;
      totalTar += ind.annualTarget;
      count++;
    })))));

    const avg = totalTar > 0 ? (totalAch / totalTar) * 100 : 0;
    return { avg, count };
  }, [pillars]);

  const downloadCSV = () => {
    if (pillars.length === 0) return;

    const headers = [
      'Pillar', 'Sector', 'Outcome', 'Output', 'Indicator',
      'Baseline', 'Source of Data', 'Annual Target',
      'Q1 Target', 'Q1 Achievement', 'Q2 Target', 'Q2 Achievement',
      'Q3 Target', 'Q3 Achievement', 'Q4 Target', 'Q4 Achievement',
      'Total Achievement', 'Progress %'
    ];

    const rows: string[] = [];
    pillars.forEach(p => {
      p.sectors.forEach(s => {
        s.outcomes.forEach(oc => {
          oc.outputs.forEach(op => {
            op.indicators.forEach(ind => {
              const q1 = ind.quarters[1];
              const q2 = ind.quarters[2];
              const q3 = ind.quarters[3];
              const q4 = ind.quarters[4];
              const totalAch = q1.achievement + q2.achievement + q3.achievement + q4.achievement;
              const progress = ind.annualTarget > 0 ? (totalAch / ind.annualTarget) * 100 : 0;

              const row = [
                p.name, s.name, oc.name, op.name, ind.name,
                ind.baseline, ind.sourceOfData, ind.annualTarget,
                q1.target, q1.achievement, q2.target, q2.achievement,
                q3.target, q3.achievement, q4.target, q4.achievement,
                totalAch, progress.toFixed(2)
              ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');

              rows.push(row);
            });
          });
        });
      });
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `imihigo_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      window.location.reload(); // Simple prototype logout
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 text-slate-400 border-b border-slate-800 z-30">
        <div className="px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Target size={16} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-base font-bold text-white tracking-tight leading-none">Imihigo</h1>
                <span className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest">Management System</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <LayoutDashboard size={16} />
                <span className="text-xs font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'analytics' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <PieChart size={16} />
                <span className="text-xs font-medium">Analytics</span>
              </button>
              <button
                onClick={() => setView('template')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'template' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <FilePlus size={16} />
                <span className="text-xs font-medium">Build Template</span>
              </button>
              <button
                onClick={() => {
                  setView('fill');
                  setSelectedTemplateIndex(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === 'fill' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <ClipboardCheck size={16} />
                <span className="text-xs font-medium">Fill Performance</span>
              </button>
            </div>

            {/* Right side - User menu & Mobile menu button */}
            <div className="flex items-center gap-3">
              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center gap-2 border-l border-slate-700 pl-3 ml-2">
                <button
                  onClick={() => setView('settings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${view === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-400"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900">
            <div className="px-3 py-2 space-y-1">
              <button
                onClick={() => {
                  setView('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <LayoutDashboard size={16} />
                <span className="text-xs font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setView('analytics');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${view === 'analytics' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <PieChart size={16} />
                <span className="text-xs font-medium">Analytics</span>
              </button>
              <button
                onClick={() => {
                  setView('template');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${view === 'template' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <FilePlus size={16} />
                <span className="text-xs font-medium">Build Template</span>
              </button>
              <button
                onClick={() => {
                  setView('fill');
                  setSelectedTemplateIndex(null);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${view === 'fill' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
              >
                <ClipboardCheck size={16} />
                <span className="text-xs font-medium">Fill Performance</span>
              </button>
              <div className="pt-2 border-t border-slate-800 mt-2">
                <button
                  onClick={() => {
                    setView('settings');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${view === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-800'}`}
                >
                  <Settings size={16} />
                  <span className="text-xs font-medium">Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-400 mt-1"
                >
                  <LogOut size={16} />
                  <span className="text-xs font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-14 sm:h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 md:px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 md:gap-4">
            {view === 'fill' && selectedTemplateIndex !== null && (
              <button
                onClick={() => setSelectedTemplateIndex(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center gap-2 touch-target"
              >
                <ArrowLeft size={18} />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Back</span>
              </button>
            )}
            <h2 className="text-base sm:text-lg md:text-2xl font-bold text-slate-800 tracking-tight capitalize">
              {view === 'fill' ? 'Data Entry' : view.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            {view === 'dashboard' && pillars.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs md:text-sm hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm touch-target"
              >
                <Download size={16} className="md:w-5 md:h-5" />
                <span className="hidden md:inline">Download Report</span>
              </button>
            )}
            <div className="hidden lg:flex flex-col items-end border-l border-slate-200 pl-4 ml-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Current Period</span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Fiscal Year 2024 - Quarter 1</span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-xs md:text-sm text-slate-500 touch-target">
              JD
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10">
          {view === 'template' && (
            <TemplateWizard onComplete={handleTemplateComplete} />
          )}

          {view === 'analytics' && (
            <AnalyticsView 
              pillars={pillars} 
              savedTemplates={savedTemplates}
              onTemplateSelect={setSelectedTemplateIndex}
              selectedTemplateIndex={selectedTemplateIndex}
            />
          )}

          {view === 'settings' && (
            <div className="max-w-full mx-auto space-y-8 animate-in fade-in duration-500 px-0 md:px-0">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <User className="text-indigo-600" size={24} />
                    Account Settings
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Manage your administrative profile and credentials.</p>
                </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="j.doe@gov.rw" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                      <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" disabled defaultValue="Ministry of Planning" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                      <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" disabled defaultValue="Strategic Planning Officer" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Notifications</h4>
                    <p className="text-xs text-slate-500">Configure alert rules.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Security</h4>
                    <p className="text-xs text-slate-500">MFA & Password changes.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Data Logs</h4>
                    <p className="text-xs text-slate-500">Audit trails of entries.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <BarChart3 size={24} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pillars</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{pillars.length}</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <Target size={24} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Indicators</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{stats.count}</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                      <LayoutDashboard size={24} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg Completion</span>
                  </div>
                  <div className="text-4xl font-black text-slate-900">{stats.avg.toFixed(1)}%</div>
                </div>
              </div>

              {pillars.map(pillar => (
                <div key={pillar.id} className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
                    {pillar.name}
                  </h3>
                  {renderSectors(pillar, true)}
                </div>
              ))}
            </div>
          )}

          {view === 'fill' && (
            selectedTemplateIndex === null ? (
              <div className="max-w-full mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-0 md:px-0">
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">Ready to record progress?</h3>
                  <p className="text-slate-500 text-base md:text-lg">Select an existing Imihigo contract template to begin data entry for all four quarters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {savedTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTemplateIndex(idx)}
                      className="text-left bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:ring-4 hover:ring-indigo-50 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ClipboardCheck size={80} />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-3">
                          <ClipboardCheck size={28} />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Structure</span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {template.length} Pillars • {template[0]?.sectors.length || 0} Sectors
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {template[0]?.name || `Contract Template ${idx + 1}`}
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Full performance contract with nested hierarchical indicators. Click to start filling achievement data across all 4 quarters.
                      </p>
                      <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold text-sm">
                        Start Data Entry <ChevronRight size={16} />
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setView('template')}
                    className="flex flex-col items-center justify-center border-3 border-dashed border-slate-200 rounded-3xl p-10 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="p-5 bg-slate-100 rounded-3xl mb-4 group-hover:bg-indigo-100 transition-all">
                      <FilePlus size={40} />
                    </div>
                    <span className="text-lg font-black tracking-tight">Create New Template</span>
                    <span className="text-sm mt-1">If no existing contracts match</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
                <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-indigo-300">
                      <ClipboardCheck size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Full Performance Entry Form</span>
                    </div>
                    <h3 className="text-4xl font-black tracking-tight mb-2">
                      {pillars[0]?.name}
                    </h3>
                    <p className="text-indigo-200 text-lg max-w-2xl">
                      Filling mode enabled. All four quarters are now editable. Please provide achievement figures for each indicator below.
                    </p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 opacity-10">
                    <ClipboardCheck size={240} />
                  </div>
                </div>

                {pillars.map(pillar => (
                  <div key={pillar.id} className="space-y-8">
                    <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4 py-4 sticky top-20 bg-slate-50 z-10 border-b border-slate-100">
                      <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                      {pillar.name}
                    </h3>
                    {renderSectors(pillar, false)}
                  </div>
                ))}

                <div className="bg-white p-6 md:p-10 rounded-3xl border-2 border-emerald-100 flex flex-col items-center text-center shadow-xl shadow-emerald-900/5">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                    <CheckCircle size={24} className="md:size-8" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Ready to finalize?</h4>
                  <p className="text-slate-500 max-w-md mb-6 md:mb-8 text-sm md:text-base">All entries are auto-saved. You can return to the dashboard to see the updated roll-up calculations.</p>
                  <button
                    onClick={() => setView('dashboard')}
                    className="px-6 py-3 md:px-10 md:py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all transform hover:-translate-y-1"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );

  function renderSectors(pillar: Pillar, readonly: boolean) {
    return pillar.sectors.map(sector => (
      <div key={sector.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <button
          onClick={() => toggleSector(sector.id)}
          className={`w-full px-8 py-6 flex items-center justify-between transition-colors ${expandedSectors.includes(sector.id) ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-6">
            <span className={`p-3 rounded-2xl transition-all ${expandedSectors.includes(sector.id) ? 'bg-indigo-600 text-white rotate-90' : 'bg-indigo-50 text-indigo-600'}`}>
              <ChevronRight size={24} />
            </span>
            <div className="text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Sector</span>
              <span className="text-xl font-black text-slate-800">{sector.name}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">
              {sector.outcomes.length} Outcomes
            </span>
          </div>
        </button>

        {expandedSectors.includes(sector.id) && (
          <div className="p-8 space-y-12 bg-slate-50/20">
            {sector.outcomes.map(outcome => (
              <div key={outcome.id} className="space-y-8">
                <div className="border-l-4 border-indigo-500 pl-6 py-2">
                  <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block mb-1">Strategic Outcome</span>
                  <h4 className="font-black text-slate-800 text-2xl tracking-tight leading-tight">{outcome.name}</h4>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {outcome.outputs.map(output => (
                    <div key={output.id} className="space-y-4">
                      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Output</span>
                        <h5 className="font-bold text-slate-700 text-sm italic">{output.name}</h5>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {output.indicators.map(ind => (
                          <IndicatorCard
                            key={ind.id}
                            indicator={ind}
                            onUpdate={handleIndicatorUpdate}
                            isFillMode={!readonly}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  }
};

export default App;
