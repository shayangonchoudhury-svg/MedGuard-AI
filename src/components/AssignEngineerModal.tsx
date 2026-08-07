import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCheck } from 'lucide-react';
import { MaintenanceRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceRecord | null;
  onSubmit: (id: string, engineerName: string) => void;
}

const presetEngineers = [
  'Dr. Sarah Jenkins',
  'Alice Johnson',
  'Bob Williams',
  'Dr. Robert Vance',
  'Dr. Mark Sloan',
  'Helen Cho'
];

export default function AssignEngineerModal({
  isOpen,
  onClose,
  record,
  onSubmit
}: Props) {
  const [engineer, setEngineer] = useState('');

  useEffect(() => {
    if (record) {
      setEngineer(record.engineer || 'Dr. Sarah Jenkins');
    }
  }, [record, isOpen]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engineer.trim()) return;
    onSubmit(record.id, engineer.trim());
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
                <h3 className="text-lg font-bold font-['Clash_Display']">Assign Lead Engineer</h3>
                <p className="text-xs text-[var(--text-secondary)]">{record.equipmentName} ({record.id})</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-[var(--accent-cyan)]" /> Engineer Name
                </label>
                <input
                  type="text"
                  placeholder="Enter engineer full name"
                  className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)] mb-2"
                  value={engineer}
                  onChange={e => setEngineer(e.target.value)}
                  required
                />
                <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">Quick Select Available Staff:</p>
                <div className="flex flex-wrap gap-1.5">
                  {presetEngineers.map(eName => (
                    <button
                      key={eName}
                      type="button"
                      onClick={() => setEngineer(eName)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                        engineer === eName
                          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] font-bold'
                          : 'border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      {eName}
                    </button>
                  ))}
                </div>
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
                  Assign & Update
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
