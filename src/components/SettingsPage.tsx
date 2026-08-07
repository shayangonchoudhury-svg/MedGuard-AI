import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Settings, Shield, Bell, Monitor, Brain, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('medguard_settings');
    return saved ? JSON.parse(saved) : {
      hospitalName: 'Apollo Hospitals',
      darkMode: true,
      accentColor: '#00E5FF',
      language: 'English',
      timezone: 'UTC',
      defaultDashboard: 'Analytics'
    };
  });
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('medguard_settings', JSON.stringify(settings));
  }, [settings]);

  const saveSettings = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display']">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Hospital Profile', icon: Settings, fields: ['Hospital Name'] },
          { title: 'Appearance', icon: Monitor, fields: ['Theme', 'Accent Color'] },
          { title: 'Notification Preferences', icon: Bell, fields: ['Email Alerts', 'Push Notifications'] },
          { title: 'Security', icon: Shield, fields: ['2FA', 'Password Change'] },
          { title: 'AI Configuration', icon: Brain, fields: ['Model Version', 'Auto-Analyze'] },
          { title: 'Compliance Rules', icon: ShieldCheck, fields: ['Alert Threshold', 'Reporting Period'] },
        ].map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass p-6 rounded-2xl border border-[var(--border-glass)]">
              <div className="flex items-center gap-3 mb-6">
                <section.icon className="text-[var(--accent-cyan)]" size={20} />
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Clash_Display']">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.fields.map(field => (
                  <div key={field} className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">{field}</span>
                    <input className="bg-[var(--card-bg)] border border-[var(--border-glass)] rounded-lg p-2 text-[var(--text-primary)]" defaultValue={settings[field.toLowerCase().replace(' ', '')] || ''} />
                  </div>
                ))}
              </div>
            </motion.div>
        ))}
      </div>

      <button onClick={saveSettings} className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-xl font-bold">
        <Save size={20} /> Save Changes
      </button>

      {showToast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 right-8 glass p-4 rounded-xl border border-[var(--border-glass)] text-[var(--text-primary)]">
          Settings saved successfully!
        </motion.div>
      )}
    </div>
  );
}
