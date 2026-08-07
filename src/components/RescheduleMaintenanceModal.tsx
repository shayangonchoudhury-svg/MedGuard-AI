import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock } from 'lucide-react';
import { MaintenanceRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecord | null;
  onSubmit: (id: string, newDate: string, newTime?: string) => void;
}

export default function RescheduleMaintenanceModal({
  isOpen,
  onClose,
  record,
  onSubmit
}: Props) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (record) {
      setScheduledDate(record.scheduledDate || new Date().toISOString().split('T')[0]);
      setTime(record.time || '10:00 AM');
    }
  }, [record, isOpen]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) return;
    onSubmit(record.id, scheduledDate, time);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-2xl shadow-2xl z-50 p-6 text-[var(--text-primary)]">
            <div className="flex justify-between items-center mb-4 border-b border-[var(--border-glass)] pb-3">
              <div>
                <h3 className="text-lg font-bold font-['Clash_Display']">Reschedule Maintenance</h3>
                <p className="text-xs text-[var(--text-secondary)]">{record.equipmentName} ({record.id})</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[var(--accent-cyan)]" /> New Scheduled Date
                </label>
                <input
                  type="date"
                  className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                  <Clock size={14} className="text-[var(--accent-cyan)]" /> Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. 02:30 PM"
                  className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 glass text-xs text-[var(--text-secondary)] hover:text-white rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold text-xs rounded-xl hover:shadow-[0_0_12px_var(--accent-cyan)] transition-all"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
