import { useState, useEffect } from 'react';
import { Bot, ShieldCheck, Wrench, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { aiService } from '../services/aiService';
import { api } from '../services/api';
import { Equipment } from '../types';
import ProductionAiChat from './ProductionAiChat';

const tabs = [
  { name: 'Compliance', icon: ShieldCheck, task: 'compliance' as const },
  { name: 'Maintenance', icon: Wrench, task: 'maintenance' as const },
  { name: 'Risk', icon: AlertTriangle, task: 'risk' as const },
  { name: 'Chat Assistant', icon: Bot, task: 'chat' as const },
];

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState('Compliance');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<Record<string, string>>({});
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  // Fetch live equipment list for Gemini context
  useEffect(() => {
    api.equipment.getAll()
      .then(data => setEquipmentList(data))
      .catch(err => console.warn('Could not fetch equipment list for AI context:', err));
  }, []);

  // Run analysis when switching tabs
  useEffect(() => {
    const currentTabObj = tabs.find(t => t.name === activeTab);
    if (currentTabObj && currentTabObj.task !== 'chat') {
      const taskName = currentTabObj.task;
      if (!analysisText[taskName]) {
        runAnalysis(taskName);
      }
    }
  }, [activeTab]);

  const runAnalysis = async (task: 'compliance' | 'risk' | 'maintenance') => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyze(task, { equipment: equipmentList });
      setAnalysisText(prev => ({ ...prev, [task]: result }));
    } catch (err: any) {
      setAnalysisText(prev => ({ ...prev, [task]: `⚠️ Error generating analysis: ${err.message}` }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentTabObj = tabs.find(t => t.name === activeTab);

  return (
    <div className="space-y-6 h-full flex flex-col pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display'] flex items-center gap-2">
            MedGuard Gemini AI Agent
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/40 font-mono">
              Live Gemini API
            </span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Reusable AI Service powered by Google Gemini for real-time compliance, risk, and maintenance predictions.
          </p>
        </div>
      </div>

      {/* Pill Tabs */}
      <div className="glass p-1.5 rounded-2xl inline-flex border border-[var(--border-glass)] relative self-start">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`relative z-10 px-5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.name
                ? 'text-[var(--bg-navy)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {activeTab === tab.name && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-[var(--accent-cyan)] rounded-xl shadow-[0_0_15px_var(--accent-cyan)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon size={15} /> {tab.name}
            </span>
          </button>
        ))}
      </div>

      {/* Main Display Area */}
      <div className="flex-1 min-h-[500px]">
        {activeTab !== 'Chat Assistant' ? (
          <div className="glass h-full p-6 rounded-3xl border border-[var(--border-glass)] space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-glass)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-cyan)]/10 flex items-center justify-center border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Clash_Display']">
                    {activeTab} AI Intelligence Agent
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Analyzing {equipmentList.length} live database records
                  </p>
                </div>
              </div>
              <button
                onClick={() => currentTabObj && runAnalysis(currentTabObj.task as any)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--card-bg)] hover:bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isAnalyzing ? 'animate-spin' : ''} />
                Refresh Analysis
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 text-sm leading-relaxed text-[var(--text-primary)]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-[var(--text-secondary)]">
                  <div className="flex gap-2">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />
                  </div>
                  <span className="text-xs font-mono">Connecting to Gemini API & analyzing telemetry data...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-sans text-xs space-y-3 p-4 bg-black/20 rounded-2xl border border-[var(--border-glass)]">
                  {analysisText[currentTabObj?.task || 'compliance'] || 'Click Refresh to run analysis.'}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Production Quality Streaming AI Chat Component */
          <ProductionAiChat equipmentList={equipmentList} />
        )}
      </div>
    </div>
  );
}

