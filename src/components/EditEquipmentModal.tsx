import React, { useState, useEffect } from 'react';
import { X, Activity, Shield, Server, Wrench, AlertTriangle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Equipment } from '../types';

interface EditEquipmentModalProps {
  isOpen: boolean;
  equipment: Equipment | null;
  onClose: () => void;
  onSave: (id: string, updated: Partial<Equipment>) => void;
}

export default function EditEquipmentModal({
  isOpen,
  equipment,
  onClose,
  onSave,
}: EditEquipmentModalProps) {
  const [formData, setFormData] = useState<Partial<Equipment>>({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        category: equipment.category,
        department: equipment.department,
        manufacturer: equipment.manufacturer,
        modelNumber: equipment.modelNumber,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        riskLevel: equipment.riskLevel,
        assignedEngineer: equipment.assignedEngineer,
        healthScore: equipment.healthScore,
        riskScore: equipment.riskScore,
        warrantyExpiry: equipment.warrantyExpiry,
        nextMaintenance: equipment.nextMaintenance,
        nextCalibration: equipment.nextCalibration,
      });
    }
  }, [equipment]);

  if (!isOpen || !equipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(equipment.id, formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass border border-[var(--border-glass)] w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto text-[var(--text-primary)] shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--card-bg)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] rounded-xl border border-[var(--accent-cyan)]/20">
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-['Clash_Display']">Edit Equipment Details</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Update records for <span className="text-[var(--accent-cyan)] font-mono">{equipment.id}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                <select
                  value={formData.category || 'Ventilator'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                >
                  <option value="Ventilator">Ventilator</option>
                  <option value="Patient Monitor">Patient Monitor</option>
                  <option value="ECG Machine">ECG Machine</option>
                  <option value="Defibrillator">Defibrillator</option>
                  <option value="Infusion Pump">Infusion Pump</option>
                  <option value="X-Ray Machine">X-Ray Machine</option>
                  <option value="Anesthesia Machine">Anesthesia Machine</option>
                  <option value="Ultrasound">Ultrasound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Department</label>
                <select
                  value={formData.department || 'ICU'}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                >
                  <option value="ICU">ICU</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Operation Theatre">Operation Theatre</option>
                  <option value="NICU">NICU</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Operational Status</label>
                <select
                  value={formData.status || 'Operational'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Calibration Due">Calibration Due</option>
                  <option value="Warranty Expired">Warranty Expired</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer || ''}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Model Number</label>
                <input
                  type="text"
                  value={formData.modelNumber || ''}
                  onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Assigned Biomedical Engineer</label>
                <input
                  type="text"
                  value={formData.assignedEngineer || ''}
                  onChange={(e) => setFormData({ ...formData, assignedEngineer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Health Score (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.healthScore ?? 100}
                  onChange={(e) => setFormData({ ...formData, healthScore: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Risk Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.riskScore ?? 10}
                  onChange={(e) => setFormData({ ...formData, riskScore: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Warranty Expiry Date</label>
                <input
                  type="date"
                  value={formData.warrantyExpiry || ''}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Next Maintenance Date</label>
                <input
                  type="date"
                  value={formData.nextMaintenance || ''}
                  onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-sm focus:border-[var(--accent-cyan)] outline-none text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-blue-600 text-[var(--bg-navy)] text-xs font-bold hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
