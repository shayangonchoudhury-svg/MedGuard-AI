import { useState } from 'react';
import { Search, Plus, Activity, LayoutGrid, List, RefreshCw, Loader2 } from 'lucide-react';
import EquipmentDrawer from './EquipmentDrawer';
import AddEquipmentModal from './AddEquipmentModal';
import { Equipment } from '../types';
import { motion } from 'motion/react';
import CircularProgress from './CircularProgress';

interface EquipmentPageProps {
  equipmentList: Equipment[];
  onAddEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (id: string, updated: Partial<Equipment>) => void;
  onDeleteEquipment: (id: string) => void;
  onScheduleMaintenance: (record: any) => void;
  onScheduleCalibration: (record: any) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function EquipmentPage({
  equipmentList,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  onScheduleMaintenance,
  onScheduleCalibration,
  onRefresh,
  isLoading
}: EquipmentPageProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredEquipment = equipmentList.filter(e =>
    (activeFilter === 'All' || e.status === activeFilter || (activeFilter === 'Critical' && e.riskScore > 70)) &&
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.id.toLowerCase().includes(searchTerm.toLowerCase()) || e.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeverityColor = (value: number) =>
    value > 80 ? 'text-[var(--critical-red)]' : value > 50 ? 'text-[var(--warning-amber)]' : 'text-[var(--healthy-green)]';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display']">Equipment Inventory</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Managed via Cloud SQL PostgreSQL database</p>
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 glass hover:bg-[var(--card-bg)] text-xs text-[var(--accent-cyan)] border border-[var(--border-glass)] rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--accent-cyan)] to-blue-600 text-[var(--bg-navy)] rounded-xl font-bold hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all group cursor-pointer"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add Equipment
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-2 rounded-2xl border border-[var(--border-glass)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            type="text"
            placeholder="Search by ID, Name, Category..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-1 overflow-x-auto w-full md:w-auto">
          {['All', 'Operational', 'Critical'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-bold shadow-[0_0_10px_var(--accent-cyan)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-[var(--card-bg)] p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-[var(--border-glass)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-[var(--border-glass)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 glass rounded-2xl border border-[var(--border-glass)]">
          <Loader2 className="w-8 h-8 text-[var(--accent-cyan)] animate-spin" />
          <p className="text-xs text-[var(--text-secondary)]">Loading inventory records from Cloud SQL...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-[var(--border-glass)] space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">No equipment found matching your criteria.</p>
          <button
            onClick={() => { setSearchTerm(''); setActiveFilter('All'); }}
            className="text-xs text-[var(--accent-cyan)] underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredEquipment.map(e => (
            <motion.div
              key={e.id}
              whileHover={{ y: -5, borderColor: 'var(--accent-cyan)', boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)' }}
              className={`glass p-6 rounded-2xl border border-[var(--border-glass)] cursor-pointer transition-all ${
                viewMode === 'list' ? 'flex items-center gap-6' : ''
              }`}
              onClick={() => setSelectedEquipment(e)}
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 bg-[var(--card-bg)] rounded-xl flex items-center justify-center text-[var(--accent-cyan)]">
                  <Activity size={28} />
                </div>
                <span
                  className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-navy)] ${
                    e.status === 'Operational' ? 'bg-[var(--healthy-green)] animate-pulse' : 'bg-[var(--critical-red)]'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">{e.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{e.category} • {e.department}</p>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <span className="bg-[var(--card-bg)] px-2 py-0.5 rounded border border-[var(--border-glass)] font-mono">{e.id}</span>
                  <span>SN: {e.serialNumber}</span>
                </div>
              </div>

              <div className={`flex gap-4 shrink-0 ${viewMode === 'list' ? 'items-center' : 'mt-4 pt-4 border-t border-[var(--border-glass)] justify-between'}`}>
                <div className="flex items-center gap-2">
                  <CircularProgress value={e.healthScore || 90} colorClass={getSeverityColor(100 - (e.healthScore || 90)).replace('text', 'stroke')} />
                  <span className="text-xs text-[var(--text-secondary)]">Health</span>
                </div>
                <div className="flex items-center gap-2">
                  <CircularProgress value={e.riskScore || 10} colorClass={getSeverityColor(e.riskScore || 10).replace('text', 'stroke')} />
                  <span className="text-xs text-[var(--text-secondary)]">Risk</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <EquipmentDrawer
        equipment={selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
        onScheduleMaintenance={onScheduleMaintenance}
        onScheduleCalibration={onScheduleCalibration}
        onUpdateEquipment={onUpdateEquipment}
        onDeleteEquipment={onDeleteEquipment}
      />
      <AddEquipmentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={onAddEquipment} />
    </div>
  );
}
