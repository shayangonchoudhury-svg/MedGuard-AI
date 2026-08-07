import { LayoutDashboard, Stethoscope, Wrench, ShieldCheck, Award, Bot, FileText, Bell, Settings, PieChart } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Equipment', icon: Stethoscope },
  { name: 'Maintenance', icon: Wrench },
  { name: 'Calibration', icon: Award },
  { name: 'Compliance', icon: ShieldCheck },
  { name: 'Reports', icon: FileText },
  { name: 'AI Assistant', icon: Bot },
  { name: 'Analytics', icon: PieChart },
  { name: 'Settings', icon: Settings },
];

interface Props {
  onNavigate: (page: 'Dashboard' | 'Equipment' | 'Maintenance' | 'Calibration' | 'Compliance' | 'Reports' | 'AIAssistant' | 'Analytics' | 'Settings') => void;
  activePage?: string;
}

export default function Sidebar({ onNavigate, activePage }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-[var(--border-glass)] p-6 overflow-y-auto z-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-[var(--accent-cyan)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent-cyan)]/20">
          <span className="text-[var(--bg-navy)] font-bold text-lg font-['Clash_Display']">M</span>
        </div>
        <span className="text-xl font-bold text-[var(--text-primary)] font-['Clash_Display']">MedGuard AI</span>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isSelected = activePage === item.name || (activePage === 'AIAssistant' && item.name === 'AI Assistant');
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(
                item.name === 'Dashboard' ? 'Dashboard' :
                item.name === 'Equipment' ? 'Equipment' :
                item.name === 'Maintenance' ? 'Maintenance' :
                item.name === 'Calibration' ? 'Calibration' :
                item.name === 'Compliance' ? 'Compliance' :
                item.name === 'Reports' ? 'Reports' :
                item.name === 'AI Assistant' ? 'AIAssistant' :
                item.name === 'Analytics' ? 'Analytics' :
                item.name === 'Settings' ? 'Settings' : 'Dashboard'
              )}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
                isSelected
                  ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] font-bold border border-[var(--accent-cyan)]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <item.icon size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
