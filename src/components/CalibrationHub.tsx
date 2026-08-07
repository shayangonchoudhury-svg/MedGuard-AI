import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, ShieldCheck, CheckCircle2, XCircle, Clock, FileCheck,
  Upload, Download, Plus, RefreshCw, Search, ListFilter, Trash2,
  ExternalLink, Eye, Award, AlertTriangle, FileText, X
} from 'lucide-react';
import { CalibrationRecord, Equipment } from '../types';
import ScheduleCalibrationModal from './ScheduleCalibrationModal';
import RescheduleCalibrationModal from './RescheduleCalibrationModal';
import UploadCertificateModal from './UploadCertificateModal';

interface Props {
  records: CalibrationRecord[];
  equipmentList: Equipment[];
  onSchedule: (record: Omit<CalibrationRecord, 'id' | 'status'>) => void;
  onComplete: (id: string, certUrl?: string, certName?: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string, newScheduledDate: string, newDueDate: string) => void;
  onUploadCert: (id: string, certUrl: string, certName: string, certDate: string) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function CalibrationHub({
  records = [],
  equipmentList = [],
  onSchedule,
  onComplete,
  onCancel,
  onReschedule,
  onUploadCert,
  onDelete,
  onRefresh,
  isLoading
}: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [rescheduleRecord, setRescheduleRecord] = useState<CalibrationRecord | null>(null);
  const [uploadCertRecord, setUploadCertRecord] = useState<CalibrationRecord | null>(null);
  const [previewCertRecord, setPreviewCertRecord] = useState<CalibrationRecord | null>(null);

  // Filtered records
  const filteredRecords = records.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSearch =
      r.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.engineer && r.engineer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.certificateName && r.certificateName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Stats
  const totalJobs = records.length;
  const activeCount = records.filter(r => r.status === 'Scheduled' || r.status === 'Rescheduled').length;
  const completedCount = records.filter(r => r.status === 'Completed').length;
  const certCount = records.filter(r => !!r.certificateUrl || !!r.certificateName).length;
  const complianceRate = totalJobs > 0 ? Math.round((completedCount / totalJobs) * 100) : 100;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display']">
            Calibration & Compliance Hub
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track equipment calibrations, upload ISO certificates, and automate hospital compliance.
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
            <Plus size={16} /> Schedule Calibration
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Calibration Jobs', val: totalJobs, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Pending / Active', val: activeCount, color: 'text-[var(--warning-amber)]', bg: 'bg-amber-500/10' },
          { label: 'Completed & Certified', val: completedCount, color: 'text-[var(--healthy-green)]', bg: 'bg-green-500/10' },
          { label: 'Certificates Uploaded', val: certCount, color: 'text-[var(--accent-cyan)]', bg: 'bg-cyan-500/10' },
          { label: 'Calibration Rate', val: `${complianceRate}%`, color: complianceRate >= 80 ? 'text-[var(--healthy-green)]' : 'text-[var(--warning-amber)]', bg: 'bg-green-500/20' }
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

      {/* Controls Bar */}
      <div className="glass p-3 rounded-2xl border border-[var(--border-glass)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            type="text"
            placeholder="Search Calibration by Equipment, ID, Engineer, or Certificate..."
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
          {['All', 'Scheduled', 'Completed', 'Rescheduled', 'Cancelled'].map(st => (
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
      </div>

      {/* TABLE LIST VIEW */}
      <div className="glass rounded-2xl border border-[var(--border-glass)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-[var(--card-bg)]/80 text-[var(--text-secondary)] font-semibold border-b border-[var(--border-glass)]">
              <tr>
                <th className="p-4">Equipment & Asset ID</th>
                <th className="p-4">Calibration Engineer</th>
                <th className="p-4">Standard / Type</th>
                <th className="p-4">Schedule & Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">ISO Certificate</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-glass)]/50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[var(--text-secondary)]">
                    <ShieldCheck size={32} className="mx-auto mb-2 opacity-30 text-[var(--accent-cyan)]" />
                    <p className="font-semibold text-sm">No calibration records found</p>
                    <p className="text-[11px] text-[var(--text-secondary)]/80 mt-1">Schedule a calibration or clear your search filters.</p>
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
                    <td className="p-4 font-semibold text-xs text-white/90">
                      {rec.engineer || 'Biomedical Specialist'}
                    </td>

                    {/* Type */}
                    <td className="p-4">
                      <span className="text-xs text-[var(--accent-cyan)] font-medium">
                        {rec.type || 'Annual Calibration'}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Calendar size={14} className="text-[var(--accent-cyan)]" />
                        <span>Scheduled: {rec.scheduledDate}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                        Due: <span className="text-amber-300">{rec.dueDate || '1 Year'}</span>
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${getStatusBadge(rec.status)}`}>
                        {rec.status === 'Completed' && <CheckCircle2 size={12} />}
                        {rec.status}
                      </span>
                    </td>

                    {/* Certificate */}
                    <td className="p-4">
                      {rec.certificateName || rec.certificateUrl ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewCertRecord(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--healthy-green)]/20 text-[var(--healthy-green)] border border-green-500/30 rounded-lg text-[11px] font-bold hover:bg-[var(--healthy-green)]/30 transition-all cursor-pointer"
                          >
                            <FileCheck size={12} />
                            <span className="max-w-[120px] truncate">{rec.certificateName || 'View Cert'}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setUploadCertRecord(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-dashed border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-white rounded-lg text-[11px] transition-all cursor-pointer"
                        >
                          <Upload size={12} /> Attach Cert
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rec.status !== 'Completed' && rec.status !== 'Cancelled' && (
                          <>
                            <button
                              onClick={() => {
                                if (!rec.certificateUrl) {
                                  setUploadCertRecord(rec);
                                } else {
                                  onComplete(rec.id);
                                }
                              }}
                              className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 text-[var(--healthy-green)] border border-green-500/40 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Mark Calibration Complete"
                            >
                              <CheckCircle2 size={12} /> Complete
                            </button>

                            <button
                              onClick={() => setRescheduleRecord(rec)}
                              className="px-2 py-1 glass hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                              title="Reschedule Calibration"
                            >
                              Reschedule
                            </button>

                            <button
                              onClick={() => onCancel(rec.id)}
                              className="px-2 py-1 glass hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                              title="Cancel Calibration"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setUploadCertRecord(rec)}
                          className="p-1.5 hover:bg-cyan-500/20 text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] rounded-lg transition-colors cursor-pointer"
                          title="Upload/Replace Certificate"
                        >
                          <Upload size={14} />
                        </button>

                        <button
                          onClick={() => onDelete(rec.id)}
                          className="p-1.5 hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Calibration Record"
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

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {previewCertRecord && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setPreviewCertRecord(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-2xl shadow-2xl z-50 p-6 text-[var(--text-primary)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-glass)] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="text-[var(--healthy-green)]" size={20} />
                  <div>
                    <h3 className="font-bold text-base font-['Clash_Display']">ISO 17025 Calibration Certificate</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{previewCertRecord.equipmentName} ({previewCertRecord.equipmentId})</p>
                  </div>
                </div>
                <button onClick={() => setPreviewCertRecord(null)} className="p-1 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white"><X size={18} /></button>
              </div>

              <div className="p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-glass)] space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Document Title:</span>
                  <span className="font-bold text-[var(--accent-cyan)]">{previewCertRecord.certificateName || 'Calibration_Certificate.pdf'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Certified Engineer:</span>
                  <span className="font-semibold text-white">{previewCertRecord.engineer}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Verification Standard:</span>
                  <span className="font-semibold text-white">{previewCertRecord.type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Issue Date:</span>
                  <span className="font-semibold text-white">{previewCertRecord.certificateDate || previewCertRecord.scheduledDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Valid Until:</span>
                  <span className="font-semibold text-[var(--healthy-green)]">{previewCertRecord.dueDate}</span>
                </div>
              </div>

              {previewCertRecord.certificateUrl && previewCertRecord.certificateUrl.startsWith('data:') ? (
                <div className="rounded-xl overflow-hidden border border-[var(--border-glass)] max-h-48 bg-black/40 flex items-center justify-center p-2">
                  {previewCertRecord.certificateUrl.startsWith('data:image') ? (
                    <img src={previewCertRecord.certificateUrl} alt="Calibration Certificate" className="max-h-44 object-contain rounded-lg" />
                  ) : (
                    <div className="text-center p-4">
                      <FileText size={32} className="mx-auto text-[var(--accent-cyan)] mb-1" />
                      <p className="text-xs font-bold text-white">{previewCertRecord.certificateName}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">PDF Document Stored</p>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex gap-2 pt-2">
                {previewCertRecord.certificateUrl && (
                  <a
                    href={previewCertRecord.certificateUrl}
                    download={previewCertRecord.certificateName || 'Calibration_Certificate.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold text-xs rounded-xl hover:shadow-[0_0_12px_var(--accent-cyan)] transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Download Certificate
                  </a>
                )}
                <button
                  onClick={() => setPreviewCertRecord(null)}
                  className="px-4 py-2.5 glass text-xs text-[var(--text-secondary)] hover:text-white rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ScheduleCalibrationModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSubmit={onSchedule}
        equipmentList={equipmentList}
      />

      <RescheduleCalibrationModal
        isOpen={!!rescheduleRecord}
        onClose={() => setRescheduleRecord(null)}
        record={rescheduleRecord}
        onSubmit={onReschedule}
      />

      <UploadCertificateModal
        isOpen={!!uploadCertRecord}
        onClose={() => setUploadCertRecord(null)}
        record={uploadCertRecord}
        onSubmit={(id, url, name, date) => {
          onUploadCert(id, url, name, date);
          // Also if completing via cert modal:
          if (uploadCertRecord && uploadCertRecord.status !== 'Completed') {
            onComplete(id, url, name);
          }
        }}
      />
    </div>
  );
}
