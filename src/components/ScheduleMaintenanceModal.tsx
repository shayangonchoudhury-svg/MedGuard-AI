import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User, Clipboard, AlertTriangle } from 'lucide-react';
import { MaintenanceRecord, Equipment } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<MaintenanceRecord, 'id' | 'status'>) => void;
  equipmentId?: string;
  equipmentName?: string;
  equipmentList?: Equipment[];
}

export default function ScheduleMaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  equipmentId: initialEquipmentId = '',
  equipmentName: initialEquipmentName = '',
  equipmentList = []
}: Props) {
  const [selectedEqId, setSelectedEqId] = useState(initialEquipmentId);
  const [selectedEqName, setSelectedEqName] = useState(initialEquipmentName);

  const [formData, setFormData] = useState({
    engineer: '',
    type: 'Maintenance' as const,
    priority: 'Medium' as const,
    scheduledDate: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    duration: '2 hours',
    notes: ''
  });

  useEffect(() => {
    if (initialEquipmentId) {
      setSelectedEqId(initialEquipmentId);
      setSelectedEqName(initialEquipmentName);
    } else if (equipmentList.length > 0) {
      setSelectedEqId(equipmentList[0].id);
      setSelectedEqName(equipmentList[0].name);
    }
  }, [initialEquipmentId, initialEquipmentName, equipmentList, isOpen]);

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = equipmentList.find(item => item.id === id);
    setSelectedEqId(id);
    setSelectedEqName(found ? found.name : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId) return;
    onSubmit({
      equipmentId: selectedEqId,
      equipmentName: selectedEqName || selectedEqId,
      ...formData
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-2xl shadow-2xl z-50 p-6 text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
              <div>
                <h2 className="text-xl font-bold font-['Clash_Display']">Schedule Maintenance</h2>
                <p className="text-xs text-[var(--text-secondary)]">Create a new biomedical equipment maintenance record</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="p-1 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Equipment Selector if not hardcoded */}
              {initialEquipmentId ? (
                <div className="p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--border-glass)]">
                  <p className="text-[11px] text-[var(--text-secondary)]">Selected Asset</p>
                  <p className="font-bold text-sm text-[var(--accent-cyan)]">{initialEquipmentName} ({initialEquipmentId})</p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Equipment</label>
                  <select
                    className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                    value={selectedEqId}
                    onChange={handleEquipmentChange}
                    required
                  >
                    {equipmentList.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.id}) - {eq.department}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Assigned Engineer</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                  value={formData.engineer}
                  onChange={e => setFormData({...formData, engineer: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Type</label>
                  <select className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Calibration">Calibration</option>
                    <option value="Repair">Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Priority</label>
                  <select className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Scheduled Date</label>
                  <input type="date" className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Time</label>
                  <input type="text" placeholder="10:00 AM" className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Estimated Duration</label>
                <input type="text" placeholder="e.g. 2 hours" className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Notes / Instructions</label>
                <textarea placeholder="Specific maintenance steps or observed anomalies..." className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white h-20 resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <button type="submit" className="w-full py-3 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-xl font-bold text-xs hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all cursor-pointer">
                Confirm & Schedule Maintenance
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
