import React, { useState, useEffect } from 'react';
import { X, Bot, Edit2, Trash2, Loader2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Equipment } from '../types';
import { api } from '../services/api';
import { aiService } from '../services/aiService';
import ScheduleMaintenanceModal from './ScheduleMaintenanceModal';
import ScheduleCalibrationModal from './ScheduleCalibrationModal';
import EditEquipmentModal from './EditEquipmentModal';

interface Props {
  equipment: Equipment | null;
  onClose: () => void;
  onScheduleMaintenance: (record: any) => void;
  onScheduleCalibration: (record: any) => void;
  onUpdateEquipment: (id: string, updated: Partial<Equipment>) => void;
  onDeleteEquipment: (id: string) => void;
}

export default function EquipmentDrawer({
  equipment: initialEquipment,
  onClose,
  onScheduleMaintenance,
  onScheduleCalibration,
  onUpdateEquipment,
  onDeleteEquipment,
}: Props) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [equipmentDetails, setEquipmentDetails] = useState<Equipment | null>(initialEquipment);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [aiDiagnostic, setAiDiagnostic] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateAiDiagnostic = async (item: Equipment) => {
    setLoadingAi(true);
    try {
      const summary = await aiService.summarizeEquipment(item);
      setAiDiagnostic(summary);
    } catch (err: any) {
      setAiDiagnostic(`⚠️ AI Diagnostic Error: ${err.message || 'Failed to fetch AI analysis'}`);
    } finally {
      setLoadingAi(false);
    }
  };

  // Fetch individual item via GET /equipment/:id when opened
  useEffect(() => {
    if (initialEquipment) {
      setEquipmentDetails(initialEquipment);
      setLoadingDetails(true);
      setDetailsError(null);
      setAiDiagnostic(null);
      setShowScheduleModal(false);
      setShowCalibrationModal(false);
      setShowEditModal(false);
      setShowDeleteConfirm(false);
      setLoadingAi(false);

      api.equipment.getById(initialEquipment.id)
        .then(data => {
          setEquipmentDetails(data);
        })
        .catch(err => {
          console.warn('Failed to fetch detailed item from API, fallback to list item:', err);
          setDetailsError(err.message || 'Could not fetch live item details');
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    } else {
      setEquipmentDetails(null);
      setAiDiagnostic(null);
      setShowScheduleModal(false);
      setShowCalibrationModal(false);
      setShowEditModal(false);
      setShowDeleteConfirm(false);
      setLoadingAi(false);
      setDetailsError(null);
    }
  }, [initialEquipment]);

  if (!initialEquipment) return null;
  const currentItem = equipmentDetails || initialEquipment;

  const handleDelete = () => {
    onDeleteEquipment(currentItem.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-[620px] h-full bg-[#0e1322] border-l border-[var(--border-glass)] shadow-2xl p-8 overflow-y-auto text-[var(--text-primary)] relative flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[var(--card-bg)] rounded-2xl flex items-center justify-center text-[var(--accent-cyan)] font-bold border border-[var(--border-glass)]">
                  <span className="font-mono text-sm">{currentItem.id.slice(0, 6)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] font-['Clash_Display']">{currentItem.name}</h2>
                    {loadingDetails && <Loader2 size={16} className="animate-spin text-[var(--accent-cyan)]" />}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{currentItem.category} • {currentItem.department}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 hover:bg-[var(--card-bg)] rounded-full text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {detailsError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{detailsError}</span>
              </div>
            )}

            {/* Quick Actions Header: Edit & Delete */}
            <div className="flex items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-glass)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Asset Management Controls</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Edit2 size={13} /> Edit Equipment
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            {/* Delete Confirmation Card */}
            {showDeleteConfirm && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200 space-y-3">
                <p className="text-xs font-semibold">Are you sure you want to delete {currentItem.name} ({currentItem.id})?</p>
                <p className="text-[11px] text-red-300">This action will send a DELETE request to Cloud SQL and update all dashboard stats immediately.</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-white hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}

            {/* Health Score */}
            <div className="bg-[var(--card-bg)] p-6 rounded-2xl mb-6 flex items-center justify-between gap-6 border border-[var(--border-glass)]">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={currentItem.healthScore > 80 ? 'var(--healthy-green)' : currentItem.healthScore > 50 ? 'var(--warning-amber)' : 'var(--critical-red)'}
                      strokeWidth="3"
                      strokeDasharray={`${currentItem.healthScore}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-[var(--text-primary)]">
                    {currentItem.healthScore}%
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg text-[var(--text-primary)]">
                    {currentItem.healthScore > 80 ? 'Optimal Performance' : 'Attention Required'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">Health Index</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-secondary)]">Risk Factor</p>
                <p className="text-2xl font-bold text-[var(--critical-red)]">{currentItem.riskScore}/100</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
              {[
                { label: 'Manufacturer', value: currentItem.manufacturer },
                { label: 'Model Number', value: currentItem.modelNumber },
                { label: 'Serial Number', value: currentItem.serialNumber },
                { label: 'Department', value: currentItem.department },
                { label: 'Assigned Engineer', value: currentItem.assignedEngineer || 'Unassigned' },
                { label: 'Installation Date', value: currentItem.installationDate },
                { label: 'Warranty Expiry', value: currentItem.warrantyExpiry },
                { label: 'Next Maintenance', value: currentItem.nextMaintenance },
              ].map(item => (
                <div key={item.label} className="border-b border-[var(--border-glass)] pb-2">
                  <p className="text-[11px] text-[var(--text-secondary)] mb-0.5">{item.label}</p>
                  <p className="font-semibold text-xs text-[var(--text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Gemini AI Asset Diagnostic Card */}
            <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-glass)] mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-cyan)]">
                  <Sparkles size={16} /> Gemini AI Diagnostic
                </div>
                <button
                  onClick={() => handleGenerateAiDiagnostic(currentItem)}
                  disabled={loadingAi}
                  className="px-3 py-1 bg-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={loadingAi ? 'animate-spin' : ''} />
                  {loadingAi ? 'Analyzing...' : 'Analyze Asset'}
                </button>
              </div>

              {aiDiagnostic ? (
                <div className="p-3 bg-black/20 rounded-xl text-[11px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap font-sans">
                  {aiDiagnostic}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-secondary)] italic">
                  Click "Analyze Asset" to run an AI diagnostic on this device's telemetry, health score, and maintenance history.
                </p>
              )}
            </div>

            {/* Timeline */}
            <h3 className="text-sm font-bold mb-3 text-[var(--text-primary)] font-['Clash_Display']">Lifecycle Logs</h3>
            <div className="space-y-3 mb-6">
              {[
                `Installed on ${currentItem.installationDate || '2025-01-15'}`,
                `Last Serviced: ${currentItem.lastMaintenance || '2026-05-01'}`,
                `Next Maintenance: ${currentItem.nextMaintenance || '2026-12-01'}`,
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="relative flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)] z-10" />
                    {i < 2 && <div className="absolute top-2.5 w-px h-6 bg-[rgba(255,255,255,0.15)]" />}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-glass)] space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex-1 py-2.5 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-xl font-bold text-xs hover:shadow-[0_0_12px_var(--accent-cyan)] transition-all cursor-pointer"
              >
                Schedule Maintenance
              </button>
              <button
                onClick={() => setShowCalibrationModal(true)}
                className="flex-1 py-2.5 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Schedule Calibration
              </button>
            </div>
          </div>
        </motion.div>

        <ScheduleMaintenanceModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSubmit={onScheduleMaintenance}
          equipmentId={currentItem.id}
          equipmentName={currentItem.name}
        />
        <ScheduleCalibrationModal
          isOpen={showCalibrationModal}
          onClose={() => setShowCalibrationModal(false)}
          onSubmit={onScheduleCalibration}
          equipmentId={currentItem.id}
          equipmentName={currentItem.name}
        />
        <EditEquipmentModal
          isOpen={showEditModal}
          equipment={currentItem}
          onClose={() => setShowEditModal(false)}
          onSave={(id, updated) => {
            onUpdateEquipment(id, updated);
            setEquipmentDetails(prev => prev ? { ...prev, ...updated } : null);
          }}
        />
      </div>
    </AnimatePresence>
  );
}
