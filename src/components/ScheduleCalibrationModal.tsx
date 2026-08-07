import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { CalibrationRecord, Equipment } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<CalibrationRecord, 'id' | 'status'>) => void;
  equipmentId?: string;
  equipmentName?: string;
  equipmentList?: Equipment[];
}

export default function ScheduleCalibrationModal({
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
    type: 'Annual Calibration',
    scheduledDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    certificateUrl: '',
    certificateName: ''
  });

  const [certFile, setCertFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          certificateUrl: event.target?.result as string,
          certificateName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId) return;

    onSubmit({
      equipmentId: selectedEqId,
      equipmentName: selectedEqName || selectedEqId,
      engineer: formData.engineer || 'Biomedical Engineer',
      type: formData.type,
      scheduledDate: formData.scheduledDate,
      dueDate: formData.dueDate,
      notes: formData.notes,
      certificateUrl: formData.certificateUrl || undefined,
      certificateName: formData.certificateName || undefined,
      certificateDate: formData.certificateUrl ? new Date().toISOString().split('T')[0] : undefined
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
                <h2 className="text-xl font-bold font-['Clash_Display']">Schedule Calibration</h2>
                <p className="text-xs text-[var(--text-secondary)]">Schedule biomedical equipment compliance verification</p>
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
                  <p className="text-[11px] text-[var(--text-secondary)]">Target Equipment</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Calibration Engineer</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                    value={formData.engineer}
                    onChange={e => setFormData({...formData, engineer: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Calibration Standard / Type</label>
                  <select
                    className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Annual Calibration">Annual Calibration</option>
                    <option value="ISO 17025 Standard">ISO 17025 Standard</option>
                    <option value="Routine Inspection">Routine Inspection</option>
                    <option value="Post-Repair Calibration">Post-Repair Calibration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                    value={formData.scheduledDate}
                    onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Compliance Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Attach Certificate (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    id="cert-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="cert-upload"
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-[var(--border-glass)] bg-[var(--card-bg)]/50 hover:bg-[var(--card-bg)] text-xs text-[var(--text-secondary)] cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Upload size={16} className="text-[var(--accent-cyan)]" />
                      {formData.certificateName ? (
                        <span className="text-[var(--healthy-green)] font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> {formData.certificateName}
                        </span>
                      ) : (
                        'Upload PDF / Image Certificate...'
                      )}
                    </span>
                    <span className="text-[10px] bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] font-bold px-2 py-0.5 rounded">Browse</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Notes & Specifications</label>
                <textarea
                  placeholder="Calibration tolerance, environmental conditions, or reference meters..."
                  className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white h-20 resize-none focus:outline-none focus:border-[var(--accent-cyan)]"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-xl font-bold text-xs hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all cursor-pointer"
              >
                Confirm & Schedule Calibration
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
