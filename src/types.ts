export interface Equipment {
  id: string;
  name: string;
  category: string;
  department: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  installationDate: string;
  status: 'Operational' | 'Maintenance' | 'Maintenance Due' | 'Calibration Due' | 'Warranty Expired' | 'Critical';
  riskLevel: 'Healthy' | 'Attention' | 'Due Soon' | 'Critical';
  lastMaintenance: string;
  nextMaintenance: string;
  lastCalibration: string;
  nextCalibration: string;
  warrantyExpiry: string;
  certificationExpiry: string;
  assignedEngineer: string;
  expectedLifetime: number;
  healthScore: number;
  riskScore: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Critical' | 'Maintenance' | 'Calibration' | 'Compliance' | 'Reports';
  timestamp: string;
  read: boolean;
  archived: boolean;
  link?: string;
  equipmentId?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  engineer: string;
  type: 'Maintenance' | 'Calibration' | 'Repair';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  time?: string;
  duration?: string;
  notes: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rescheduled';
}

export interface CalibrationRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  engineer: string;
  type: string;
  scheduledDate: string;
  dueDate: string;
  notes: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  certificateUrl?: string;
  certificateName?: string;
  certificateDate?: string;
}

export interface UserProfile {
  id?: number;
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role?: string;
  department?: string;
  hospital?: string;
  phone?: string;
  bio?: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  type: 'Compliance' | 'Maintenance' | 'Risk' | 'Executive Summary' | 'Maintenance Log' | 'Calibration Certificate' | 'Audit Summary';
  generatedBy: string;
  department: string;
  date: string;
  status: 'Generating' | 'Ready' | 'Cached' | 'Archived' | 'Failed';
  summary?: string;
  downloadUrl?: string;
  contentJson?: string;
  cachedAt?: string;
  fileSize?: string;
  isCached?: boolean;
}

export interface Department {
  id: number;
  name: string;
  code?: string;
  head?: string;
  contact?: string;
}

export interface AIActivity {
  id: string;
  module: string;
  action: string;
  status: 'Running' | 'Processing' | 'Success' | 'Error';
  equipmentId?: string;
  equipmentName?: string;
  durationMs: number;
  summary?: string;
  detailsJson?: string;
  timestamp: string;
  createdAt?: string;
}

export interface AIAnalysisRecord {
  id: string;
  equipmentId?: string;
  equipmentName?: string;
  module: string;
  analysisType: string;
  riskScore?: number;
  complianceStatus?: string;
  maintenancePrediction?: string;
  recommendationsJson?: string;
  rawOutput?: string;
  date: string;
  createdAt?: string;
}

