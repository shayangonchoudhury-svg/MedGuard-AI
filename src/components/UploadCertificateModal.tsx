import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileCheck, CheckCircle2 } from 'lucide-react';
import { CalibrationRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: CalibrationRecord | null;
  onSubmit: (id: string, certUrl: string, certName: string, certDate: string) => void;
}

export default function UploadCertificateModal({
  isOpen,
  onClose,
  record,
  onSubmit
}: Props) {
  const [certUrl, setCertUrl] = useState('');
  const [certName, setCertName] = useState('');
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (record) {
      setCertUrl(record.certificateUrl || '');
      setCertName(record.certificateName || `${record.equipmentId}_Calibration_Cert.pdf`);
      setCertDate(record.certificateDate || new Date().toISOString().split('T')[0]);
    }
  }, [record, isOpen]);

  if (!record) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCertUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certUrl && !certName) return;

    // Use default URL if user entered custom name without picking file
    const finalUrl = certUrl || `https://medguard-certificates.internal/certs/${certName}`;
    onSubmit(record.id, finalUrl, certName || 'Calibration_Certificate.pdf', certDate);
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
                <h3 className="text-lg font-bold font-['Clash_Display']">Attach Calibration Certificate</h3>
                <p className="text-xs text-[var(--text-secondary)]">{record.equipmentName} ({record.id})</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Upload PDF or Image Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    id="cert-file-input"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="cert-file-input"
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-[var(--border-glass)] bg-[var(--card-bg)] hover:bg-[var(--card-bg)]/80 text-xs text-[var(--text-secondary)] cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Upload size={18} className="text-[var(--accent-cyan)]" />
                      {certName ? (
                        <span className="text-[var(--healthy-green)] font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> {certName}
                        </span>
                      ) : (
                        'Click to choose certificate file...'
                      )}
                    </span>
                    <span className="text-[10px] bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold px-2.5 py-1 rounded-lg">
                      Upload
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Certificate Document Title / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. ISO_17025_CERT_2026.pdf"
                  className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                  value={certName}
                  onChange={e => setCertName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Issue / Verification Date
                </label>
                <input
                  type="date"
                  className="w-full bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-glass)] text-xs text-white focus:outline-none focus:border-[var(--accent-cyan)]"
                  value={certDate}
                  onChange={e => setCertDate(e.target.value)}
                  required
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
                  Save & Attach Certificate
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
