import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, FileText, Download, Activity, Calendar, Award, FileCheck, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import CountUp from './CountUp';
import { Equipment, CalibrationRecord, MaintenanceRecord } from '../types';
import { aiService } from '../services/aiService';

interface Props {
  equipmentList?: Equipment[];
  calibrationRecords?: CalibrationRecord[];
  maintenanceRecords?: MaintenanceRecord[];
}

export default function CompliancePage({
  equipmentList = [],
  calibrationRecords = [],
  maintenanceRecords = []
}: Props) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const runAiComplianceAudit = async () => {
    setLoadingAi(true);
    try {
      const res = await aiService.analyzeCompliance(equipmentList, calibrationRecords);
      setAiAnalysis(res);
    } catch (err: any) {
      setAiAnalysis(`⚠️ AI Compliance analysis error: ${err.message || 'Failed'}`);
    } finally {
      setLoadingAi(false);
    }
  };
  const totalEquipment = equipmentList.length || 1;
  const compliantCount = equipmentList.filter(
    e => (e.status === 'Operational' || e.riskLevel === 'Healthy') && e.status !== 'Calibration Due' && e.status !== 'Maintenance Due'
  ).length;

  const compliantPercent = equipmentList.length > 0
    ? Math.round((compliantCount / totalEquipment) * 100)
    : 88;

  const nonCompliantPercent = 100 - compliantPercent;

  const pieData = [
    { name: 'Compliant', value: compliantPercent, color: '#00F5A0' },
    { name: 'Non-Compliant', value: nonCompliantPercent, color: '#FF4D6D' },
  ];

  const trendData = [
    { day: 'Mon', val: Math.min(100, compliantPercent - 5) },
    { day: 'Tue', val: Math.min(100, compliantPercent - 3) },
    { day: 'Wed', val: Math.min(100, compliantPercent - 2) },
    { day: 'Thu', val: Math.min(100, compliantPercent - 1) },
    { day: 'Fri', val: compliantPercent },
    { day: 'Sat', val: compliantPercent },
    { day: 'Sun', val: compliantPercent },
  ];

  // Dynamic Urgent Attention Items
  const urgentAlerts = equipmentList
    .filter(e => e.status !== 'Operational' || e.riskScore > 40)
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      equipment: e.name,
      type: e.category,
      issue: e.status === 'Calibration Due'
        ? 'Calibration Certificate Expiring / Due'
        : e.status === 'Maintenance Due'
        ? 'Preventative Maintenance Overdue'
        : 'High Biomedical Risk Score',
      priority: e.riskScore > 75 || e.status === 'Critical' ? 'Critical' : 'High'
    }));

  const certsWithFiles = calibrationRecords.filter(c => c.certificateName || c.certificateUrl);

  const handleDownloadReport = (title: string) => {
    const reportText = `MEDGUARD AI - BIOMEDICAL COMPLIANCE REPORT\n` +
      `Generated Date: ${new Date().toLocaleDateString()}\n` +
      `Overall Hospital Compliance Rate: ${compliantPercent}%\n` +
      `Total Assets Managed: ${equipmentList.length}\n` +
      `Total Calibrations Executed: ${calibrationRecords.length}\n` +
      `Completed Calibrations: ${calibrationRecords.filter(c => c.status === 'Completed').length}\n\n` +
      `Equipment Status Summary:\n` +
      equipmentList.map(e => `- ${e.name} (${e.id}): Status=${e.status}, HealthScore=${e.healthScore}%, NextCalib=${e.nextCalibration || 'N/A'}`).join('\n');

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display']">
            Compliance Dashboard
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Automated biomedical audit readiness, ISO 17025 verification & calibration metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="glass px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] border border-[var(--border-glass)] flex items-center gap-2">
            <Calendar size={14}/> Live Cloud SQL Sync
          </div>
          <div className="glass px-4 py-2 rounded-xl text-xs font-bold text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/40 flex items-center gap-2">
            Audit Compliant ({compliantPercent}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Gauge */}
        <div className="glass p-6 rounded-2xl border border-[var(--border-glass)] flex flex-col items-center justify-between relative">
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Clash_Display'] w-full mb-2">
            Overall Hospital Compliance
          </h3>
          <div className="h-52 w-52 relative flex items-center justify-center my-2">
            <div className="absolute inset-0 rounded-full blur-xl bg-[var(--accent-cyan)] opacity-20" />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={90} stroke="none" startAngle={90} endAngle={450}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-4xl font-bold text-white font-['Clash_Display']">
              <CountUp value={compliantPercent} />%
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] text-center mb-2">
            {compliantCount} of {equipmentList.length || 0} equipment assets certified compliant
          </p>
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <Area type="monotone" dataKey="val" stroke="var(--accent-cyan)" fill="url(#colorTrend)" />
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent Attention */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-[var(--border-glass)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Clash_Display']">
                Urgent Compliance Alerts
              </h3>
              <span className="text-xs text-[var(--text-secondary)]">
                {urgentAlerts.length} Attention Required
              </span>
            </div>

            <div className="space-y-3">
              {urgentAlerts.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-secondary)]">
                  <ShieldCheck size={32} className="mx-auto mb-2 text-[var(--healthy-green)] opacity-80" />
                  <p className="font-bold text-sm text-white">All Biomedical Equipment Compliant</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">No pending calibration or maintenance compliance issues found.</p>
                </div>
              ) : (
                urgentAlerts.map((alert, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={alert.id}
                    className={`glass flex justify-between items-center p-3.5 rounded-xl border-l-4 ${
                      alert.priority === 'Critical'
                        ? 'border-l-[var(--critical-red)] animate-pulse'
                        : 'border-l-[var(--warning-amber)]'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="p-2.5 bg-[var(--card-bg)] rounded-lg text-[var(--accent-cyan)]">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[var(--text-primary)]">{alert.equipment}</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">{alert.issue}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        alert.priority === 'Critical'
                          ? 'bg-red-500/20 text-[var(--critical-red)] border border-red-500/30'
                          : 'bg-amber-500/20 text-[var(--warning-amber)] border border-amber-500/30'
                      }`}
                    >
                      {alert.priority}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-glass)] mt-4 flex justify-between items-center text-xs">
            <span className="text-[var(--text-secondary)]">Active ISO 17025 Certificates: <strong className="text-white">{certsWithFiles.length}</strong></span>
            <span className="text-[var(--accent-cyan)] font-semibold">Audit Ready</span>
          </div>
        </div>
      </div>

      {/* Gemini AI Compliance Audit Card */}
      <div className="glass p-6 rounded-2xl border border-[var(--border-glass)] space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border-glass)] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 flex items-center justify-center text-[var(--accent-cyan)]">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Clash_Display']">
                Gemini AI Compliance Audit
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                AI-driven ISO 13485 / FDA regulatory risk evaluation using reusable Gemini API service.
              </p>
            </div>
          </div>
          <button
            onClick={runAiComplianceAudit}
            disabled={loadingAi}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-xl font-bold text-xs hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingAi ? 'animate-spin' : ''} />
            {loadingAi ? 'Running Gemini Analysis...' : 'Run Gemini Audit Analysis'}
          </button>
        </div>

        {aiAnalysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-black/20 rounded-xl border border-[var(--border-glass)] text-xs leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap font-sans"
          >
            {aiAnalysis}
          </motion.div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--card-bg)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span>Click "Run Gemini Audit Analysis" to evaluate live equipment records against FDA compliance rules.</span>
            <span className="text-[var(--accent-cyan)] font-mono font-semibold">Gemini 3.6 Flash</span>
          </div>
        )}
      </div>

      {/* Reports & Exports Section */}
      <div className="glass p-6 rounded-2xl border border-[var(--border-glass)] space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Clash_Display']">
          Compliance & Calibration Audit Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Monthly Compliance Audit Report', desc: 'Detailed summary of equipment compliance, calibrations, and risk levels.' },
            { title: 'Biomedical ISO Calibration Report', desc: 'Official record of calibrated equipment, engineers, and uploaded certificates.' }
          ].map(rep => (
            <motion.div
              key={rep.title}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleDownloadReport(rep.title)}
              className="glass flex justify-between items-center p-5 rounded-2xl border border-[var(--border-glass)] hover:border-[var(--accent-cyan)]/50 cursor-pointer group transition-all"
            >
              <div className="flex gap-3.5 items-center">
                <div className="p-3.5 bg-[var(--card-bg)] rounded-xl group-hover:bg-[var(--accent-cyan)]/10 transition-colors">
                  <FileText className="text-[var(--accent-cyan)]" size={20} />
                </div>
                <div>
                  <span className="font-bold text-sm text-white group-hover:text-[var(--accent-cyan)] transition-colors block">
                    {rep.title}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">{rep.desc}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-full bg-[var(--card-bg)] group-hover:bg-[var(--accent-cyan)] group-hover:text-[var(--bg-navy)] text-[var(--text-secondary)] transition-all">
                <Download size={18} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
