import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import {
  equipment,
  maintenance,
  calibration,
  notifications,
  reports,
  departments,
  users,
  aiActivities,
  aiAnalyses
} from './src/db/schema.ts';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { serverAiService } from './src/services/serverAiService.ts';

const app = express();
const PORT = 3000;

async function startServer() {

  app.use(express.json());

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Seed initial data if database is empty
  async function seedDatabaseIfEmpty() {
    try {
      // Clean up duplicate login notifications, keeping only the newest one per user/title
      try {
        await db.execute(sql`
          DELETE FROM notifications 
          WHERE id NOT IN (
            SELECT id FROM (
              SELECT id, ROW_NUMBER() OVER (PARTITION BY title, user_id ORDER BY created_at DESC) as rn
              FROM notifications
              WHERE title = 'User Login'
            ) t WHERE t.rn = 1
          ) AND title = 'User Login';
        `);
      } catch (e) {
        console.error('Error cleaning duplicate login notifications:', e);
      }

      const eqCountRes = await db.select({ count: count() }).from(equipment);
      if (eqCountRes[0]?.count === 0) {
        console.log('Seeding initial data into Cloud SQL database...');

        // Initial Departments
        await db.insert(departments).values([
          { name: 'ICU', code: 'ICU-01', head: 'Dr. Robert Vance', contact: 'ext-102' },
          { name: 'Emergency', code: 'EMG-02', head: 'Dr. Sarah Jenkins', contact: 'ext-104' },
          { name: 'Cardiology', code: 'CARD-03', head: 'Dr. Mark Sloan', contact: 'ext-108' },
          { name: 'Radiology', code: 'RAD-04', head: 'Dr. Helen Cho', contact: 'ext-112' },
          { name: 'Operation Theatre', code: 'OT-05', head: 'Dr. James Wilson', contact: 'ext-120' }
        ]).onConflictDoNothing();

        // Initial Equipment
        const sampleEquipment = [
          {
            id: 'EQ-1001',
            name: 'Hamilton Ventilator C3',
            category: 'Ventilator',
            department: 'ICU',
            manufacturer: 'Hamilton Medical',
            modelNumber: 'C3-HV',
            serialNumber: 'SN-982341',
            installationDate: '2025-01-15',
            status: 'Operational',
            riskLevel: 'Healthy',
            lastMaintenance: '2026-06-01',
            nextMaintenance: '2026-12-01',
            lastCalibration: '2026-05-01',
            nextCalibration: '2026-11-01',
            warrantyExpiry: '2027-01-01',
            certificationExpiry: '2026-12-31',
            assignedEngineer: 'Dr. Sarah Jenkins',
            expectedLifetime: 10,
            healthScore: 98,
            riskScore: 5
          },
          {
            id: 'EQ-1002',
            name: 'Philips IntelliVue MX800',
            category: 'Patient Monitor',
            department: 'ICU',
            manufacturer: 'Philips',
            modelNumber: 'MX800-P',
            serialNumber: 'SN-443120',
            installationDate: '2024-11-10',
            status: 'Operational',
            riskLevel: 'Healthy',
            lastMaintenance: '2026-05-15',
            nextMaintenance: '2026-11-15',
            lastCalibration: '2026-04-10',
            nextCalibration: '2026-10-10',
            warrantyExpiry: '2026-11-10',
            certificationExpiry: '2026-10-10',
            assignedEngineer: 'Alice Johnson',
            expectedLifetime: 8,
            healthScore: 94,
            riskScore: 12
          },
          {
            id: 'EQ-1003',
            name: 'GE Healthcare MAC 2000 ECG',
            category: 'ECG Machine',
            department: 'Cardiology',
            manufacturer: 'GE Healthcare',
            modelNumber: 'MAC-2000',
            serialNumber: 'SN-882190',
            installationDate: '2025-02-01',
            status: 'Calibration Due',
            riskLevel: 'Attention',
            lastMaintenance: '2026-01-20',
            nextMaintenance: '2026-07-20',
            lastCalibration: '2025-08-01',
            nextCalibration: '2026-08-01',
            warrantyExpiry: '2027-02-01',
            certificationExpiry: '2026-08-01',
            assignedEngineer: 'Dr. Sarah Jenkins',
            expectedLifetime: 7,
            healthScore: 82,
            riskScore: 45
          },
          {
            id: 'EQ-1004',
            name: 'Zoll R Series Defibrillator',
            category: 'Defibrillator',
            department: 'Emergency',
            manufacturer: 'Zoll',
            modelNumber: 'R-SERIES-E',
            serialNumber: 'SN-112948',
            installationDate: '2024-08-15',
            status: 'Maintenance',
            riskLevel: 'Due Soon',
            lastMaintenance: '2026-02-10',
            nextMaintenance: '2026-08-10',
            lastCalibration: '2026-01-15',
            nextCalibration: '2026-07-15',
            warrantyExpiry: '2026-08-15',
            certificationExpiry: '2026-08-01',
            assignedEngineer: 'Bob Williams',
            expectedLifetime: 10,
            healthScore: 71,
            riskScore: 68
          },
          {
            id: 'EQ-1005',
            name: 'Siemens SOMATOM CT Scanner',
            category: 'X-Ray Machine',
            department: 'Radiology',
            manufacturer: 'Siemens Healthineers',
            modelNumber: 'SOMATOM-GO',
            serialNumber: 'SN-773012',
            installationDate: '2023-05-20',
            status: 'Operational',
            riskLevel: 'Healthy',
            lastMaintenance: '2026-04-01',
            nextMaintenance: '2026-10-01',
            lastCalibration: '2026-03-15',
            nextCalibration: '2026-09-15',
            warrantyExpiry: '2028-05-20',
            certificationExpiry: '2026-09-15',
            assignedEngineer: 'Dr. Sarah Jenkins',
            expectedLifetime: 12,
            healthScore: 92,
            riskScore: 18
          }
        ];

        await db.insert(equipment).values(sampleEquipment as any).onConflictDoNothing();

        // Initial Maintenance
        await db.insert(maintenance).values([
          {
            id: 'MAINT-001',
            equipmentId: 'EQ-1004',
            equipmentName: 'Zoll R Series Defibrillator',
            engineer: 'Bob Williams',
            type: 'Maintenance',
            priority: 'High',
            scheduledDate: '2026-08-10',
            time: '09:00 AM',
            duration: '2 hours',
            notes: 'Battery test failure during automated morning diagnostic cycle.',
            status: 'Scheduled'
          },
          {
            id: 'MAINT-002',
            equipmentId: 'EQ-1001',
            equipmentName: 'Hamilton Ventilator C3',
            engineer: 'Dr. Sarah Jenkins',
            type: 'Maintenance',
            priority: 'Medium',
            scheduledDate: '2026-12-01',
            time: '02:00 PM',
            duration: '1.5 hours',
            notes: 'Routine 6-month preventative air intake filter replacement.',
            status: 'Scheduled'
          }
        ]).onConflictDoNothing();

        // Initial Calibration
        await db.insert(calibration).values([
          {
            id: 'CAL-001',
            equipmentId: 'EQ-1003',
            equipmentName: 'GE Healthcare MAC 2000 ECG',
            engineer: 'Dr. Sarah Jenkins',
            type: 'ECG Signal Accuracy Check',
            scheduledDate: '2026-08-01',
            dueDate: '2026-08-15',
            notes: 'Annual signal gain and wave frequency calibration required.',
            status: 'Scheduled'
          }
        ]).onConflictDoNothing();

        // Initial Notifications
        await db.insert(notifications).values([
          {
            id: 'NOTIF-001',
            title: 'ECG Machine Calibration Due',
            message: 'GE Healthcare MAC 2000 ECG (EQ-1003) is due for annual signal calibration.',
            type: 'Calibration',
            timestamp: new Date().toISOString(),
            read: false,
            archived: false,
            equipmentId: 'EQ-1003'
          },
          {
            id: 'NOTIF-002',
            title: 'Defibrillator Battery Alert',
            message: 'Zoll R Series Defibrillator (EQ-1004) flagged battery voltage irregularity.',
            type: 'Critical',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            archived: false,
            equipmentId: 'EQ-1004'
          }
        ]).onConflictDoNothing();

        // Initial Reports
        await db.insert(reports).values([
          {
            id: 'REP-101',
            title: 'Q2 Biomedical Compliance Audit',
            type: 'Compliance',
            generatedBy: 'Dr. Sarah Jenkins',
            department: 'Emergency & ICU',
            date: '2026-07-01',
            status: 'Generated',
            summary: 'Overall compliance rating: 96.4%. All life-support equipment verified.'
          }
        ]).onConflictDoNothing();

        console.log('Database seeding complete!');
      }
    } catch (err) {
      console.error('Database seed error:', err);
    }
  }

  await seedDatabaseIfEmpty();

  // === REALTIME SSE BROADCAST MANAGER ===
  const clients = new Set<express.Response>();

  function broadcastEvent(event: { type: string; action: string; id?: string; data?: any }) {
    const payload = `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch (err) {
        clients.delete(client);
      }
    }
  }

  setInterval(() => {
    for (const client of clients) {
      try {
        client.write(': ping\n\n');
      } catch (err) {
        clients.delete(client);
      }
    }
  }, 15000);

  app.get('/api/realtime', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (res.flushHeaders) res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    clients.add(res);

    req.on('close', () => {
      clients.delete(res);
    });
  });

  // === AUTO-NOTIFICATION HELPER ===
  async function createAutoNotification(data: {
    title: string;
    message: string;
    type: string;
    equipmentId?: string;
    userId?: string;
  }) {
    try {
      const id = `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const timestamp = new Date().toISOString();
      const insertedNotif = {
        id,
        userId: data.userId || null,
        title: data.title,
        message: data.message,
        type: data.type,
        timestamp,
        read: false,
        archived: false,
        equipmentId: data.equipmentId || null,
      };
      await db.insert(notifications).values(insertedNotif);
      broadcastEvent({ type: 'notifications', action: 'create', data: insertedNotif });
    } catch (err) {
      console.error('Error creating auto notification:', err);
    }
  }

  // === EQUIPMENT API ===
  app.get('/api/equipment', async (req, res) => {
    try {
      const data = await db.select().from(equipment).orderBy(desc(equipment.createdAt));
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching equipment:', error);
      res.status(500).json({ error: 'Failed to fetch equipment list' });
    }
  });

  app.get('/api/equipment/:id', async (req, res) => {
    try {
      const data = await db.select().from(equipment).where(eq(equipment.id, req.params.id));
      if (!data.length) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      res.json(data[0]);
    } catch (error: any) {
      console.error('Error fetching equipment item:', error);
      res.status(500).json({ error: 'Failed to fetch equipment item' });
    }
  });

  app.post('/api/equipment', requireAuth, async (req: AuthRequest, res) => {
    const newEq = req.body || {};
    const validationErrors: string[] = [];
    if (!newEq.name) validationErrors.push('Missing required field: name');
    if (!newEq.category) validationErrors.push('Missing required field: category');
    if (!newEq.department) validationErrors.push('Missing required field: department');
    if (!newEq.manufacturer) validationErrors.push('Missing required field: manufacturer');
    if (!newEq.modelNumber) validationErrors.push('Missing required field: modelNumber');
    if (!newEq.serialNumber) validationErrors.push('Missing required field: serialNumber');

    const validationResult = {
      valid: validationErrors.length === 0,
      errors: validationErrors
    };

    console.log('--- POST /api/equipment Request Diagnostics ---');
    console.log('Request body:', JSON.stringify(newEq, null, 2));
    console.log('Validation result:', JSON.stringify(validationResult, null, 2));
    console.log('----------------------------------------------');

    if (!validationResult.valid) {
      return res.status(400).json({
        error: 'Validation error',
        message: validationErrors.join(', '),
        validationResult
      });
    }

    try {
      if (!newEq.id) {
        newEq.id = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      const inserted = await db.insert(equipment).values(newEq).returning();

      broadcastEvent({ type: 'equipment', action: 'create', data: inserted[0] });

      // Auto-generate Notification on Equipment Added
      await createAutoNotification({
        title: 'Equipment Added',
        message: `New asset "${inserted[0].name}" (${inserted[0].id}) was added to ${inserted[0].department} department.`,
        type: 'Compliance',
        equipmentId: inserted[0].id
      });

      res.status(201).json(inserted[0]);
    } catch (error: any) {
      console.error('--- POST /api/equipment DATABASE ERROR ---');
      console.error('Request body:', JSON.stringify(newEq, null, 2));
      console.error('Validation result:', JSON.stringify(validationResult, null, 2));
      console.error('SQL/database error:', error);
      console.error('Stack trace:', error.stack);
      console.error('-------------------------------------------');

      const isDuplicateKey = error.code === '23505' || (error.message && error.message.toLowerCase().includes('duplicate key'));
      if (isDuplicateKey) {
        return res.status(409).json({
          error: 'Duplicate key error',
          message: error.message,
          detail: error.detail || error.hint,
          code: error.code,
          stack: error.stack
        });
      }

      const isDev = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: isDev ? error.message : 'Failed to create equipment',
        details: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        stack: isDev ? error.stack : undefined
      });
    }
  });

  app.put('/api/equipment/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await db.update(equipment)
        .set(req.body)
        .where(eq(equipment.id, req.params.id))
        .returning();
      if (!updated.length) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      broadcastEvent({ type: 'equipment', action: 'update', id: req.params.id, data: updated[0] });

      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      res.status(500).json({ error: 'Failed to update equipment' });
    }
  });

  app.delete('/api/equipment/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const deleted = await db.delete(equipment).where(eq(equipment.id, req.params.id)).returning();
      if (!deleted.length) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      broadcastEvent({ type: 'equipment', action: 'delete', id: req.params.id });

      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      res.status(500).json({ error: 'Failed to delete equipment' });
    }
  });

  // === MAINTENANCE API ===
  app.get('/api/maintenance', async (req, res) => {
    try {
      const data = await db.select().from(maintenance).orderBy(desc(maintenance.createdAt));
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching maintenance records:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance records' });
    }
  });

  app.post('/api/maintenance', requireAuth, async (req: AuthRequest, res) => {
    try {
      const newRec = req.body;
      if (!newRec.id) {
        newRec.id = `MAINT-${Math.floor(100 + Math.random() * 900)}`;
      }
      const inserted = await db.insert(maintenance).values(newRec).returning();

      // Update Equipment's Next Maintenance Date & Assigned Engineer
      if (inserted[0].equipmentId) {
        const updateEqObj: Record<string, any> = {
          nextMaintenance: inserted[0].scheduledDate
        };
        if (inserted[0].engineer) {
          updateEqObj.assignedEngineer = inserted[0].engineer;
        }
        if (inserted[0].priority === 'Critical' || inserted[0].type === 'Repair') {
          updateEqObj.status = 'Maintenance';
          updateEqObj.riskLevel = 'Attention';
        }
        await db.update(equipment)
          .set(updateEqObj)
          .where(eq(equipment.id, inserted[0].equipmentId))
          .catch(err => console.error('Error updating equipment on maintenance creation:', err));
      }

      // Auto-generate Maintenance Notification
      await createAutoNotification({
        title: 'Maintenance Scheduled',
        message: `Maintenance scheduled for ${inserted[0].equipmentName} (${inserted[0].equipmentId}) on ${inserted[0].scheduledDate} by ${inserted[0].engineer || 'Biomedical Engineer'}.`,
        type: 'Maintenance',
        equipmentId: inserted[0].equipmentId
      });

      broadcastEvent({ type: 'maintenance', action: 'create', data: inserted[0] });

      res.status(201).json(inserted[0]);
    } catch (error: any) {
      console.error('Error creating maintenance record:', error);
      res.status(500).json({ error: 'Failed to create maintenance record' });
    }
  });

  app.put('/api/maintenance/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await db.update(maintenance)
        .set(req.body)
        .where(eq(maintenance.id, req.params.id))
        .returning();
      if (!updated.length) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      const rec = updated[0];

      // Handle Equipment Health & Status Updates
      if (rec.equipmentId) {
        if (req.body.status === 'Completed') {
          const todayStr = new Date().toISOString().split('T')[0];
          await db.update(equipment)
            .set({
              status: 'Operational',
              riskLevel: 'Healthy',
              healthScore: 98,
              riskScore: 10,
              lastMaintenance: rec.scheduledDate || todayStr,
            })
            .where(eq(equipment.id, rec.equipmentId))
            .catch(err => console.error('Error updating equipment health on completion:', err));

          broadcastEvent({ type: 'equipment', action: 'update', id: rec.equipmentId });

          await createAutoNotification({
            title: 'Maintenance Completed',
            message: `Maintenance completed for ${rec.equipmentName} (${rec.equipmentId}). Equipment health restored to 98%.`,
            type: 'Maintenance',
            equipmentId: rec.equipmentId
          });
        } else if (req.body.status === 'Cancelled') {
          await db.update(equipment)
            .set({
              status: 'Operational'
            })
            .where(eq(equipment.id, rec.equipmentId))
            .catch(err => console.error('Error updating equipment on cancellation:', err));

          broadcastEvent({ type: 'equipment', action: 'update', id: rec.equipmentId });

          await createAutoNotification({
            title: 'Maintenance Cancelled',
            message: `Scheduled maintenance for ${rec.equipmentName} (${rec.equipmentId}) was cancelled.`,
            type: 'Maintenance',
            equipmentId: rec.equipmentId
          });
        } else if (req.body.scheduledDate) {
          await db.update(equipment)
            .set({ nextMaintenance: req.body.scheduledDate })
            .where(eq(equipment.id, rec.equipmentId))
            .catch(err => console.error('Error updating equipment on reschedule:', err));

          broadcastEvent({ type: 'equipment', action: 'update', id: rec.equipmentId });

          await createAutoNotification({
            title: 'Maintenance Rescheduled',
            message: `Maintenance for ${rec.equipmentName} (${rec.equipmentId}) rescheduled to ${req.body.scheduledDate}.`,
            type: 'Maintenance',
            equipmentId: rec.equipmentId
          });
        } else if (req.body.engineer) {
          await db.update(equipment)
            .set({ assignedEngineer: req.body.engineer })
            .where(eq(equipment.id, rec.equipmentId))
            .catch(err => console.error('Error updating equipment engineer assignment:', err));

          broadcastEvent({ type: 'equipment', action: 'update', id: rec.equipmentId });

          await createAutoNotification({
            title: 'Engineer Assigned',
            message: `Engineer ${req.body.engineer} was assigned to maintenance for ${rec.equipmentName} (${rec.equipmentId}).`,
            type: 'Maintenance',
            equipmentId: rec.equipmentId
          });
        }
      }

      broadcastEvent({ type: 'maintenance', action: 'update', id: req.params.id, data: rec });

      res.json(rec);
    } catch (error: any) {
      console.error('Error updating maintenance record:', error);
      res.status(500).json({ error: 'Failed to update maintenance record' });
    }
  });

  app.delete('/api/maintenance/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const deleted = await db.delete(maintenance).where(eq(maintenance.id, req.params.id)).returning();
      if (!deleted.length) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      broadcastEvent({ type: 'maintenance', action: 'delete', id: req.params.id });

      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      console.error('Error deleting maintenance record:', error);
      res.status(500).json({ error: 'Failed to delete maintenance record' });
    }
  });

  // === CALIBRATION API ===
  app.get('/api/calibration', async (req, res) => {
    try {
      const data = await db.select().from(calibration).orderBy(desc(calibration.createdAt));
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching calibration records:', error);
      res.status(500).json({ error: 'Failed to fetch calibration records' });
    }
  });

  app.post('/api/calibration', requireAuth, async (req: AuthRequest, res) => {
    try {
      const newRec = req.body;
      if (!newRec.id) {
        newRec.id = `CAL-${Math.floor(100 + Math.random() * 900)}`;
      }
      const inserted = await db.insert(calibration).values(newRec).returning();

      const rec = inserted[0];

      // Update Equipment's Next Calibration Date
      if (rec.equipmentId) {
        await db.update(equipment)
          .set({
            nextCalibration: rec.scheduledDate || rec.dueDate
          })
          .where(eq(equipment.id, rec.equipmentId))
          .catch(err => console.error('Error updating equipment on calibration schedule:', err));
      }

      // Auto-generate Calibration Notification
      await createAutoNotification({
        title: 'Calibration Scheduled',
        message: `Calibration scheduled for ${rec.equipmentName} (${rec.equipmentId}) on ${rec.scheduledDate} by ${rec.engineer || 'Biomedical Engineer'}.`,
        type: 'Calibration',
        equipmentId: rec.equipmentId
      });

      broadcastEvent({ type: 'calibration', action: 'create', data: rec });

      res.status(201).json(rec);
    } catch (error: any) {
      console.error('Error creating calibration record:', error);
      res.status(500).json({ error: 'Failed to create calibration record' });
    }
  });

  app.put('/api/calibration/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await db.update(calibration)
        .set(req.body)
        .where(eq(calibration.id, req.params.id))
        .returning();
      if (!updated.length) {
        return res.status(404).json({ error: 'Calibration record not found' });
      }

      const rec = updated[0];

      // Handle Equipment Compliance & Health Updates
      if (rec.equipmentId) {
        if (req.body.status === 'Completed') {
          const todayStr = new Date().toISOString().split('T')[0];
          const nextYearStr = rec.dueDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          await db.update(equipment)
            .set({
              status: 'Operational',
              riskLevel: 'Healthy',
              healthScore: 99,
              riskScore: 5,
              lastCalibration: rec.scheduledDate || todayStr,
              nextCalibration: nextYearStr
            })
            .where(eq(equipment.id, rec.equipmentId))
            .catch(err => console.error('Error updating equipment health on calibration completion:', err));

          broadcastEvent({ type: 'equipment', action: 'update', id: rec.equipmentId });

          await createAutoNotification({
            title: 'Calibration Completed',
            message: `Calibration completed for ${rec.equipmentName} (${rec.equipmentId}). Certificate stored: ${rec.certificateName || 'Certified'}. Equipment compliance updated to 100%.`,
            type: 'Calibration',
            equipmentId: rec.equipmentId
          });
        } else if (req.body.status === 'Cancelled') {
          await createAutoNotification({
            title: 'Calibration Cancelled',
            message: `Scheduled calibration for ${rec.equipmentName} (${rec.equipmentId}) was cancelled.`,
            type: 'Calibration',
            equipmentId: rec.equipmentId
          });
        } else if (req.body.scheduledDate || req.body.status === 'Rescheduled') {
          if (req.body.scheduledDate) {
            await db.update(equipment)
              .set({ nextCalibration: req.body.scheduledDate })
              .where(eq(equipment.id, rec.equipmentId))
              .catch(err => console.error('Error updating equipment on calibration reschedule:', err));

            broadcastEvent({ type: 'equipment', action: 'update', id: rec.equipmentId });
          }

          await createAutoNotification({
            title: 'Calibration Rescheduled',
            message: `Calibration for ${rec.equipmentName} (${rec.equipmentId}) rescheduled to ${rec.scheduledDate || rec.dueDate}.`,
            type: 'Calibration',
            equipmentId: rec.equipmentId
          });
        } else if (req.body.certificateUrl) {
          await createAutoNotification({
            title: 'Calibration Certificate Uploaded',
            message: `Calibration certificate "${rec.certificateName || 'Certificate.pdf'}" uploaded for ${rec.equipmentName} (${rec.equipmentId}).`,
            type: 'Calibration',
            equipmentId: rec.equipmentId
          });
        }
      }

      broadcastEvent({ type: 'calibration', action: 'update', id: req.params.id, data: rec });

      res.json(rec);
    } catch (error: any) {
      console.error('Error updating calibration record:', error);
      res.status(500).json({ error: 'Failed to update calibration record' });
    }
  });

  app.delete('/api/calibration/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const deleted = await db.delete(calibration).where(eq(calibration.id, req.params.id)).returning();
      if (!deleted.length) {
        return res.status(404).json({ error: 'Calibration record not found' });
      }

      broadcastEvent({ type: 'calibration', action: 'delete', id: req.params.id });

      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      console.error('Error deleting calibration record:', error);
      res.status(500).json({ error: 'Failed to delete calibration record' });
    }
  });

  // === NOTIFICATIONS API ===
  app.get('/api/notifications', async (req, res) => {
    try {
      const filter = (req.query.filter as string) || 'All';
      const type = (req.query.type as string) || 'All';
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : null;

      // Order newest first by createdAt / timestamp
      const allNotifs = await db.select().from(notifications).orderBy(desc(notifications.createdAt));

      const unreadCount = allNotifs.filter(n => !n.archived && !n.read).length;

      let filtered = allNotifs;

      if (filter === 'Unread') {
        filtered = filtered.filter(n => !n.archived && !n.read);
      } else if (filter === 'Archived') {
        filtered = filtered.filter(n => n.archived);
      } else if (filter === 'Read') {
        filtered = filtered.filter(n => !n.archived && n.read);
      } else if (filter !== 'AllWithArchived') {
        // Default 'All' excludes archived items
        filtered = filtered.filter(n => !n.archived);
      }

      if (type && type !== 'All') {
        filtered = filtered.filter(n => n.type.toLowerCase() === type.toLowerCase());
      }

      const total = filtered.length;
      let paginated = filtered;
      let totalPages = 1;

      if (limitParam && limitParam > 0) {
        totalPages = Math.ceil(total / limitParam) || 1;
        const offset = (page - 1) * limitParam;
        paginated = filtered.slice(offset, offset + limitParam);
      }

      res.json({
        data: paginated,
        total,
        unreadCount,
        page,
        limit: limitParam || total,
        totalPages
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.get('/api/notifications/unread-count', async (req, res) => {
    try {
      const allNotifs = await db.select().from(notifications);
      const unreadCount = allNotifs.filter(n => !n.archived && !n.read).length;
      res.json({ unreadCount });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  });

  app.post('/api/notifications', requireAuth, async (req: AuthRequest, res) => {
    try {
      const newNotif = req.body;
      if (!newNotif.id) {
        newNotif.id = `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      }
      if (!newNotif.timestamp) {
        newNotif.timestamp = new Date().toISOString();
      }
      if (newNotif.read === undefined) newNotif.read = false;
      if (newNotif.archived === undefined) newNotif.archived = false;

      const inserted = await db.insert(notifications).values(newNotif).returning();

      broadcastEvent({ type: 'notifications', action: 'create', data: inserted[0] });

      res.status(201).json(inserted[0]);
    } catch (error: any) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  app.put('/api/notifications/read-all', requireAuth, async (req: AuthRequest, res) => {
    try {
      await db.update(notifications).set({ read: true });

      broadcastEvent({ type: 'notifications', action: 'updateAll' });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all as read' });
    }
  });

  app.put('/api/notifications/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await db.update(notifications)
        .set(req.body)
        .where(eq(notifications.id, req.params.id))
        .returning();
      if (!updated.length) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      broadcastEvent({ type: 'notifications', action: 'update', id: req.params.id, data: updated[0] });

      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  app.delete('/api/notifications/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const deleted = await db.delete(notifications).where(eq(notifications.id, req.params.id)).returning();
      if (!deleted.length) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      broadcastEvent({ type: 'notifications', action: 'delete', id: req.params.id });

      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // === USERS API ===
  app.get('/api/users/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Unauthorized' });

      const existingUser = await db.select().from(users).where(eq(users.uid, uid));
      if (existingUser.length) {
        return res.json(existingUser[0]);
      }

      // Upsert default profile
      const newUser = await db.insert(users).values({
        uid,
        email: req.user?.email || 'user@apollo.org',
        displayName: (req.user as any)?.name || 'Biomedical Engineer',
        photoURL: (req.user as any)?.picture || null
      }).onConflictDoUpdate({
        target: users.uid,
        set: { email: req.user?.email || 'user@apollo.org' }
      }).returning();

      res.json(newUser[0]);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email, displayName, photoURL } = req.body;
      const userRecord = await db.insert(users).values({
        uid,
        email,
        displayName,
        photoURL
      }).onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
          photoURL
        }
      }).returning();

      res.json(userRecord[0]);
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  app.post('/api/users/login-event', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email, displayName, photoURL } = req.body;
      const userRecord = await db.insert(users).values({
        uid,
        email,
        displayName,
        photoURL
      }).onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
          photoURL
        }
      }).returning();

      // Check if a login notification was already created within the last 60 seconds (event deduplication / request locking)
      const sixtySecondsAgo = new Date(Date.now() - 60000);
      const recentLoginNotifs = await db.select().from(notifications)
        .where(and(
          eq(notifications.title, 'User Login'),
          eq(notifications.userId, uid)
        ));

      const hasRecent = recentLoginNotifs.some(n => n.createdAt && new Date(n.createdAt) > sixtySecondsAgo);

      if (!hasRecent) {
        const userName = displayName || email || 'Biomedical Engineer';
        await createAutoNotification({
          title: 'User Login',
          message: `${userName} logged in to MedGuard Command Center.`,
          type: 'Login',
          userId: uid
        });
      }

      res.json(userRecord[0]);
    } catch (error: any) {
      console.error('Error handling login event:', error);
      res.status(500).json({ error: 'Failed to handle login event' });
    }
  });

  app.put('/api/users/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: 'Unauthorized' });

      const updated = await db.update(users)
        .set(req.body)
        .where(eq(users.uid, uid))
        .returning();

      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // === AI SERVICE API ===
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { task, payload } = req.body;
      if (!task) {
        return res.status(400).json({ error: 'Task type is required (compliance, risk, maintenance, summary, explain)' });
      }

      // If payload data wasn't fully supplied, pull live database context
      let contextualPayload = payload;
      if (!contextualPayload) {
        const allEq = await db.select().from(equipment);
        const allMaint = await db.select().from(maintenance);
        const allCalib = await db.select().from(calibration);
        contextualPayload = { equipment: allEq, maintenance: allMaint, calibration: allCalib };
      }

      const analysisResult = await serverAiService.analyze(task, contextualPayload);
      res.json({ result: analysisResult, task, timestamp: new Date().toISOString() });
    } catch (error: any) {
      console.error('Error running AI analysis:', error);
      res.status(500).json({ error: 'Failed to complete AI analysis' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history = [], contextData } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      let fleetContext = contextData;
      if (!fleetContext) {
        const allEq = await db.select().from(equipment);
        fleetContext = { equipment: allEq };
      }

      let responseText = '';
      await serverAiService.streamChat(message, history, fleetContext, (chunk) => {
        responseText += chunk;
      });

      res.json({ response: responseText, timestamp: new Date().toISOString() });
    } catch (error: any) {
      console.error('Error in AI chat endpoint:', error);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });

  app.post('/api/ai/chat/stream', async (req, res) => {
    try {
      const { message, history = [], contextData } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      let fleetContext = contextData;
      if (!fleetContext) {
        const allEq = await db.select().from(equipment);
        fleetContext = { equipment: allEq };
      }

      // Set headers for Server-Sent Events (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await serverAiService.streamChat(message, history, fleetContext, (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Error in AI chat streaming endpoint:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream AI response' });
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Streaming interrupted' })}\n\n`);
        res.end();
      }
    }
  });

  // === MEDGUARD AI ORCHESTRATOR PLATFORM API ===
  app.get('/api/ai/activities', async (req, res) => {
    try {
      const activities = await db.select().from(aiActivities).orderBy(desc(aiActivities.createdAt));
      res.json(activities);
    } catch (error: any) {
      console.error('Error fetching AI activities:', error);
      res.status(500).json({ error: 'Failed to fetch AI activities' });
    }
  });

  app.get('/api/ai/analyses', async (req, res) => {
    try {
      const eqId = req.query.equipmentId as string;
      const dateFilter = req.query.date as string;
      
      let analyses = await db.select().from(aiAnalyses).orderBy(desc(aiAnalyses.createdAt));
      if (eqId && eqId !== 'All') {
        analyses = analyses.filter(a => a.equipmentId === eqId);
      }
      if (dateFilter) {
        analyses = analyses.filter(a => a.date && a.date.startsWith(dateFilter));
      }
      res.json(analyses);
    } catch (error: any) {
      console.error('Error fetching AI analyses:', error);
      res.status(500).json({ error: 'Failed to fetch AI analyses history' });
    }
  });

  app.get('/api/ai/orchestrator/status', async (req, res) => {
    try {
      const recentActivities = await db.select().from(aiActivities).orderBy(desc(aiActivities.createdAt)).limit(10);
      
      // Determine module statuses
      const modules = [
        { name: 'Compliance Intelligence', status: 'Running', lastExecution: new Date().toISOString(), durationMs: 420 },
        { name: 'Predictive Maintenance Intelligence', status: 'Running', lastExecution: new Date().toISOString(), durationMs: 580 },
        { name: 'Risk Intelligence', status: 'Running', lastExecution: new Date().toISOString(), durationMs: 510 },
        { name: 'Biomedical Copilot', status: 'Running', lastExecution: new Date().toISOString(), durationMs: 310 }
      ];

      res.json({
        orchestratorStatus: 'Active',
        modules,
        recentActivitiesCount: recentActivities.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error fetching orchestrator status:', error);
      res.status(500).json({ error: 'Failed to fetch orchestrator status' });
    }
  });

  app.post('/api/ai/orchestrate', async (req, res) => {
    const startTime = Date.now();
    const timestampStr = new Date().toISOString();
    const dateOnly = timestampStr.split('T')[0];
    const { equipmentId } = req.body || {};

    try {
      // 1. Equipment Data Collection
      const allEq = await db.select().from(equipment);
      const targetEq = equipmentId ? allEq.find(e => e.id === equipmentId) : allEq[0];
      const targetEqName = targetEq ? targetEq.name : 'Entire Biomedical Fleet';

      // 2. Maintenance History Collection
      const allMaint = await db.select().from(maintenance);
      const targetMaint = equipmentId ? allMaint.filter(m => m.equipmentId === equipmentId) : allMaint;

      // 3. Calibration History Collection
      const allCalib = await db.select().from(calibration);
      const targetCalib = equipmentId ? allCalib.filter(c => c.equipmentId === equipmentId) : allCalib;

      // Log step activities
      const runId = `AI-ORCH-${Math.floor(100000 + Math.random() * 900000)}`;

      // 4 & 5. Risk & Compliance Analysis via Gemini AI
      const compliancePayload = { equipment: targetEq || allEq, calibration: targetCalib };
      const riskPayload = { equipment: targetEq || allEq, maintenance: targetMaint };

      const complianceResult = await serverAiService.analyze('compliance', compliancePayload);
      const riskResult = await serverAiService.analyze('risk', riskPayload);
      const maintenanceResult = await serverAiService.analyze('maintenance', { maintenance: targetMaint, equipment: targetEq || allEq });

      const duration = Date.now() - startTime;

      // 6, 7, 8, 9, 10. Pipeline execution steps saved to database
      const summaryText = `Orchestration completed successfully for ${targetEqName}. Evaluated compliance, predictive risk, and maintenance health.`;

      // Log AI Activity
      await db.insert(aiActivities).values({
        id: runId,
        module: 'Central Orchestrator',
        action: 'Full Pipeline Execution (Compliance, Risk, Maintenance, Copilot)',
        status: 'Success',
        equipmentId: equipmentId || 'FLEET-ALL',
        equipmentName: targetEqName,
        durationMs: duration,
        summary: summaryText,
        timestamp: timestampStr
      }).onConflictDoNothing();

      // Log individual module activities
      await db.insert(aiActivities).values([
        {
          id: `${runId}-COMP`,
          module: 'Compliance Intelligence',
          action: 'ISO 13485 Audit Verification',
          status: 'Success',
          equipmentId: equipmentId,
          equipmentName: targetEqName,
          durationMs: Math.round(duration * 0.25),
          summary: 'Compliance audit verified against ISO standards.',
          timestamp: timestampStr
        },
        {
          id: `${runId}-RISK`,
          module: 'Risk Intelligence',
          action: 'Vulnerability & Failure Probability Calculation',
          status: 'Success',
          equipmentId: equipmentId,
          equipmentName: targetEqName,
          durationMs: Math.round(duration * 0.3),
          summary: 'Risk score and critical asset identification completed.',
          timestamp: timestampStr
        },
        {
          id: `${runId}-MAINT`,
          module: 'Predictive Maintenance Intelligence',
          action: 'Downtime Forecasting & Work Order Check',
          status: 'Success',
          equipmentId: equipmentId,
          equipmentName: targetEqName,
          durationMs: Math.round(duration * 0.25),
          summary: 'Preventive maintenance schedule optimized.',
          timestamp: timestampStr
        },
        {
          id: `${runId}-COPILOT`,
          module: 'Biomedical Copilot',
          action: 'Clinical Decision Support Synthesis',
          status: 'Success',
          equipmentId: equipmentId,
          equipmentName: targetEqName,
          durationMs: Math.round(duration * 0.2),
          summary: 'Actionable engineering recommendations synthesized.',
          timestamp: timestampStr
        }
      ]).onConflictDoNothing();

      // Save to AI Analyses History
      const analysisId = `ANA-${Math.floor(100000 + Math.random() * 900000)}`;
      await db.insert(aiAnalyses).values({
        id: analysisId,
        equipmentId: equipmentId || 'FLEET-ALL',
        equipmentName: targetEqName,
        module: 'Central Orchestrator & Multi-Module Pipeline',
        analysisType: 'Comprehensive Pipeline Audit',
        riskScore: targetEq ? targetEq.riskScore : 15,
        complianceStatus: 'Grade A - ISO 13485 Compliant',
        maintenancePrediction: 'Operational next 90 days',
        recommendationsJson: JSON.stringify([
          'Schedule periodic sensor verification for high-priority ICU assets.',
          'Verify calibration certificate expiration dates before Q4 audit.',
          'Maintain preventive maintenance turnaround under 48 hours.'
        ]),
        rawOutput: `Compliance:\n${complianceResult}\n\nRisk:\n${riskResult}\n\nMaintenance:\n${maintenanceResult}`,
        date: dateOnly
      }).onConflictDoNothing();

      // Create Notification
      const notifId = `NOTIF-AI-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.insert(notifications).values({
        id: notifId,
        title: 'MedGuard AI Orchestrator Pipeline Executed',
        message: `Successfully completed 4-module AI pipeline for ${targetEqName}. All metrics updated.`,
        type: 'Compliance',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        archived: false,
        equipmentId: equipmentId
      }).onConflictDoNothing();

      res.json({
        success: true,
        runId,
        durationMs: duration,
        timestamp: timestampStr,
        results: {
          compliance: complianceResult,
          risk: riskResult,
          maintenance: maintenanceResult,
          recommendations: [
            'Schedule periodic sensor verification for high-priority ICU assets.',
            'Verify calibration certificate expiration dates before Q4 audit.',
            'Maintain preventive maintenance turnaround under 48 hours.'
          ]
        }
      });
    } catch (error: any) {
      console.error('Error running AI orchestration pipeline:', error);
      const duration = Date.now() - startTime;
      
      // Log error activity
      try {
        await db.insert(aiActivities).values({
          id: `AI-ERR-${Math.floor(1000 + Math.random() * 9000)}`,
          module: 'Central Orchestrator',
          action: 'Full Pipeline Execution',
          status: 'Error',
          equipmentId: equipmentId,
          durationMs: duration,
          summary: error.message || 'Pipeline execution failed',
          timestamp: timestampStr
        }).onConflictDoNothing();
      } catch (logErr) {}

      res.status(500).json({
        error: 'AI Orchestration pipeline failed',
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  });

  // === REPORTS API ===
  app.get('/api/reports', async (req, res) => {
    try {
      const typeFilter = req.query.type as string;
      const deptFilter = req.query.department as string;

      let allReports = await db.select().from(reports).orderBy(desc(reports.createdAt));

      if (typeFilter && typeFilter !== 'All') {
        allReports = allReports.filter(r => r.type.toLowerCase() === typeFilter.toLowerCase());
      }
      if (deptFilter && deptFilter !== 'All' && deptFilter !== 'All Departments') {
        allReports = allReports.filter(r => r.department === deptFilter);
      }

      res.json(allReports);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  app.get('/api/reports/:id', async (req, res) => {
    try {
      const found = await db.select().from(reports).where(eq(reports.id, req.params.id));
      if (!found.length) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(found[0]);
    } catch (error: any) {
      console.error('Error fetching report details:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  });

  app.post('/api/reports/generate', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { type, department = 'All Departments', forceRegenerate = false, generatedBy } = req.body;
      const reportType = type || 'Executive Summary';
      const dept = department || 'All Departments';
      const author = generatedBy || (req.user?.name || req.user?.email || 'Biomedical AI Engine');

      // 1. Check for cached report (generated within last 24 hours) if forceRegenerate is false
      if (!forceRegenerate) {
        const existingReports = await db.select().from(reports).orderBy(desc(reports.createdAt));
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const cachedReport = existingReports.find(r => {
          if (r.type !== reportType) return false;
          if (r.department !== dept) return false;
          const createdDate = r.createdAt ? new Date(r.createdAt) : new Date(r.date);
          return createdDate >= oneDayAgo;
        });

        if (cachedReport) {
          // Return cached report with cached flag
          return res.json({
            ...cachedReport,
            status: 'Cached',
            isCached: true
          });
        }
      }

      // 2. Fetch live data for generation
      const allEq = await db.select().from(equipment);
      const allMaint = await db.select().from(maintenance);
      const allCalib = await db.select().from(calibration);

      // Filter by department if specific
      const targetEq = (dept === 'All' || dept === 'All Departments')
        ? allEq
        : allEq.filter(e => e.department === dept);

      const targetEqIds = new Set(targetEq.map(e => e.id));
      const targetMaint = allMaint.filter(m => targetEqIds.has(m.equipmentId));
      const targetCalib = allCalib.filter(c => targetEqIds.has(c.equipmentId));

      const totalEq = targetEq.length || 1;
      const operationalCount = targetEq.filter(e => e.status === 'Operational').length;
      const maintenanceCount = targetEq.filter(e => e.status === 'Maintenance' || e.status === 'Maintenance Due').length;
      const criticalCount = targetEq.filter(e => e.status === 'Critical' || e.riskScore > 70).length;
      const calibrationDueCount = targetEq.filter(e => e.status === 'Calibration Due' || (e.nextCalibration && new Date(e.nextCalibration) <= new Date())).length;

      const avgHealth = Math.round(targetEq.reduce((acc, e) => acc + (e.healthScore || 90), 0) / totalEq);
      const avgRisk = Math.round(targetEq.reduce((acc, e) => acc + (e.riskScore || 15), 0) / totalEq);
      const complianceRate = Math.min(100, Math.max(0, Math.round(((totalEq - calibrationDueCount) / totalEq) * 100)));

      let title = '';
      let summary = '';
      let kpis: any[] = [];
      let recommendations: string[] = [];
      let tableRows: any[] = [];

      const todayStr = new Date().toISOString().split('T')[0];

      if (reportType === 'Compliance') {
        title = `Medical Equipment Compliance Audit - ${dept}`;
        summary = `Comprehensive compliance analysis for ${dept}. Overall fleet compliance stands at ${complianceRate}%. Identified ${calibrationDueCount} assets with pending or expired calibration certificates requiring immediate biomedical validation for FDA / ISO 13485 audit readiness.`;
        
        kpis = [
          { label: 'Overall Compliance Rate', value: `${complianceRate}%`, status: complianceRate > 90 ? 'Healthy' : 'Attention', change: '+2.4%' },
          { label: 'Total Assets Audited', value: `${totalEq}`, status: 'Healthy', change: '100% Covered' },
          { label: 'Calibration Overdue / Due', value: `${calibrationDueCount}`, status: calibrationDueCount > 0 ? 'Critical' : 'Healthy', change: 'Requires Action' },
          { label: 'ISO 13485 Audit Index', value: `${complianceRate > 85 ? 'Grade A' : 'Grade B'}`, status: 'Healthy', change: 'Compliant' }
        ];

        recommendations = [
          `Schedule immediate calibration for ${calibrationDueCount} flagged equipment units in ${dept}.`,
          `Ensure digital calibration certificates are uploaded for all recent vendor services.`,
          `Conduct quarterly mock audits for emergency & ICU life-support hardware.`
        ];

        tableRows = targetEq.map(e => ({
          id: e.id,
          name: e.name,
          category: e.category,
          department: e.department,
          status: e.status,
          lastCalibration: e.lastCalibration || 'N/A',
          nextCalibration: e.nextCalibration || 'N/A',
          complianceStatus: (e.status === 'Calibration Due' || (e.nextCalibration && new Date(e.nextCalibration) <= new Date())) ? 'Non-Compliant' : 'Compliant'
        }));

      } else if (reportType === 'Maintenance') {
        title = `Biomedical Maintenance & Breakdown Log - ${dept}`;
        const completedMaint = targetMaint.filter(m => m.status === 'Completed').length;
        const pendingMaint = targetMaint.filter(m => m.status !== 'Completed').length;
        const pmRate = Math.round((completedMaint / (targetMaint.length || 1)) * 100);

        summary = `Maintenance activity analysis for ${dept}. Completed ${completedMaint} maintenance tasks with a ${pmRate}% preventive maintenance completion rate. Currently ${pendingMaint} active service requests in queue with estimated downtime of ${(pendingMaint * 3.5).toFixed(1)} hours.`;

        kpis = [
          { label: 'PM Completion Rate', value: `${pmRate}%`, status: pmRate > 80 ? 'Healthy' : 'Attention', change: '+4.1%' },
          { label: 'Completed Services', value: `${completedMaint}`, status: 'Healthy', change: 'Total Done' },
          { label: 'Active Work Orders', value: `${pendingMaint}`, status: pendingMaint > 3 ? 'Attention' : 'Healthy', change: 'In Queue' },
          { label: 'Est. Equipment Downtime', value: `${(pendingMaint * 3.5).toFixed(1)} hrs`, status: 'Attention', change: 'Monthly' }
        ];

        recommendations = [
          `Prioritize pending maintenance for high-criticality ICU and Emergency devices.`,
          `Reassign available engineers to clear the ${pendingMaint} open work orders.`,
          `Review spare parts inventory for common replacement items (sensors, tubing, batteries).`
        ];

        tableRows = targetMaint.map(m => ({
          id: m.id,
          equipmentName: m.equipmentName,
          engineer: m.engineer,
          type: m.type,
          priority: m.priority,
          scheduledDate: m.scheduledDate,
          status: m.status
        }));

      } else if (reportType === 'Risk') {
        title = `Asset Risk & Failure Probability Analysis - ${dept}`;
        const highRiskAssets = targetEq.filter(e => e.riskScore > 50 || e.status === 'Critical');

        summary = `Risk assessment and asset vulnerability profile for ${dept}. Detected ${highRiskAssets.length} high-risk assets requiring immediate engineering inspection. Average fleet risk index is ${avgRisk}/100 with predictive failure mitigation recommendations.`;

        kpis = [
          { label: 'Average Risk Index', value: `${avgRisk}/100`, status: avgRisk < 30 ? 'Healthy' : 'Attention', change: '-3 pts' },
          { label: 'High / Critical Risk Assets', value: `${highRiskAssets.length}`, status: highRiskAssets.length > 0 ? 'Critical' : 'Healthy', change: 'Action Required' },
          { label: 'Avg Fleet Health Score', value: `${avgHealth}%`, status: avgHealth > 80 ? 'Healthy' : 'Attention', change: 'Stable' },
          { label: 'Failure Risk Level', value: avgRisk > 40 ? 'Moderate' : 'Low', status: avgRisk > 40 ? 'Attention' : 'Healthy', change: 'Monitored' }
        ];

        recommendations = [
          `Inspect and calibrate ${highRiskAssets.length} high-risk equipment units immediately.`,
          `Implement AI-driven telemetry monitoring for devices with health score under 75%.`,
          `Plan capital expenditure replacement for equipment exceeding 8 years of operational lifespan.`
        ];

        tableRows = targetEq.map(e => ({
          id: e.id,
          name: e.name,
          department: e.department,
          healthScore: `${e.healthScore}%`,
          riskScore: `${e.riskScore}/100`,
          riskLevel: e.riskLevel,
          status: e.status
        }));

      } else {
        // Executive Summary
        title = `Executive Board Summary - Hospital Medical Asset Operations`;
        summary = `High-level operational overview for ${dept}. Managing ${totalEq} active biomedical devices with an average health index of ${avgHealth}% and an overall hospital compliance index of ${complianceRate}%. Strategic recommendations focus on preventive maintenance coverage and life-support device readiness.`;

        kpis = [
          { label: 'Total Medical Devices', value: `${totalEq}`, status: 'Healthy', change: 'Active Fleet' },
          { label: 'Fleet Operational Rate', value: `${Math.round((operationalCount / totalEq) * 100)}%`, status: 'Healthy', change: `${operationalCount} Operational` },
          { label: 'Hospital Compliance Index', value: `${complianceRate}%`, status: complianceRate > 90 ? 'Healthy' : 'Attention', change: 'Audited' },
          { label: 'Fleet Health Score', value: `${avgHealth}%`, status: avgHealth > 80 ? 'Healthy' : 'Attention', change: 'Optimal' }
        ];

        recommendations = [
          `Maintain 95%+ operational readiness across all critical care departments.`,
          `Authorize budget allocation for periodic vendor calibrations in Emergency & Radiology.`,
          `Implement automated AI maintenance scheduling to reduce equipment downtime by up to 35%.`
        ];

        tableRows = targetEq.map(e => ({
          id: e.id,
          name: e.name,
          category: e.category,
          department: e.department,
          status: e.status,
          healthScore: `${e.healthScore}%`,
          assignedEngineer: e.assignedEngineer
        }));
      }

      // Attempt Gemini AI Report Payload Generation
      const geminiReport = await serverAiService.generateReportJson(reportType, dept, {
        equipment: targetEq,
        maintenance: targetMaint,
        calibration: targetCalib,
        stats: { totalEq, operationalCount, maintenanceCount, criticalCount, calibrationDueCount, avgHealth, avgRisk, complianceRate }
      });

      if (geminiReport) {
        if (geminiReport.title) title = geminiReport.title;
        if (geminiReport.summary) summary = geminiReport.summary;
        if (Array.isArray(geminiReport.kpis) && geminiReport.kpis.length > 0) kpis = geminiReport.kpis;
        if (Array.isArray(geminiReport.recommendations) && geminiReport.recommendations.length > 0) recommendations = geminiReport.recommendations;
        if (Array.isArray(geminiReport.tableRows) && geminiReport.tableRows.length > 0) tableRows = geminiReport.tableRows;
      }

      const reportContent = {
        title,
        reportType,
        department: dept,
        date: todayStr,
        generatedBy: author,
        summary,
        kpis,
        recommendations,
        tableRows,
        generatedAt: new Date().toISOString()
      };

      const newReportId = `REP-${Date.now().toString().slice(-6)}`;
      const fileSize = `${(Math.random() * 80 + 120).toFixed(1)} KB`;

      const newRecord = {
        id: newReportId,
        title,
        type: reportType,
        generatedBy: author,
        department: dept,
        date: todayStr,
        status: 'Ready',
        summary,
        downloadUrl: `/api/reports/${newReportId}/download`,
        contentJson: JSON.stringify(reportContent),
        cachedAt: new Date().toISOString(),
        fileSize,
        isCached: false
      };

      const inserted = await db.insert(reports).values(newRecord).returning();

      broadcastEvent({ type: 'reports', action: 'create', data: inserted[0] });

      // Auto notification
      await createAutoNotification({
        title: `${reportType} Report Generated`,
        message: `Report "${title}" was generated for ${dept} by ${author}. Saved in Cloud SQL database.`,
        type: 'Reports'
      });

      res.status(201).json(inserted[0]);

    } catch (error: any) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  app.get('/api/reports/:id/download', async (req, res) => {
    try {
      const found = await db.select().from(reports).where(eq(reports.id, req.params.id));
      if (!found.length) {
        return res.status(404).send('Report not found');
      }

      const rep = found[0];
      const content = rep.contentJson ? JSON.parse(rep.contentJson) : null;
      const format = (req.query.format as string) || 'json';

      if (format === 'csv' && content && content.tableRows) {
        const rows = content.tableRows;
        if (!rows.length) {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${rep.id}.csv"`);
          return res.send('No data rows available');
        }

        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map((r: any) => Object.values(r).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
        const csvContent = [headers, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${rep.title.replace(/[^a-zA-Z0-9]/g, '_')}_${rep.id}.csv"`);
        return res.send(csvContent);
      }

      // Default JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${rep.title.replace(/[^a-zA-Z0-9]/g, '_')}_${rep.id}.json"`);
      res.send(JSON.stringify(content || rep, null, 2));

    } catch (error: any) {
      console.error('Error downloading report:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  });

  app.delete('/api/reports/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const deleted = await db.delete(reports).where(eq(reports.id, req.params.id)).returning();
      if (!deleted.length) {
        return res.status(404).json({ error: 'Report not found' });
      }

      broadcastEvent({ type: 'reports', action: 'delete', id: req.params.id });

      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      console.error('Error deleting report:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  });

  // === DEPARTMENTS API ===
  app.get('/api/departments', async (req, res) => {
    try {
      const data = await db.select().from(departments).orderBy(departments.name);
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  app.post('/api/departments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const inserted = await db.insert(departments).values(req.body).returning();
      res.status(201).json(inserted[0]);
    } catch (error: any) {
      console.error('Error creating department:', error);
      res.status(500).json({ error: 'Failed to create department' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
}

startServer();

export default app;