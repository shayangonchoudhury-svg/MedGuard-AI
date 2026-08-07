import { Equipment } from './types';

const categories = ['Ventilator', 'ECG Machine', 'Defibrillator', 'X-Ray Machine', 'Ultrasound', 'Patient Monitor', 'Infusion Pump', 'Syringe Pump', 'Oxygen Cylinder', 'Anesthesia Machine'];
const manufacturers = ['Philips', 'GE Healthcare', 'Siemens Healthineers', 'Dräger', 'Mindray', 'Nihon Kohden'];
const departments = ['ICU', 'Emergency', 'Cardiology', 'Radiology', 'Operation Theatre', 'NICU', 'General Ward', 'Laboratory'];
const engineers = ['Dr. Smith', 'Alice Johnson', 'Bob Williams', 'Charlie Davis'];
const statuses: Equipment['status'][] = ['Operational', 'Maintenance', 'Calibration Due', 'Warranty Expired', 'Critical'];
const risks: Equipment['riskLevel'][] = ['Healthy', 'Attention', 'Due Soon', 'Critical'];

export const equipmentData: Equipment[] = Array.from({ length: 100 }, (_, i) => ({
  id: `EQ-${(i + 1000).toString()}`,
  name: `${categories[i % categories.length]} - ${100 + i}`,
  category: categories[i % categories.length],
  department: departments[i % departments.length],
  manufacturer: manufacturers[i % manufacturers.length],
  modelNumber: `MOD-${Math.floor(Math.random() * 9000) + 1000}`,
  serialNumber: `SN-${Math.floor(Math.random() * 900000) + 100000}`,
  installationDate: '2025-01-15',
  status: statuses[i % statuses.length],
  riskLevel: risks[i % risks.length],
  lastMaintenance: '2026-06-01',
  nextMaintenance: '2026-12-01',
  lastCalibration: '2026-05-01',
  nextCalibration: '2026-11-01',
  warrantyExpiry: '2027-01-01',
  certificationExpiry: '2026-12-31',
  assignedEngineer: engineers[i % engineers.length],
  expectedLifetime: 10,
  healthScore: Math.floor(Math.random() * 40) + 60,
  riskScore: Math.floor(Math.random() * 100),
}));
