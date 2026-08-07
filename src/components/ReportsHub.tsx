import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, ShieldCheck, Wrench, AlertTriangle, BarChart3,
  Download, RefreshCw, Eye, Trash2, Database, Search, Filter,
  CheckCircle2, Clock, Sparkles, Printer, FileSpreadsheet, Layers,
  ChevronRight, ArrowUpRight, Check, X, ShieldAlert, Cpu
} from 'lucide-react';
import { ReportRecord, Equipment } from '../types';
import { api } from '../services/api';

interface Props {
  reportsList: ReportRecord[];
  equipmentList: Equipment[];
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export default function ReportsHub({ reportsList, equipmentList, onRefresh, isLoading }: Props) {
  const [selectedType, setSelectedType] = useState<'All' | 'Compliance' | 'Maintenance' | 'Risk' | 'Executive Summary'>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [forceRegenerate, setForceRegenerate] = useState<boolean>(false);
  
  // Generation & Modal States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingProgress, setGeneratingProgress] = useState<number>(0);
  const [generatingStep, setGeneratingStep] = useState<string>('');
  const [activeReport, setActiveReport] = useState<ReportRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Parse active report JSON payload if available
  const activeReportData = activeReport?.contentJson ? JSON.parse(activeReport.contentJson) : null;

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleGenerateReport = async (reportType: 'Compliance' | 'Maintenance' | 'Risk' | 'Executive Summary') => {
    setIsGenerating(true);
    setGeneratingProgress(15);
    setGeneratingStep(`Extracting ${selectedDept} biomedical telemetry from Cloud SQL...`);

    try {
      await new Promise(r => setTimeout(r, 400));
      setGeneratingProgress(45);
      setGeneratingStep(`Calculating ${reportType} KPIs, risk indices, and audit compliance...`);

      await new Promise(r => setTimeout(r, 400));
      setGeneratingProgress(80);
      setGeneratingStep('Formatting report document & checking database cache...');

      const response = await api.reports.generate({
        type: reportType,
        department: selectedDept,
        forceRegenerate,
        generatedBy: 'Biomedical AI Engine'
      });

      setGeneratingProgress(100);
      await new Promise(r => setTimeout(r, 300));
      setIsGenerating(false);

      await onRefresh();

      setActiveReport(response);
      setViewModalOpen(true);

      if (response.isCached) {
        showNotification(`Report retrieved instantly from Cloud SQL cache!`, 'info');
      } else {
        showNotification(`New ${reportType} Report generated and saved to database!`, 'success');
      }

    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setIsGenerating(false);
      showNotification('Failed to generate report. Please try again.', 'error');
    }
  };

  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this stored report?')) return;
    try {
      await api.reports.delete(id);
      await onRefresh();
      if (activeReport?.id === id) {
        setViewModalOpen(false);
        setActiveReport(null);
      }
      showNotification('Report removed from database history.', 'info');
    } catch (err) {
      console.error('Failed to delete report:', err);
      showNotification('Failed to delete report.', 'error');
    }
  };

  const handleDownloadCSV = (rep: ReportRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(`/api/reports/${rep.id}/download?format=csv`, '_blank');
    showNotification(`Downloading ${rep.title} as CSV...`, 'info');
  };

  const handleDownloadJSON = (rep: ReportRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(`/api/reports/${rep.id}/download?format=json`, '_blank');
    showNotification(`Downloading ${rep.title} raw JSON...`, 'info');
  };

  const handlePrintDocument = () => {
    window.print();
  };

  // Filtered Reports
  const filteredReports = reportsList.filter(rep => {
    const matchesType = selectedType === 'All' || rep.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesDept = selectedDept === 'All Departments' || rep.department === selectedDept || !rep.department;
    const matchesQuery = !searchQuery || rep.title.toLowerCase().includes(searchQuery.toLowerCase()) || rep.generatedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesDept && matchesQuery;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-medium text-xs ${
              notification.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' :
              notification.type === 'info' ? 'bg-cyan-950/80 border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)]' :
              'bg-red-950/80 border-red-500/40 text-red-300'
            }`}
          >
            <Sparkles size={16} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 shadow-lg shadow-[var(--accent-cyan)]/10">
              <FileText size={24} />
            </div>
            <h1 className="text-2xl font-bold font-['Clash_Display']">Report Generation Hub</h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Generate, cache, and download official biomedical compliance, maintenance, risk, and executive board reports.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--card-bg)] px-3 py-2 rounded-xl border border-[var(--border-glass)]">
            <Database size={14} className="text-[var(--accent-cyan)]" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-semibold"
            >
              <option value="All Departments" className="bg-[var(--bg-navy)]">All Departments</option>
              <option value="ICU" className="bg-[var(--bg-navy)]">ICU</option>
              <option value="Emergency" className="bg-[var(--bg-navy)]">Emergency</option>
              <option value="Cardiology" className="bg-[var(--bg-navy)]">Cardiology</option>
              <option value="Radiology" className="bg-[var(--bg-navy)]">Radiology</option>
              <option value="Operation Theatre" className="bg-[var(--bg-navy)]">Operation Theatre</option>
            </select>
          </div>

          <button
            onClick={() => setForceRegenerate(!forceRegenerate)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
              forceRegenerate
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border-glass)] hover:text-white'
            }`}
            title="Toggle whether to bypass Cloud SQL report cache"
          >
            <RefreshCw size={14} className={forceRegenerate ? 'spin-slow' : ''} />
            <span>{forceRegenerate ? 'Bypass Cache: ON' : 'Cache: Auto'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl glass hover:border-[var(--accent-cyan)]/40 text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-all cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Generating Progress Bar Modal / Overlay */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl border border-[var(--accent-cyan)]/40 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)]">
                <Cpu size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-['Clash_Display']">Generating Report Payload</h4>
                <p className="text-xs text-[var(--text-secondary)]">{generatingStep}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[var(--accent-cyan)] font-mono">{generatingProgress}%</span>
          </div>
          <div className="w-full bg-[var(--card-bg)] h-2 rounded-full overflow-hidden border border-[var(--border-glass)]">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--accent-cyan)] to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${generatingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Report Generation Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Compliance Report */}
        <div className="glass p-5 rounded-2xl border border-[var(--border-glass)] hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck size={22} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FDA / ISO 13485
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm font-['Clash_Display'] group-hover:text-emerald-400 transition-colors">
                Compliance Report
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Calibration validation, certification coverage %, missing documentation audit, and regulatory inspection readiness.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('Compliance')}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-navy-950 font-bold text-xs border border-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Generate Report</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 2. Maintenance Report */}
        <div className="glass p-5 rounded-2xl border border-[var(--border-glass)] hover:border-[var(--accent-cyan)]/50 transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 group-hover:scale-105 transition-transform">
                <Wrench size={22} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20">
                Preventive & Repair
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm font-['Clash_Display'] group-hover:text-[var(--accent-cyan)] transition-colors">
                Maintenance Report
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                PM task completion rate, equipment downtime hours, work order breakdown, and engineer workload stats.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('Maintenance')}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)] text-[var(--accent-cyan)] hover:text-[var(--bg-navy)] font-bold text-xs border border-[var(--accent-cyan)]/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Generate Report</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 3. Risk & Aging Report */}
        <div className="glass p-5 rounded-2xl border border-[var(--border-glass)] hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <AlertTriangle size={22} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Vulnerability Index
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm font-['Clash_Display'] group-hover:text-amber-400 transition-colors">
                Risk & Aging Report
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Critical device status, predictive failure risks, life-support asset age (&gt;8 yrs), and safety alerts.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('Risk')}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-navy-950 font-bold text-xs border border-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Generate Report</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 4. Executive Summary Report */}
        <div className="glass p-5 rounded-2xl border border-[var(--border-glass)] hover:border-purple-500/50 transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <BarChart3 size={22} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Board Level
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm font-['Clash_Display'] group-hover:text-purple-400 transition-colors">
                Executive Summary
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                High-level operational overview, fleet health score, downtime impact, and strategic engineering decisions.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('Executive Summary')}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white font-bold text-xs border border-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Generate Report</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Database Caching Banner */}
      <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-glass)] flex items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]">
            <Database size={16} />
          </div>
          <div>
            <span className="font-bold text-white mr-1">Cloud SQL Report Caching Engine:</span>
            <span>Reports generated within 24 hours are cached in the database for sub-second retrieval. Toggle "Bypass Cache" above to force live recalculation.</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/20">
            {reportsList.filter(r => r.isCached || r.status === 'Cached').length} Cached
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] font-mono font-bold text-[10px] border border-[var(--accent-cyan)]/20">
            {reportsList.length} Total Stored
          </span>
        </div>
      </div>

      {/* Report History Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-['Clash_Display'] flex items-center gap-2">
              <Clock size={18} className="text-[var(--accent-cyan)]" />
              Stored Report Generation History
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Historical report archive synced with Cloud SQL. Select any item to view or download.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search report titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[var(--card-bg)] rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)] w-48"
              />
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border-glass)] text-[11px]">
              {(['All', 'Compliance', 'Maintenance', 'Risk', 'Executive Summary'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                    selectedType === type
                      ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="glass rounded-2xl border border-[var(--border-glass)] overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-secondary)] space-y-3">
              <FileText size={36} className="mx-auto text-[var(--text-secondary)]/50" />
              <p className="text-sm font-semibold">No report records found matching filter criteria.</p>
              <p className="text-xs text-[var(--text-secondary)]/80">Click any card above to generate a new report.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-glass)] bg-[var(--card-bg)]/50 text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Report Title</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Generated By</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status & Cache</th>
                    <th className="py-3.5 px-4">File Size</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-glass)]">
                  {filteredReports.map((rep) => {
                    const isCached = rep.isCached || rep.status === 'Cached';
                    return (
                      <tr
                        key={rep.id}
                        onClick={() => {
                          setActiveReport(rep);
                          setViewModalOpen(true);
                        }}
                        className="hover:bg-[var(--card-bg)]/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-white group-hover:text-[var(--accent-cyan)] transition-colors">
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-[var(--accent-cyan)] flex-shrink-0" />
                            <span>{rep.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            rep.type.includes('Compliance') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            rep.type.includes('Maintenance') ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/20' :
                            rep.type.includes('Risk') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {rep.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium">
                          {rep.department || 'All Departments'}
                        </td>
                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                          {rep.generatedBy}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                          {rep.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCached
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCached ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                            {isCached ? 'Cached' : 'Ready'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                          {rep.fileSize || '142.5 KB'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setActiveReport(rep);
                                setViewModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] rounded-lg transition-colors"
                              title="View Interactive Report"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={(e) => handleDownloadCSV(rep, e)}
                              className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                              title="Download CSV Dataset"
                            >
                              <FileSpreadsheet size={15} />
                            </button>
                            <button
                              onClick={(e) => handleDownloadJSON(rep, e)}
                              className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                              title="Download Raw JSON"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteReport(rep.id, e)}
                              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                              title="Delete Report"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Report Viewing & Printing Modal */}
      <AnimatePresence>
        {viewModalOpen && activeReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-md z-50"
              onClick={() => setViewModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-6 bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-[var(--text-primary)]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[var(--border-glass)] flex items-center justify-between bg-[var(--card-bg)]/40 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20">
                    <FileText size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold font-['Clash_Display']">{activeReport.title}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        activeReport.isCached || activeReport.status === 'Cached'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {activeReport.isCached || activeReport.status === 'Cached' ? 'DB Cache Hit' : 'Live Generated'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Report ID: {activeReport.id} • Generated {activeReport.date} by {activeReport.generatedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintDocument}
                    className="px-3 py-2 rounded-xl bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold text-xs hover:shadow-[0_0_12px_var(--accent-cyan)] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={15} /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => handleDownloadCSV(activeReport)}
                    className="px-3 py-2 rounded-xl glass hover:border-emerald-500/40 text-emerald-400 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={15} /> CSV
                  </button>
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="p-2 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="p-8 overflow-y-auto space-y-6 flex-1 text-xs leading-relaxed bg-[var(--bg-navy)] print:p-0 print:bg-white print:text-black">
                {/* Official Header Badge (Visible in Print) */}
                <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold uppercase tracking-wider">Apollo Hospitals Biomedical Operations</h1>
                      <p className="text-xs text-gray-600">MedGuard AI Command Center • Official Engineering Audit</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold">CONFIDENTIAL MEDICAL DOCUMENT</p>
                      <p>Date: {activeReport.date}</p>
                    </div>
                  </div>
                </div>

                {/* Cache Notice Banner */}
                {(activeReport.isCached || activeReport.status === 'Cached') && (
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 flex items-center justify-between gap-3 text-xs print:hidden">
                    <div className="flex items-center gap-2">
                      <Database size={15} className="text-cyan-400" />
                      <span>Loaded from Cloud SQL cache. Generated at {activeReport.cachedAt ? new Date(activeReport.cachedAt).toLocaleTimeString() : 'earlier session'}.</span>
                    </div>
                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        setForceRegenerate(true);
                        handleGenerateReport(activeReport.type as any);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-navy-950 text-cyan-300 font-bold transition-all text-[11px]"
                    >
                      Bypass Cache & Regenerate
                    </button>
                  </div>
                )}

                {/* Executive Summary Narrative */}
                <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-glass)] space-y-2 print:border-gray-300 print:bg-gray-50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-cyan)] print:text-black flex items-center gap-2">
                    <Sparkles size={14} /> Executive Summary & Findings
                  </h3>
                  <p className="text-xs text-[var(--text-primary)] print:text-black leading-relaxed">
                    {activeReportData?.summary || activeReport.summary || 'No narrative text provided.'}
                  </p>
                </div>

                {/* KPI Cards Grid */}
                {activeReportData?.kpis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeReportData.kpis.map((kpi: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)] space-y-1 print:border-gray-300">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] print:text-gray-600">{kpi.label}</span>
                        <div className="text-lg font-bold font-['Clash_Display'] text-white print:text-black">{kpi.value}</div>
                        <span className={`text-[10px] font-bold ${
                          kpi.status === 'Critical' ? 'text-red-400' :
                          kpi.status === 'Attention' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {kpi.change}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations List */}
                {activeReportData?.recommendations && (
                  <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-glass)] space-y-3 print:border-gray-300">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-cyan)] print:text-black flex items-center gap-2">
                      <ShieldAlert size={14} /> Actionable Engineering Recommendations
                    </h3>
                    <ul className="space-y-2 text-xs text-[var(--text-primary)] print:text-black">
                      {activeReportData.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="p-1 rounded bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] print:bg-black print:text-white font-mono text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Audited Asset / Log Table */}
                {activeReportData?.tableRows && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] print:text-black">
                      Detailed Audit Dataset ({activeReportData.tableRows.length} Rows)
                    </h3>
                    <div className="border border-[var(--border-glass)] rounded-xl overflow-hidden print:border-gray-300">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-[var(--card-bg)] text-[var(--text-secondary)] print:bg-gray-200 print:text-black font-semibold text-[10px] border-b border-[var(--border-glass)]">
                              {Object.keys(activeReportData.tableRows[0] || {}).map((col) => (
                                <th key={col} className="py-2.5 px-3 uppercase">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-glass)] print:divide-gray-300">
                            {activeReportData.tableRows.slice(0, 15).map((row: any, rIdx: number) => (
                              <tr key={rIdx} className="hover:bg-[var(--card-bg)]/50">
                                {Object.values(row).map((val: any, cIdx: number) => (
                                  <td key={cIdx} className="py-2.5 px-3 font-medium">
                                    {String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signoff Line (Print View) */}
                <div className="hidden print:flex justify-between items-end pt-12 text-xs text-gray-700">
                  <div>
                    <p className="font-bold">Biomedical Engineering Lead</p>
                    <p className="text-gray-500 font-mono">Dr. Sarah Jenkins, M.D. / BME</p>
                    <div className="w-48 border-b border-gray-400 mt-8" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Hospital Quality & Safety Board</p>
                    <p className="text-gray-500">ISO 13485 Validation Officer</p>
                    <div className="w-48 border-b border-gray-400 mt-8 ml-auto" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
