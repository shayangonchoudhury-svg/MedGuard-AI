import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  role: text('role').default('Biomedical Engineer'),
  department: text('department').default('Emergency & ICU'),
  hospital: text('hospital').default('Apollo Hospitals'),
  phone: text('phone'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code'),
  head: text('head'),
  contact: text('contact'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const equipment = pgTable('equipment', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  department: text('department').notNull(),
  manufacturer: text('manufacturer').notNull(),
  modelNumber: text('model_number').notNull(),
  serialNumber: text('serial_number').notNull(),
  installationDate: text('installation_date').default('2025-01-15'),
  status: text('status').notNull().default('Operational'),
  riskLevel: text('risk_level').notNull().default('Healthy'),
  lastMaintenance: text('last_maintenance'),
  nextMaintenance: text('next_maintenance'),
  lastCalibration: text('last_calibration'),
  nextCalibration: text('next_calibration'),
  warrantyExpiry: text('warranty_expiry'),
  certificationExpiry: text('certification_expiry'),
  assignedEngineer: text('assigned_engineer'),
  expectedLifetime: integer('expected_lifetime').default(10),
  healthScore: integer('health_score').default(100),
  riskScore: integer('risk_score').default(10),
  createdAt: timestamp('created_at').defaultNow(),
});

export const maintenance = pgTable('maintenance', {
  id: text('id').primaryKey(),
  equipmentId: text('equipment_id').notNull().references(() => equipment.id, { onDelete: 'cascade' }),
  equipmentName: text('equipment_name').notNull(),
  engineer: text('engineer').notNull(),
  type: text('type').notNull(),
  priority: text('priority').notNull().default('Medium'),
  scheduledDate: text('scheduled_date').notNull(),
  time: text('time'),
  duration: text('duration'),
  notes: text('notes'),
  status: text('status').notNull().default('Scheduled'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const calibration = pgTable('calibration', {
  id: text('id').primaryKey(),
  equipmentId: text('equipment_id').notNull().references(() => equipment.id, { onDelete: 'cascade' }),
  equipmentName: text('equipment_name').notNull(),
  engineer: text('engineer').notNull(),
  type: text('type').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  dueDate: text('due_date'),
  notes: text('notes'),
  status: text('status').notNull().default('Scheduled'),
  certificateUrl: text('certificate_url'),
  certificateName: text('certificate_name'),
  certificateDate: text('certificate_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  timestamp: text('timestamp').notNull(),
  read: boolean('read').default(false),
  archived: boolean('archived').default(false),
  equipmentId: text('equipment_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  generatedBy: text('generated_by').notNull(),
  department: text('department'),
  date: text('date').notNull(),
  status: text('status').notNull().default('Ready'),
  summary: text('summary'),
  downloadUrl: text('download_url'),
  contentJson: text('content_json'),
  cachedAt: text('cached_at'),
  fileSize: text('file_size'),
  isCached: boolean('is_cached').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiActivities = pgTable('ai_activities', {
  id: text('id').primaryKey(),
  module: text('module').notNull(),
  action: text('action').notNull(),
  status: text('status').notNull(),
  equipmentId: text('equipment_id'),
  equipmentName: text('equipment_name'),
  durationMs: integer('duration_ms').default(0),
  summary: text('summary'),
  detailsJson: text('details_json'),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiAnalyses = pgTable('ai_analyses', {
  id: text('id').primaryKey(),
  equipmentId: text('equipment_id'),
  equipmentName: text('equipment_name'),
  module: text('module').notNull(),
  analysisType: text('analysis_type').notNull(),
  riskScore: integer('risk_score'),
  complianceStatus: text('compliance_status'),
  maintenancePrediction: text('maintenance_prediction'),
  recommendationsJson: text('recommendations_json'),
  rawOutput: text('raw_output'),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

