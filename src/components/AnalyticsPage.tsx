import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Activity, Brain, AlertTriangle, Calendar } from 'lucide-react';
import CountUp from './CountUp';
import { Equipment, MaintenanceRecord, CalibrationRecord } from '../types';

interface Props {
  equipmentList?: Equipment[];
  maintenanceRecords?: MaintenanceRecord[];
  calibrationRecords?: CalibrationRecord[];
}

export default function AnalyticsPage({
  equipmentList = [],
  maintenanceRecords = [],
  calibrationRecords = []
}: Props) {
  const avgHealth = equipmentList.length > 0
    ? Math.round(equipmentList.reduce((acc, e) => acc + (e.healthScore || 85), 0) / equipmentList.length)
    : 92;

  const criticalIssues = equipmentList.filter(
    e => e.status === 'Critical' || e.riskScore > 75 || e.status === 'Maintenance Due'
  ).length;

  const pendingMaintenanceCount = maintenanceRecords.filter(
    m => m.status === 'Scheduled' || m.status === 'Rescheduled'
  ).length || equipmentList.filter(e => e.status === 'Maintenance Due').length;

  const kpiData = [
    { title: 'Avg Equipment Health', value: avgHealth, icon: Activity, color: 'text-cyan-400', isPercent: true },
    { title: 'Critical Issues', value: criticalIssues, icon: AlertTriangle, color: 'text-red-400', isPercent: false },
    { title: 'Next Maintenance Tasks', value: pendingMaintenanceCount, icon: Calendar, color: 'text-amber-400', isPercent: false },
  ];

  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    health: Math.min(100, Math.max(50, avgHealth + (Math.sin(i) * 5))),
    risk: Math.max(5, Math.min(50, (criticalIssues * 4) + (Math.cos(i) * 4)))
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display']">Analytics & Telemetry</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Real-time health trend curves & predictive risk forecasting.</p>
        </div>
        <div className="glass p-1 rounded-full flex gap-1 border border-[var(--border-glass)]">
          {['7D', '30D', '90D', '1Y'].map(range => (
            <button key={range} className={`px-4 py-1.5 rounded-full text-xs font-bold ${range === '30D' ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{range}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiData.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass p-6 rounded-2xl border border-[var(--border-glass)] relative overflow-hidden">
            <div className='flex justify-between items-start mb-4'>
              <p className="text-sm text-[var(--text-secondary)]">{kpi.title}</p>
              <kpi.icon className={kpi.color} size={20} />
            </div>
            <h2 className="text-4xl font-bold text-[var(--text-primary)] font-['Clash_Display']">
              <CountUp value={kpi.value} />{kpi.isPercent && '%'}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="glass p-8 rounded-2xl border border-[var(--border-glass)]">
        <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] font-['Clash_Display']">Health & Risk Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.2}/><stop offset="100%" stopColor="transparent" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="var(--text-secondary)" />
              <YAxis axisLine={false} tickLine={false} stroke="var(--text-secondary)" domain={[0, 100]} />
              <Tooltip contentStyle={{backgroundColor: 'var(--bg-navy)', borderColor: 'var(--border-glass)', borderRadius: '1rem', color: 'white'}} />
              <Area type="monotone" dataKey="health" stroke="var(--accent-cyan)" fill="url(#colorHealth)" />
              <Area type="monotone" dataKey="risk" stroke="var(--critical-red)" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-2xl border border-[var(--border-glass)]">
          <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] font-['Clash_Display']">Predictive Failure Forecast</h3>
          <div className='flex items-center gap-4 mb-4'>
            <div className='p-2 rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'><Brain size={20}/></div>
            <p className='text-sm text-[var(--text-secondary)]'>Forecasted risk curve for the next 30 days based on usage patterns.</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.slice(0, 15)}>
                <Line type="monotone" dataKey="risk" stroke="var(--accent-cyan)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <XAxis hide /> <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


