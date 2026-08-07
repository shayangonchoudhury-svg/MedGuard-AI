import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Wrench, Calendar, FileWarning, Activity, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import CountUp from './CountUp';
import { api } from '../services/api';
import { Equipment } from '../types';

interface DashboardProps {
  equipmentList?: Equipment[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function Dashboard({
  equipmentList: propEquipmentList,
  loading: propLoading,
  error: propError,
  onRefresh: propOnRefresh
}: DashboardProps = {}) {
  const [internalList, setInternalList] = useState<Equipment[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const loadData = async () => {
    if (propOnRefresh) {
      propOnRefresh();
      return;
    }
    try {
      setInternalLoading(true);
      setInternalError(null);
      const data = await api.equipment.getAll();
      setInternalList(data);
    } catch (err: any) {
      console.error('Failed to load dashboard equipment:', err);
      setInternalError(err.message || 'Failed to load equipment data from database');
    } fontally: {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!propEquipmentList) {
      loadData();
    }
  }, [propEquipmentList]);

  const equipmentList = propEquipmentList ?? internalList;
  const loading = propLoading ?? internalLoading;
  const error = propError ?? internalError;

  const totalCount = equipmentList.length;
  const healthyCount = equipmentList.filter(e => e.status === 'Operational' || e.riskLevel === 'Healthy').length;
  const maintenanceDueCount = equipmentList.filter(e => e.status === 'Maintenance' || e.status === 'Maintenance Due').length;
  const calibrationDueCount = equipmentList.filter(e => e.status === 'Calibration Due').length;
  const expiredCount = equipmentList.filter(e => e.status === 'Warranty Expired' || e.riskLevel === 'Due Soon').length;
  const highRiskCount = equipmentList.filter(e => e.status === 'Critical' || e.riskScore > 75).length;

  const kpiCards = [
    { title: 'Total Equipment', value: totalCount, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
    { title: 'Healthy', value: healthyCount, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', borderColor: 'border-green-500/30' },
    { title: 'Maintenance Due', value: maintenanceDueCount, icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
    { title: 'Calibration Due', value: calibrationDueCount, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    { title: 'Expired / Warning', value: expiredCount, icon: FileWarning, color: 'text-red-400', bg: 'bg-red-500/10', borderColor: 'border-red-500/30' },
    { title: 'High Risk', value: highRiskCount, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/20', borderColor: 'border-red-500/50', critical: true },
  ];

  type CategoryAcc = { category: string; totalHealth: number; count: number };

  const categoryHealth = equipmentList.reduce<Record<string, CategoryAcc>>((acc, eq) => {
    if (!acc[eq.category]) {
      acc[eq.category] = { category: eq.category, totalHealth: 0, count: 0 };
    }
    acc[eq.category].totalHealth += eq.healthScore || 85;
    acc[eq.category].count += 1;
    return acc;
  }, {});

  const chartData = (Object.values(categoryHealth) as CategoryAcc[]).map(item => ({
    category: item.category,
    healthScore: Math.round(item.totalHealth / item.count)
  })).slice(0, 6);

  const criticalAlerts = equipmentList
    .filter(e => e.status !== 'Operational' || e.riskScore > 50)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Clash_Display']">Hospital Command Center</h1>
          <p className="text-[var(--text-secondary)]">Real-time Cloud SQL overview of biomedical assets.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 glass hover:bg-[var(--card-bg)] text-xs text-[var(--accent-cyan)] border border-[var(--border-glass)] rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline cursor-pointer">Retry</button>
        </div>
      )}

      {loading && equipmentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 glass rounded-2xl border border-[var(--border-glass)]">
          <Loader2 className="w-8 h-8 text-[var(--accent-cyan)] animate-spin" />
          <p className="text-xs text-[var(--text-secondary)] font-medium">Fetching real-time asset data from Cloud SQL...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {kpiCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: `0 0 20px ${card.borderColor}` }}
                className={`glass p-6 rounded-2xl border ${card.borderColor}`}
              >
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4 relative`}>
                  <card.icon className={`${card.color} ${card.critical ? 'animate-pulse' : ''}`} size={24} />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">{card.title}</p>
                <p className="text-4xl font-bold text-white tabular-nums">
                  <CountUp value={card.value} />
                </p>
                <div className="mt-3 h-1 w-full bg-[var(--card-bg)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(10, (card.value / Math.max(1, totalCount)) * 100))}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className={`h-full ${card.color.replace('text', 'bg')}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Row 2: Chart & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass p-8 rounded-2xl border border-[var(--border-glass)]">
              <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] font-['Clash_Display']">Equipment Health Overview</h3>
              <div className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="category" axisLine={false} tickLine={false} stroke="var(--text-secondary)" />
                      <YAxis axisLine={false} tickLine={false} stroke="var(--text-secondary)" domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-navy)', borderColor: 'var(--border-glass)', borderRadius: '1rem', color: 'white' }} />
                      <Bar dataKey="healthScore" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="url(#colorHealth)" />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[var(--text-secondary)]">No asset records found</div>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-2xl border border-[var(--border-glass)]">
              <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] font-['Clash_Display']">Smart Asset Alerts</h3>
              <div className="space-y-4">
                {criticalAlerts.length > 0 ? (
                  criticalAlerts.map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className={`flex items-start gap-4 p-4 hover:bg-[var(--card-bg)] rounded-xl transition-colors border-l-2 ${e.status === 'Operational' ? 'border-l-[var(--healthy-green)]' : 'border-l-[var(--critical-red)]'}`}
                    >
                      <div className={`p-2 rounded-lg ${e.status === 'Operational' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <AlertCircle size={16} className={e.status === 'Operational' ? 'text-[var(--healthy-green)]' : 'text-[var(--critical-red)]'} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[var(--text-primary)]">{e.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{e.department} • Status: {e.status}</p>
                      </div>
                      <span className="text-[10px] text-[var(--text-secondary)]">{e.id}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--text-secondary)] text-center py-8">All equipment operating within optimal parameters.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
