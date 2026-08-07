import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench, Calendar as CalendarIcon, Clock, UserCheck, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, Plus, Search, Filter, CalendarDays,
  ListFilter, Trash2, Edit3, ShieldAlert, ArrowRight
} from 'lucide-react';
import { MaintenanceRecord, Equipment } from '../types';
import ScheduleMaintenanceModal from './ScheduleMaintenanceModal';
import RescheduleMaintenanceModal from './RescheduleMaintenanceModal';
import AssignEngineerModal from './AssignEngineerModal';

interface Props {
  records: MaintenanceRecord[];
  equipmentList: Equipment[];
  onSchedule: (record: Omit<MaintenanceRecord, 'id' | 'status'>) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string, newDate: string, newTime?: string) => void;
  onAssignEngineer: (id: string, engineer: string) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function MaintenanceCalendar({
  records = [],
  equipmentList = [],
  onSchedule,
  onComplete,
  onCancel,
  onReschedule,
  onAssignEngineer,
  onDelete,
  onRefresh,
  isLoading
}: Props) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [rescheduleRecord, setRescheduleRecord] = useState<MaintenanceRecord | null>(null);
  const [assignRecord, setAssignRecord] = useState<MaintenanceRecord | null>(null);

  // Selected Month for Calendar View
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Filtered records
  const filteredRecords = records.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    const matchesSearch =
      r.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.engineer && r.engineer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Stats
  const totalJobs = records.length;
  const scheduledCount = records.filter(r => r.status === 'Scheduled' || r.status === 'Rescheduled' || r.status === 'In Progress').length;
  const completedCount = records.filter(r => r.status === 'Completed').length;
  const cancelledCount = records.filter(r => r.status === 'Cancelled').length;
  const highPriorityCount = records.filter(r => (r.priority === 'High' || r.priority === 'Critical') && r.status !== 'Completed').length;

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-500/20 text-[var(--critical-red)] border-red-500/30';
      case 'High':
        return 'bg-amber-500/20 text-[var(--warning-amber)] border-amber-500/30';
      case 'Medium':
        return 'bg-cyan-500/20 text-[var(--accent-cyan)] border-cyan-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/10';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Completed':
        return 'bg-green-500/20 text-[var(--healthy-green)] border-green-500/30';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Rescheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/20 text-[var(--warning-amber)] border-amber-500/30';
    }
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display']">
            Maintenance Hub
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real-time Cloud SQL equipment maintenance scheduling, assignments & execution tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 glass hover:bg-[var(--card-bg)] text-xs text-[var(--accent-cyan)] border border-[var(--border-glass)] rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          )}
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--accent-cyan)] to-blue-600 text-[var(--bg-navy)] rounded-xl font-bold text-xs hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all cursor-pointer"
          >
            <Plus size={16} /> Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Jobs', val: totalJobs, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Active Scheduled', val: scheduledCount, color: 'text-[var(--warning-amber)]', bg: 'bg-amber-500/10' },
          { label: 'Completed', val: completedCount, color: 'text-[var(--healthy-green)]', bg: 'bg-green-500/10' },
          { label: 'Cancelled', val: cancelledCount, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Urgent / High Priority', val: highPriorityCount, color: 'text-[var(--critical-red)]', bg: 'bg-red-500/20' }
        ].map((st, idx) => (
          <motion.div
            key={st.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`glass p-4 rounded-2xl border border-[var(--border-glass)] ${st.bg}`}
          >
            <p className="text-[11px] text-[var(--text-secondary)] font-medium mb-1">{st.label}</p>
            <p className={`text-2xl font-bold ${st.color}`}>{st.val}</p>
          </motion.div>
        ))}
      </div>

      {/* Control Bar: Search, Filters, View Mode Toggle */}
      <div className="glass p-3 rounded-2xl border border-[var(--border-glass)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Search by Equipment, ID, Engineer, or Notes..."
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border-glass)]">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)]'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <ListFilter size={14} /> Table View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)]'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <CalendarDays size={14} /> Calendar View
          </button>
        </div>
      </div>

      {/* MAIN VIEW CONTENT */}
      {viewMode === 'list' ? (
        /* TABLE / LIST VIEW */
        <div className="glass rounded-2xl border border-[var(--border-glass)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-primary)]">
              <thead className="bg-[var(--card-bg)]/80 text-[var(--text-secondary)] font-semibold border-b border-[var(--border-glass)]">
                <tr>
                  <th className="p-4">Equipment & ID</th>
                  <th className="p-4">Assigned Engineer</th>
                  <th className="p-4">Schedule & Time</th>
                  <th className="p-4">Priority & Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-glass)]/50">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-[var(--text-secondary)]">
                      <Wrench size={32} className="mx-auto mb-2 opacity-30 text-[var(--accent-cyan)]" />
                      <p className="font-semibold text-sm">No maintenance records found</p>
                      <p className="text-[11px] text-[var(--text-secondary)]/80 mt-1">Try adjusting search filters or schedule a new maintenance job.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[var(--card-bg)]/40 transition-colors"
                    >
                      {/* Equipment */}
                      <td className="p-4">
                        <p className="font-bold text-sm text-[var(--text-primary)]">{rec.equipmentName}</p>
                        <span className="text-[10px] text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-1.5 py-0.5 rounded font-mono border border-[var(--accent-cyan)]/20">
                          {rec.equipmentId}
                        </span>
                      </td>

                      {/* Engineer */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--card-bg)] border border-[var(--border-glass)] flex items-center justify-center text-[10px] font-bold text-[var(--accent-cyan)]">
                            {rec.engineer ? rec.engineer.charAt(0) : 'E'}
                          </div>
                          <div>
                            <p className="font-semibold text-xs">{rec.engineer || 'Unassigned'}</p>
                            <button
                              onClick={() => setAssignRecord(rec)}
                              className="text-[10px] text-[var(--accent-cyan)] hover:underline block"
                            >
                              Reassign
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-xs">
                          <CalendarIcon size={14} className="text-[var(--accent-cyan)]" />
                          <span>{rec.scheduledDate}</span>
                        </div>
                        {rec.time && (
                          <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] mt-0.5">
                            <Clock size={12} />
                            <span>{rec.time} ({rec.duration || '1h'})</span>
                          </div>
                        )}
                      </td>

                      {/* Priority & Type */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(rec.priority)}`}>
                            {rec.priority} Priority
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                            {rec.type || 'Maintenance'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${getStatusBadge(rec.status)}`}>
                          {rec.status === 'Completed' && <CheckCircle2 size={12} />}
                          {rec.status === 'Cancelled' && <XCircle size={12} />}
                          {rec.status}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="p-4 max-w-[200px]">
                        <p className="text-[11px] text-[var(--text-secondary)] truncate" title={rec.notes}>
                          {rec.notes || 'No specific maintenance notes.'}
                        </p>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status !== 'Completed' && rec.status !== 'Cancelled' && (
                            <>
                              <button
                                onClick={() => onComplete(rec.id)}
                                className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 text-[var(--healthy-green)] border border-green-500/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Mark Complete (Updates Equipment Health & Stats)"
                              >
                                <CheckCircle2 size={12} /> Complete
                              </button>

                              <button
                                onClick={() => setRescheduleRecord(rec)}
                                className="px-2 py-1 glass hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                title="Reschedule Date"
                              >
                                Reschedule
                              </button>

                              <button
                                onClick={() => onCancel(rec.id)}
                                className="px-2 py-1 glass hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                title="Cancel Maintenance"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => onDelete(rec.id)}
                            className="p-1.5 hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CALENDAR MONTHLY GRID VIEW */
        <div className="glass p-6 rounded-2xl border border-[var(--border-glass)] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-['Clash_Display']">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-1.5 glass rounded-xl text-xs hover:bg-[var(--card-bg)] text-white font-bold"
              >
                &larr; Previous
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 glass rounded-xl text-xs hover:bg-[var(--card-bg)] text-[var(--accent-cyan)] font-bold"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="px-3 py-1.5 glass rounded-xl text-xs hover:bg-[var(--card-bg)] text-white font-bold"
              >
                Next &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--text-secondary)] pb-2 border-b border-[var(--border-glass)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-28 rounded-xl bg-white/[0.02] border border-white/5 opacity-30" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayJobs = filteredRecords.filter(r => r.scheduledDate === dateStr);
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={dayNum}
                  className={`h-28 p-2 rounded-xl border flex flex-col justify-between overflow-hidden transition-all ${
                    isToday
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                      : dayJobs.length > 0
                      ? 'border-[var(--border-glass)] bg-[var(--card-bg)]/60'
                      : 'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className={isToday ? 'text-[var(--accent-cyan)] font-extrabold' : 'text-[var(--text-secondary)]'}>
                      {dayNum}
                    </span>
                    {dayJobs.length > 0 && (
                      <span className="text-[10px] bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold px-1.5 rounded-full">
                        {dayJobs.length}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1 my-1 scrollbar-none">
                    {dayJobs.map(job => (
                      <div
                        key={job.id}
                        onClick={() => setRescheduleRecord(job)}
                        className={`p-1 rounded text-[10px] font-semibold truncate cursor-pointer transition-opacity hover:opacity-90 ${
                          job.status === 'Completed'
                            ? 'bg-green-500/20 text-[var(--healthy-green)]'
                            : job.priority === 'Critical'
                            ? 'bg-red-500/30 text-red-300'
                            : 'bg-cyan-500/20 text-[var(--accent-cyan)]'
                        }`}
                        title={`${job.equipmentName} (${job.priority}) - ${job.engineer}`}
                      >
                        {job.equipmentName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleMaintenanceModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSubmit={onSchedule}
        equipmentList={equipmentList}
      />

      <RescheduleMaintenanceModal
        isOpen={!!rescheduleRecord}
        onClose={() => setRescheduleRecord(null)}
        record={rescheduleRecord}
        onSubmit={onReschedule}
      />

      <AssignEngineerModal
        isOpen={!!assignRecord}
        onClose={() => setAssignRecord(null)}
        record={assignRecord}
        onSubmit={onAssignEngineer}
      />
    </div>
  );
}
