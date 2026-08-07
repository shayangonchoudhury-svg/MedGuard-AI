import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import EquipmentPage from './components/EquipmentPage';
import CompliancePage from './components/CompliancePage';
import AIOrchestratorHub from './components/AIOrchestratorHub';
import LoginPage from './components/LoginPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import LandingPage from './components/LandingPage';
import NotificationCenter from './components/NotificationCenter';
import MaintenanceCalendar from './components/MaintenanceCalendar';
import CalibrationHub from './components/CalibrationHub';
import ReportsHub from './components/ReportsHub';
import { Notification, MaintenanceRecord, CalibrationRecord, Equipment, ReportRecord } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Brain, Loader2 } from 'lucide-react';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'Dashboard' | 'Equipment' | 'Maintenance' | 'Calibration' | 'Compliance' | 'Reports' | 'AIAssistant' | 'Analytics' | 'Settings' | 'Profile'>('Dashboard');
  const [showLanding, setShowLanding] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [calibrationRecords, setCalibrationRecords] = useState<CalibrationRecord[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [reportsList, setReportsList] = useState<ReportRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch initial data from Cloud SQL backend
  const refreshBackendData = async (showLoading = true) => {
    if (!user) return;
    try {
      if (showLoading) setDataLoading(true);
      setApiError(null);
      const [eqs, maints, cals, notifsRes, reps] = await Promise.all([
        api.equipment.getAll().catch(() => []),
        api.maintenance.getAll().catch(() => []),
        api.calibration.getAll().catch(() => []),
        api.notifications.getAll().catch(() => []),
        api.reports.getAll().catch(() => []),
      ]);

      const notifsList = Array.isArray(notifsRes)
        ? notifsRes
        : (notifsRes && 'data' in notifsRes ? notifsRes.data : []);

      setEquipmentList(eqs);
      setMaintenanceRecords(maints);
      setCalibrationRecords(cals);
      setNotifications(notifsList);
      setReportsList(reps);

      // Sync user profile with database
      if (user.uid && user.email) {
        await api.users.sync({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Error syncing backend data:', err);
      setApiError(err.message || 'Failed to load database records');
    } finally {
      if (showLoading) setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && !showLanding) {
      refreshBackendData(true);

      // Setup Server-Sent Events (SSE) Real-time Subscription Engine
      const eventSource = new EventSource('/api/realtime');

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (!parsed || !parsed.type || parsed.type === 'connected') return;

          // Perform silent, non-blocking state re-sync for instant dashboard updates
          refreshBackendData(false);
        } catch (err) {
          console.error('Error handling realtime event:', err);
        }
      };

      eventSource.onerror = () => {
        // EventSource will automatically attempt reconnection
      };

      return () => {
        eventSource.close();
      };
    }
  }, [user, showLanding]);

  const addMaintenanceRecord = async (record: Omit<MaintenanceRecord, 'id' | 'status'>) => {
    try {
      const created = await api.maintenance.create({ ...record, status: 'Scheduled' });
      setMaintenanceRecords(prev => [created, ...prev]);
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to create maintenance record:', err);
      setApiError('Failed to save maintenance record to database.');
    }
  };

  const completeMaintenanceRecord = async (id: string) => {
    try {
      setMaintenanceRecords(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed' } : m));
      await api.maintenance.update(id, { status: 'Completed' });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to complete maintenance record:', err);
      setApiError('Failed to mark maintenance as completed.');
      await refreshBackendData();
    }
  };

  const cancelMaintenanceRecord = async (id: string) => {
    try {
      setMaintenanceRecords(prev => prev.map(m => m.id === id ? { ...m, status: 'Cancelled' } : m));
      await api.maintenance.update(id, { status: 'Cancelled' });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to cancel maintenance record:', err);
      setApiError('Failed to cancel maintenance record.');
      await refreshBackendData();
    }
  };

  const rescheduleMaintenanceRecord = async (id: string, newDate: string, newTime?: string) => {
    try {
      setMaintenanceRecords(prev => prev.map(m => m.id === id ? { ...m, scheduledDate: newDate, time: newTime || m.time, status: 'Rescheduled' } : m));
      await api.maintenance.update(id, { scheduledDate: newDate, time: newTime, status: 'Rescheduled' });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to reschedule maintenance record:', err);
      setApiError('Failed to reschedule maintenance record.');
      await refreshBackendData();
    }
  };

  const assignEngineerToMaintenance = async (id: string, engineer: string) => {
    try {
      setMaintenanceRecords(prev => prev.map(m => m.id === id ? { ...m, engineer } : m));
      await api.maintenance.update(id, { engineer });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to assign engineer to maintenance:', err);
      setApiError('Failed to assign engineer to maintenance.');
      await refreshBackendData();
    }
  };

  const deleteMaintenanceRecord = async (id: string) => {
    try {
      setMaintenanceRecords(prev => prev.filter(m => m.id !== id));
      await api.maintenance.delete(id);
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to delete maintenance record:', err);
      setApiError('Failed to delete maintenance record.');
      await refreshBackendData();
    }
  };

  const addCalibrationRecord = async (record: Omit<CalibrationRecord, 'id' | 'status'>) => {
    try {
      const created = await api.calibration.create({ ...record, status: 'Scheduled' });
      setCalibrationRecords(prev => [created, ...prev]);
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to create calibration record:', err);
      setApiError('Failed to save calibration record to database.');
      await refreshBackendData();
    }
  };

  const completeCalibrationRecord = async (id: string, certUrl?: string, certName?: string) => {
    try {
      setCalibrationRecords(prev => prev.map(c => c.id === id ? { ...c, status: 'Completed', certificateUrl: certUrl || c.certificateUrl, certificateName: certName || c.certificateName } : c));
      await api.calibration.update(id, {
        status: 'Completed',
        certificateUrl: certUrl,
        certificateName: certName,
        certificateDate: certUrl ? new Date().toISOString().split('T')[0] : undefined
      });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to complete calibration record:', err);
      setApiError('Failed to mark calibration as completed.');
      await refreshBackendData();
    }
  };

  const cancelCalibrationRecord = async (id: string) => {
    try {
      setCalibrationRecords(prev => prev.map(c => c.id === id ? { ...c, status: 'Cancelled' } : c));
      await api.calibration.update(id, { status: 'Cancelled' });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to cancel calibration record:', err);
      setApiError('Failed to cancel calibration record.');
      await refreshBackendData();
    }
  };

  const rescheduleCalibrationRecord = async (id: string, newScheduledDate: string, newDueDate: string) => {
    try {
      setCalibrationRecords(prev => prev.map(c => c.id === id ? { ...c, scheduledDate: newScheduledDate, dueDate: newDueDate, status: 'Rescheduled' } : c));
      await api.calibration.update(id, { scheduledDate: newScheduledDate, dueDate: newDueDate, status: 'Rescheduled' });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to reschedule calibration record:', err);
      setApiError('Failed to reschedule calibration record.');
      await refreshBackendData();
    }
  };

  const uploadCalibrationCertificate = async (id: string, certUrl: string, certName: string, certDate: string) => {
    try {
      setCalibrationRecords(prev => prev.map(c => c.id === id ? { ...c, certificateUrl: certUrl, certificateName: certName, certificateDate: certDate } : c));
      await api.calibration.update(id, {
        certificateUrl: certUrl,
        certificateName: certName,
        certificateDate: certDate
      });
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to upload calibration certificate:', err);
      setApiError('Failed to attach calibration certificate.');
      await refreshBackendData();
    }
  };

  const deleteCalibrationRecord = async (id: string) => {
    try {
      setCalibrationRecords(prev => prev.filter(c => c.id !== id));
      await api.calibration.delete(id);
      await refreshBackendData();
    } catch (err: any) {
      console.error('Failed to delete calibration record:', err);
      setApiError('Failed to delete calibration record.');
      await refreshBackendData();
    }
  };

  // Optimistic Add Equipment (POST /equipment)
  const addEquipment = async (equipmentItem: Equipment) => {
    const tempId = equipmentItem.id || `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const optimisticEq: Equipment = { ...equipmentItem, id: tempId };

    // 1. Optimistic Update
    setEquipmentList(prev => [optimisticEq, ...prev]);

    try {
      // 2. Real API Call
      const created = await api.equipment.create(equipmentItem);
      // 3. Confirm with server record
      setEquipmentList(prev => prev.map(e => e.id === tempId ? created : e));

      const newNotif = await api.notifications.create({
        title: 'Equipment Added',
        message: `${created.name} (${created.id}) has been added to inventory.`,
        type: 'Reports',
        timestamp: new Date().toISOString(),
        read: false,
        archived: false,
        equipmentId: created.id
      }).catch(() => null);

      if (newNotif) {
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (err: any) {
      console.error('Failed to create equipment:', err);
      // Rollback on error
      setEquipmentList(prev => prev.filter(e => e.id !== tempId));
      setApiError('Failed to save equipment record to database.');
    }
  };

  // Optimistic Update Equipment (PUT /equipment/:id)
  const updateEquipment = async (id: string, updatedFields: Partial<Equipment>) => {
    const previousState = [...equipmentList];

    // 1. Optimistic Update
    setEquipmentList(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));

    try {
      // 2. Real API Call
      const updated = await api.equipment.update(id, updatedFields);
      // 3. Sync with server returned data
      setEquipmentList(prev => prev.map(e => e.id === id ? updated : e));
    } catch (err: any) {
      console.error(`Failed to update equipment ${id}:`, err);
      // Rollback on error
      setEquipmentList(previousState);
      setApiError(`Failed to update equipment ${id}.`);
    }
  };

  // Optimistic Delete Equipment (DELETE /equipment/:id)
  const deleteEquipment = async (id: string) => {
    const previousState = [...equipmentList];

    // 1. Optimistic Update
    setEquipmentList(prev => prev.filter(e => e.id !== id));

    try {
      // 2. Real API Call
      await api.equipment.delete(id);
    } catch (err: any) {
      console.error(`Failed to delete equipment ${id}:`, err);
      // Rollback on error
      setEquipmentList(previousState);
      setApiError(`Failed to delete equipment ${id}.`);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      await api.notifications.update(id, { read: true }).catch(() => {});
    } catch (err) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await api.notifications.markAllRead().catch(() => {});
    } catch (err) {}
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await api.notifications.delete(id).catch(() => {});
    } catch (err) {}
  };

  const handleArchiveNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
      await api.notifications.update(id, { archived: true }).catch(() => {});
    } catch (err) {}
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-navy)] text-[var(--text-primary)]">
        <div className="relative flex flex-col items-center">
          <Brain className="w-16 h-16 text-[var(--accent-cyan)] animate-pulse mb-4" />
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-cyan)]" />
            <span>Verifying MedGuard Security Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-navy)]">
      <Sidebar onNavigate={setCurrentPage} activePage={currentPage} />
      <TopNav
        onNavigate={setCurrentPage}
        unreadCount={notifications.filter(n => !n.read && !n.archived).length}
        onOpenNotifications={() => setShowNotifications(true)}
      />
      <main className="ml-64 p-8">
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex justify-between items-center">
            <span>Database Error: {apiError}</span>
            <button onClick={() => setApiError(null)} className="text-xs text-red-300 hover:text-white underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {currentPage === 'Dashboard' && (
          <Dashboard
            equipmentList={equipmentList}
            loading={dataLoading}
            error={apiError}
            onRefresh={refreshBackendData}
          />
        )}
        {currentPage === 'Equipment' && (
          <EquipmentPage
            equipmentList={equipmentList}
            onAddEquipment={addEquipment}
            onUpdateEquipment={updateEquipment}
            onDeleteEquipment={deleteEquipment}
            onScheduleMaintenance={addMaintenanceRecord}
            onScheduleCalibration={addCalibrationRecord}
            onRefresh={refreshBackendData}
            isLoading={dataLoading}
          />
        )}
        {currentPage === 'Maintenance' && (
          <MaintenanceCalendar
            records={maintenanceRecords}
            equipmentList={equipmentList}
            onSchedule={addMaintenanceRecord}
            onComplete={completeMaintenanceRecord}
            onCancel={cancelMaintenanceRecord}
            onReschedule={rescheduleMaintenanceRecord}
            onAssignEngineer={assignEngineerToMaintenance}
            onDelete={deleteMaintenanceRecord}
            onRefresh={refreshBackendData}
            isLoading={dataLoading}
          />
        )}
        {currentPage === 'Calibration' && (
          <CalibrationHub
            records={calibrationRecords}
            equipmentList={equipmentList}
            onSchedule={addCalibrationRecord}
            onComplete={completeCalibrationRecord}
            onCancel={cancelCalibrationRecord}
            onReschedule={rescheduleCalibrationRecord}
            onUploadCert={uploadCalibrationCertificate}
            onDelete={deleteCalibrationRecord}
            onRefresh={refreshBackendData}
            isLoading={dataLoading}
          />
        )}
        {currentPage === 'Compliance' && (
          <CompliancePage
            equipmentList={equipmentList}
            calibrationRecords={calibrationRecords}
            maintenanceRecords={maintenanceRecords}
          />
        )}
        {currentPage === 'Reports' && (
          <ReportsHub
            reportsList={reportsList}
            equipmentList={equipmentList}
            onRefresh={refreshBackendData}
            isLoading={dataLoading}
          />
        )}
        {currentPage === 'AIAssistant' && <AIOrchestratorHub />}
        {currentPage === 'Analytics' && (
          <AnalyticsPage
            equipmentList={equipmentList}
            maintenanceRecords={maintenanceRecords}
            calibrationRecords={calibrationRecords}
          />
        )}
        {currentPage === 'Settings' && <SettingsPage />}
        {currentPage === 'Profile' && <ProfilePage />}
      </main>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDelete={handleDeleteNotification}
        onArchive={handleArchiveNotification}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
