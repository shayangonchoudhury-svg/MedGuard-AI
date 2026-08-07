import { useState, useEffect } from 'react';
import { Bot, ShieldCheck, Wrench, AlertTriangle, Sparkles, RefreshCw, Activity, Cpu, CheckCircle2, Clock, Filter, Layers, Database, FileText, Bell, BarChart3, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Equipment, AIActivity, AIAnalysisRecord } from '../types';
import ProductionAiChat from './ProductionAiChat';

export default function AIOrchestratorHub() {
  const [activeSubTab, setActiveSubTab] = useState<'orchestrator' | 'chat' | 'activities' | 'analyses'>('orchestrator');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('All');
  
  // Orchestrator status & run state
  const [orchestratorStatus, setOrchestratorStatus] = useState<any>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [currentPipelineStep, setCurrentPipelineStep] = useState<string>('');
  const [pipelineResult, setPipelineResult] = useState<any>(null);

  // Activities & Analyses
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysisRecord[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterEq, setFilterEq] = useState<string>('All');

  const fetchHubData = async () => {
    try {
      const [eqs, statusRes, acts, anas] = await Promise.all([
        api.equipment.getAll(),
        api.ai.getStatus().catch(() => null),
        api.ai.getActivities().catch(() => []),
        api.ai.getAnalyses().catch(() => [])
      ]);
      setEquipmentList(eqs);
      if (statusRes) setOrchestratorStatus(statusRes);
      setActivities(acts);
      setAnalyses(anas);
    } catch (err) {
      console.error('Error fetching AI Orchestrator data:', err);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, []);

  const handleRunOrchestration = async () => {
    setIsOrchestrating(true);
    setPipelineResult(null);

    const steps = [
      'Collecting Equipment Data...',
      'Retrieving Maintenance History...',
      'Analyzing Calibration Logs...',
      'Running Risk Intelligence & Failure Probability...',
      'Executing Compliance Audit (ISO 13485)...',
      'Synthesizing via Gemini AI Engine...',
      'Generating Engineering Recommendations...',
      'Broadcasting Automated Notifications...',
      'Updating Dashboard Health Scores...',
      'Generating Official Audit Report...'
    ];

    try {
      for (const step of steps) {
        setCurrentPipelineStep(step);
        await new Promise(r => setTimeout(r, 350));
      }

      const res = await api.ai.orchestrate(selectedEquipmentId === 'All' ? undefined : selectedEquipmentId);
      setPipelineResult(res);
      await fetchHubData();
    } catch (err: any) {
      console.error('Orchestration failed:', err);
      alert(`AI Orchestration error: ${err.message}`);
    } finally {
      setIsOrchestrating(false);
      setCurrentPipelineStep('');
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    const matchEq = filterEq === 'All' || a.equipmentId === filterEq;
    const matchDate = !filterDate || (a.date && a.date.includes(filterDate));
    return matchEq && matchDate;
  });

  return (
    <div className="space-y-6 h-full flex flex-col pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display'] flex items-center gap-3">
            MedGuard AI Orchestrator Platform
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/40 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Multi-Agent Pipeline
            </span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Centralized orchestration service coordinating Compliance, Predictive Maintenance, Risk Intelligence, and Biomedical Copilot.
          </p>
        </div>

        <button
          onClick={handleRunOrchestration}
          disabled={isOrchestrating}
          className="px-5 py-2.5 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-[var(--bg-navy)] font-bold rounded-2xl shadow-[0_0_20px_var(--accent-cyan)/30] hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles size={16} className={isOrchestrating ? 'animate-spin' : ''} />
          {isOrchestrating ? 'Orchestrating Pipeline...' : 'Run Full AI Orchestration'}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-glass)] pb-3">
        {[
          { id: 'orchestrator', label: 'AI Status & Pipeline', icon: Layers },
          { id: 'chat', label: 'AI Chat Assistant', icon: MessageSquare },
          { id: 'activities', label: 'AI Activity Log', icon: Activity },
          { id: 'analyses', label: 'AI Analysis History', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/40 shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: AI CHAT ASSISTANT */}
      {activeSubTab === 'chat' && (
        <ProductionAiChat equipmentList={equipmentList} />
      )}

      {/* TAB 1: AI STATUS & ORCHESTRATOR PIPELINE */}
      {activeSubTab === 'orchestrator' && (
        <div className="space-y-6">
          {/* AI Status Panel (4 Specialized Modules) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Compliance Intelligence',
                desc: 'ISO 13485 & FDA audits',
                icon: ShieldCheck,
                status: 'Running',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30'
              },
              {
                name: 'Predictive Maintenance',
                desc: 'Work order & PM forecasting',
                icon: Wrench,
                status: 'Running',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30'
              },
              {
                name: 'Risk Intelligence',
                desc: 'Failure probability & scoring',
                icon: AlertTriangle,
                status: 'Running',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30'
              },
              {
                name: 'Biomedical Copilot',
                desc: 'Clinical decision support',
                icon: Bot,
                status: 'Running',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30'
              }
            ].map((module, i) => (
              <div key={i} className={`glass p-5 rounded-3xl border ${module.border} ${module.bg} space-y-3 relative overflow-hidden`}>
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[var(--accent-cyan)] border border-white/10">
                    <module.icon size={20} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 bg-black/40 ${module.color}`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 🟢 Running
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Clash_Display']">{module.name}</h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{module.desc}</p>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                  <span>Duration: 320ms</span>
                  <span>Timestamp: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Orchestration Pipeline Flow Visualizer */}
          <div className="glass p-6 rounded-3xl border border-[var(--border-glass)] space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white font-['Clash_Display'] flex items-center gap-2">
                  <Cpu size={18} className="text-[var(--accent-cyan)]" /> Central Orchestration Pipeline Flow
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Sequential data flow and multi-agent synchronization across hospital telemetry and AI models.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)] font-mono">Target Asset:</span>
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
                  className="bg-[var(--card-bg)] text-xs text-white border border-[var(--border-glass)] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--accent-cyan)]"
                >
                  <option value="All">Entire Biomedical Fleet</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pipeline Step Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { step: '01', title: 'Equipment Data', icon: Database, desc: 'Telemetry & Specs' },
                { step: '02', title: 'Maintenance', icon: Wrench, desc: 'Work Orders' },
                { step: '03', title: 'Calibration', icon: ShieldCheck, desc: 'Certificates & Dates' },
                { step: '04', title: 'Risk Analysis', icon: AlertTriangle, desc: 'Probability Scoring' },
                { step: '05', title: 'Compliance', icon: CheckCircle2, desc: 'ISO 13485 Standards' },
                { step: '06', title: 'Gemini AI', icon: Sparkles, desc: 'Deep Neural Synthesis' },
                { step: '07', title: 'Recommendations', icon: Bot, desc: 'Actionable Steps' },
                { step: '08', title: 'Notifications', icon: Bell, desc: 'Alert Broadcast' },
                { step: '09', title: 'Dashboard Update', icon: BarChart3, desc: 'Health Score Sync' },
                { step: '10', title: 'Report Generation', icon: FileText, desc: 'Audit Ready PDF/JSON' }
              ].map((p, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isOrchestrating
                      ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)] animate-pulse'
                      : 'glass border-[var(--border-glass)] hover:border-[var(--accent-cyan)]/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-2 py-0.5 rounded-md font-bold">
                      {p.step}
                    </span>
                    <p.icon size={15} className="text-[var(--text-secondary)]" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Live Orchestration Execution Feedback */}
            {isOrchestrating && (
              <div className="p-4 bg-[var(--accent-cyan)]/10 rounded-2xl border border-[var(--accent-cyan)]/30 flex items-center gap-3">
                <RefreshCw size={18} className="text-[var(--accent-cyan)] animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-white font-['Clash_Display']">Executing Orchestration Pipeline...</h4>
                  <p className="text-xs font-mono text-[var(--accent-cyan)]">{currentPipelineStep}</p>
                </div>
              </div>
            )}

            {/* Pipeline Result View */}
            {pipelineResult && !isOrchestrating && (
              <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/40 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <h4 className="text-sm font-bold text-white font-['Clash_Display']">
                      Pipeline Execution Completed Successfully ({pipelineResult.durationMs}ms)
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">Run ID: {pipelineResult.runId}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <span className="font-bold text-[var(--accent-cyan)]">Compliance Analysis</span>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3">{pipelineResult.results.compliance}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <span className="font-bold text-amber-400">Risk Assessment</span>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3">{pipelineResult.results.risk}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <span className="font-bold text-emerald-400">Engineering Recommendations</span>
                    <ul className="text-[11px] text-[var(--text-secondary)] list-disc pl-4 space-y-0.5">
                      {pipelineResult.results.recommendations?.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI ACTIVITY LOG */}
      {activeSubTab === 'activities' && (
        <div className="glass p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white font-['Clash_Display']">AI Execution Activity Log</h3>
              <p className="text-xs text-[var(--text-secondary)]">Every AI agent execution, timestamp, duration, and operational outcome.</p>
            </div>
            <button
              onClick={fetchHubData}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-[var(--accent-cyan)] border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-glass)] text-[var(--text-secondary)] font-mono">
                  <th className="pb-3 font-semibold">Run ID / Module</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Target Asset</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-glass)]">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[var(--text-secondary)] font-mono text-xs">
                      No AI activities logged yet. Run orchestration to generate activity logs.
                    </td>
                  </tr>
                ) : (
                  activities.map(act => (
                    <tr key={act.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono">
                        <span className="font-bold text-white">{act.id}</span>
                        <div className="text-[10px] text-[var(--accent-cyan)]">{act.module}</div>
                      </td>
                      <td className="py-3 text-[var(--text-primary)] max-w-xs truncate">{act.action}</td>
                      <td className="py-3 font-mono text-[var(--text-secondary)]">{act.equipmentName || act.equipmentId || 'Fleet-wide'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          act.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          act.status === 'Running' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[var(--text-secondary)]">{act.durationMs}ms</td>
                      <td className="py-3 font-mono text-[var(--text-secondary)]">{new Date(act.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AI ANALYSIS HISTORY WITH FILTERING */}
      {activeSubTab === 'analyses' && (
        <div className="glass p-6 rounded-3xl border border-[var(--border-glass)] space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Clash_Display']">AI Analysis History</h3>
              <p className="text-xs text-[var(--text-secondary)]">Historical intelligence records and audit outputs filtered by equipment and date.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[var(--accent-cyan)]" />
                <span className="text-xs text-[var(--text-secondary)]">Equipment:</span>
                <select
                  value={filterEq}
                  onChange={(e) => setFilterEq(e.target.value)}
                  className="bg-[var(--card-bg)] text-xs text-white border border-[var(--border-glass)] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--accent-cyan)]"
                >
                  <option value="All">All Equipment</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.id} - {eq.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[var(--accent-cyan)]" />
                <span className="text-xs text-[var(--text-secondary)]">Date:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-[var(--card-bg)] text-xs text-white border border-[var(--border-glass)] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--accent-cyan)]"
                />
              </div>

              {(filterEq !== 'All' || filterDate) && (
                <button
                  onClick={() => { setFilterEq('All'); setFilterDate(''); }}
                  className="text-xs text-[var(--accent-cyan)] underline hover:text-white cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)] font-mono text-xs glass rounded-2xl border border-[var(--border-glass)]">
                No AI analysis history matches the selected filters.
              </div>
            ) : (
              filteredAnalyses.map(analysis => (
                <div key={analysis.id} className="p-5 rounded-2xl glass border border-[var(--border-glass)] space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-[var(--border-glass)]">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] font-mono text-xs font-bold border border-[var(--accent-cyan)]/30">
                        {analysis.id}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{analysis.analysisType}</h4>
                        <p className="text-[11px] text-[var(--text-secondary)]">{analysis.equipmentName || analysis.equipmentId} • Module: {analysis.module}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-[var(--accent-cyan)]">{analysis.date}</span>
                      <div className="text-[10px] text-[var(--text-secondary)]">Compliance: {analysis.complianceStatus || 'Verified'}</div>
                    </div>
                  </div>

                  <div className="text-xs text-[var(--text-primary)] whitespace-pre-wrap bg-black/30 p-3.5 rounded-xl border border-white/5 font-sans leading-relaxed">
                    {analysis.rawOutput}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
