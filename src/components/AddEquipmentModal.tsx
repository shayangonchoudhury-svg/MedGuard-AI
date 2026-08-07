import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Save, Stethoscope, Building2, Wrench, ShieldAlert } from 'lucide-react';
import { Equipment } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: Equipment) => void;
}

export default function AddEquipmentModal({ isOpen, onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    name: '',
    category: 'Ventilator',
    department: 'ICU',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    installationDate: new Date().toISOString().split('T')[0],
    status: 'Operational',
    riskLevel: 'Healthy',
    lastMaintenance: '',
    nextMaintenance: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastCalibration: '',
    nextCalibration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    certificationExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedEngineer: 'Dr. Sarah Jenkins',
    expectedLifetime: 10,
    healthScore: 95,
    riskScore: 10
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.category || !formData.department) return;

    const newEquipment: Equipment = {
      ...formData,
      id: `EQ-${Math.floor(Math.random() * 9000) + 1000}`
    };
    onSave(newEquipment);
    onClose();
    setStep(1);
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-2xl shadow-2xl z-50 p-6 text-[var(--text-primary)]"
          >
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-glass)] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] rounded-xl border border-[var(--accent-cyan)]/20">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-['Clash_Display']">Add New Medical Equipment</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Step {step} of 3 • Cloud SQL Registry</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[var(--accent-cyan)] uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={14} /> Basic Equipment & Location Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Equipment Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hamilton Ventilator C3"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category *</label>
                      <select
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Ventilator">Ventilator</option>
                        <option value="Patient Monitor">Patient Monitor</option>
                        <option value="ECG Machine">ECG Machine</option>
                        <option value="Defibrillator">Defibrillator</option>
                        <option value="X-Ray Machine">X-Ray Machine</option>
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="Infusion Pump">Infusion Pump</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Department *</label>
                      <select
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="ICU">ICU</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Operation Theatre">Operation Theatre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Manufacturer</label>
                      <input
                        type="text"
                        placeholder="e.g. Hamilton Medical / GE / Philips"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.manufacturer}
                        onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Model Number</label>
                      <input
                        type="text"
                        placeholder="e.g. C3-HV / MX800"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.modelNumber}
                        onChange={e => setFormData({ ...formData, modelNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Serial Number</label>
                      <input
                        type="text"
                        placeholder="e.g. SN-982341"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.serialNumber}
                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[var(--accent-cyan)] uppercase tracking-wider flex items-center gap-2">
                    <Wrench size={14} /> Maintenance & Schedule Setup
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Installation Date</label>
                      <input
                        type="date"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.installationDate}
                        onChange={e => setFormData({ ...formData, installationDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Next Scheduled Maintenance</label>
                      <input
                        type="date"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.nextMaintenance}
                        onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Next Scheduled Calibration</label>
                      <input
                        type="date"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.nextCalibration}
                        onChange={e => setFormData({ ...formData, nextCalibration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Warranty Expiry</label>
                      <input
                        type="date"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.warrantyExpiry}
                        onChange={e => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[var(--accent-cyan)] uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={14} /> Engineer & Status Assignment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Assigned Biomedical Engineer</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Sarah Jenkins"
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.assignedEngineer}
                        onChange={e => setFormData({ ...formData, assignedEngineer: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Status</label>
                      <select
                        className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Calibration Due">Calibration Due</option>
                        <option value="Warranty Expired">Warranty Expired</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Initial Health Index ({formData.healthScore}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        className="w-full accent-[var(--accent-cyan)] cursor-pointer"
                        value={formData.healthScore}
                        onChange={e => setFormData({ ...formData, healthScore: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Initial Risk Score ({formData.riskScore}/100)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        className="w-full accent-[var(--critical-red)] cursor-pointer"
                        value={formData.riskScore}
                        onChange={e => setFormData({ ...formData, riskScore: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-8 pt-4 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 rounded-xl glass text-xs text-[var(--text-secondary)] hover:text-white disabled:opacity-40 transition-all flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Back
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.name) return;
                      setStep(step + 1);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold text-xs hover:shadow-[0_0_12px_var(--accent-cyan)] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-blue-600 text-[var(--bg-navy)] font-bold text-xs hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={16} /> Save Equipment to Cloud SQL
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
