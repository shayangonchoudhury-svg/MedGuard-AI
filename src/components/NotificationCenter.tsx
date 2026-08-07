import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Check, Trash2, Archive, AlertTriangle,
  Wrench, ShieldCheck, FileText, ChevronLeft,
  ChevronRight, RefreshCw, UserCheck
} from 'lucide-react';
import { Notification } from '../types';
import { api, NotificationsResponse } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const icons: Record<string, any> = {
  Critical: AlertTriangle,
  Maintenance: Wrench,
  Calibration: Wrench,
  Compliance: ShieldCheck,
  Reports: FileText,
  Login: UserCheck
};

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onArchive
}: Props) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unread' | 'Archived'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [items, setItems] = useState<Notification[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const res = await api.notifications.getAll({
        filter: statusFilter,
        type: typeFilter,
        page: currentPage,
        limit: pageSize
      });

      if (res && 'data' in res) {
        const response = res as NotificationsResponse;
        setItems(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || 0);
        setUnreadCount(response.unreadCount || 0);
      } else if (Array.isArray(res)) {
        setItems(res);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
        setTotalCount(res.length);
        setUnreadCount(res.filter(n => !n.read && !n.archived).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, statusFilter, typeFilter, currentPage]);

  const handleMarkRead = async (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    onMarkRead(id);
    await api.notifications.update(id, { read: true }).catch(() => {});
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead();
    await api.notifications.markAllRead().catch(() => {});
    fetchNotifications();
  };

  const handleArchive = async (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id));
    onArchive(id);
    await api.notifications.update(id, { archived: true }).catch(() => {});
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id));
    onDelete(id);
    await api.notifications.delete(id).catch(() => {});
    fetchNotifications();
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return ts;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[var(--bg-navy)] border-l border-[var(--border-glass)] shadow-2xl z-50 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-glass)]">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Clash_Display']">
                    Notification Center
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-[var(--critical-red)] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={fetchNotifications}
                    className="p-1.5 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-secondary)] hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5 bg-[var(--card-bg)]/80 p-1 rounded-xl border border-[var(--border-glass)] text-xs">
                  {(['All', 'Unread', 'Archived'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        statusFilter === f
                          ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)] shadow-md'
                          : 'text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[var(--accent-cyan)] hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              {/* Category / Type Selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {['All', 'Critical', 'Maintenance', 'Calibration', 'Compliance', 'Reports', 'Login'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] whitespace-nowrap transition-all ${
                      typeFilter === t
                        ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] font-bold'
                        : 'border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-white/20'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Notification List Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-[var(--text-secondary)] flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin text-[var(--accent-cyan)]" size={20} />
                    <span>Loading notifications...</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[var(--text-secondary)] flex flex-col items-center gap-2">
                    <ShieldCheck size={32} className="text-[var(--text-secondary)]/40" />
                    <p className="font-semibold text-sm">No notifications found</p>
                    <p className="text-[11px] text-[var(--text-secondary)]/80">
                      {statusFilter === 'Unread'
                        ? 'All caught up! No unread notifications.'
                        : 'No records match the selected filters.'}
                    </p>
                  </div>
                ) : (
                  items.map(n => {
                    const Icon = icons[n.type] || ShieldCheck;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`glass p-3.5 rounded-xl border border-[var(--border-glass)] transition-all ${
                          n.read ? 'opacity-65' : 'border-l-4 border-l-[var(--accent-cyan)] bg-[var(--card-bg)]/40'
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-lg mt-0.5 ${
                            n.type === 'Critical'
                              ? 'bg-red-500/20 text-[var(--critical-red)]'
                              : n.type === 'Maintenance'
                              ? 'bg-amber-500/20 text-[var(--warning-amber)]'
                              : 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]'
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className={`font-bold text-xs truncate ${n.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap">
                                {formatTimestamp(n.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                              {n.message}
                            </p>
                            {n.equipmentId && (
                              <span className="inline-block mt-1 text-[10px] bg-white/5 border border-[var(--border-glass)] px-1.5 py-0.5 rounded text-[var(--accent-cyan)]">
                                {n.equipmentId}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2 pt-2 border-t border-[var(--border-glass)]/50 justify-end items-center">
                          {!n.read && (
                            <button
                              onClick={() => handleMarkRead(n.id)}
                              className="px-2 py-1 glass rounded-md text-[11px] text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)] hover:text-[var(--bg-navy)] transition-all flex items-center gap-1 font-semibold"
                              title="Mark as read"
                            >
                              <Check size={12} /> Mark Read
                            </button>
                          )}
                          {!n.archived && (
                            <button
                              onClick={() => handleArchive(n.id)}
                              className="p-1 glass rounded-md text-[var(--text-secondary)] hover:text-white transition-colors"
                              title="Archive notification"
                            >
                              <Archive size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="p-1 glass rounded-md text-[var(--text-secondary)] hover:text-[var(--critical-red)] transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="pt-3 border-t border-[var(--border-glass)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>
                  Page {currentPage} of {totalPages} ({totalCount} items)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 glass rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--card-bg)] text-[var(--text-primary)] cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 glass rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--card-bg)] text-[var(--text-primary)] cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
