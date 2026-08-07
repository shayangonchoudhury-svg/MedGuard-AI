import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Camera, Mail, Phone, Building, Briefcase, History, Edit3, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logOut } = useAuth();

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('medguard_profile');
    return saved ? JSON.parse(saved) : {
      role: 'Senior Biomedical Engineer',
      department: 'Emergency & ICU',
      employeeId: 'EMP-9921',
      hospital: 'Apollo Hospitals',
      phone: '+1 (555) 123-4567',
      bio: 'Dedicated biomedical engineer with 10+ years of experience in critical care equipment maintenance and optimization.',
      skills: ['Ventilators', 'Patient Monitoring', 'Infusion Pumps', 'MRI/CT Maintenance']
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('medguard_profile', JSON.stringify(profile));
  }, [profile]);

  const saveProfile = () => {
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const activity = [
    { action: 'Authenticated via Google OAuth 2.0', time: 'Active Session' },
    { action: 'Updated maintenance logs for Ventilator-102', time: '2 hours ago' },
    { action: 'Generated monthly compliance report', time: '1 day ago' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Clash_Display']">
            My Profile
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Google Authenticated Account & Clinical Credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors text-sm font-medium cursor-pointer"
          >
            <Edit3 size={18} /> {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button
            onClick={logOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-[var(--critical-red)] hover:bg-red-500/20 rounded-xl transition-colors text-sm font-semibold cursor-pointer"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-2xl border border-[var(--border-glass)] flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="relative shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[var(--accent-cyan)] shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[var(--card-bg)] border-2 border-[var(--border-glass)] flex items-center justify-center text-4xl text-[var(--accent-cyan)] font-bold">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute bottom-1 right-1 p-2 rounded-full bg-[var(--accent-cyan)] text-[var(--bg-navy)] shadow-lg">
                <Camera size={16} />
              </div>
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {user?.displayName || 'Clinical Engineer'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck size={14} /> Google Verified
                </span>
              </div>
              <p className="text-sm text-[var(--accent-cyan)] font-medium">
                {profile.role} • {profile.department}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                UID: <code className="bg-[var(--card-bg)] px-2 py-0.5 rounded text-[10px] text-[var(--text-primary)]">{user?.uid}</code>
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl border border-[var(--border-glass)]">
            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)] font-['Clash_Display']">
              Bio
            </h3>
            <textarea
              className={`w-full bg-transparent border-b ${
                isEditing ? 'border-[var(--accent-cyan)]' : 'border-transparent'
              } resize-none text-[var(--text-secondary)] focus:outline-none transition-all text-sm leading-relaxed`}
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              readOnly={!isEditing}
            />
          </div>

          <div className="glass p-8 rounded-2xl border border-[var(--border-glass)]">
            <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] font-['Clash_Display']">
              Specializations & Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-4 py-2 glass rounded-full text-xs font-bold text-[var(--accent-cyan)] border border-[var(--border-glass)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-2xl border border-[var(--border-glass)] space-y-4">
            <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] font-['Clash_Display']">
              Identity Details
            </h3>
            {[
              { icon: Mail, label: 'Google Email', value: user?.email || 'N/A' },
              { icon: Building, label: 'Hospital Organization', value: profile.hospital },
              { icon: Briefcase, label: 'Employee ID', value: profile.employeeId },
              { icon: Phone, label: 'Phone Contact', value: profile.phone },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 py-1">
                <div className="w-9 h-9 rounded-xl bg-[var(--card-bg)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0">
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[var(--text-secondary)]">{item.label}</p>
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass p-8 rounded-2xl border border-[var(--border-glass)]">
            <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] font-['Clash_Display']">
              Security Log
            </h3>
            <div className="space-y-4">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <History size={16} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[var(--text-primary)] font-medium">{a.action}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-xl font-bold hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all cursor-pointer"
          >
            <Save size={20} /> Save Changes
          </button>
        </div>
      )}

      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 glass p-4 rounded-xl border border-[var(--accent-cyan)]/40 text-[var(--text-primary)] shadow-2xl z-50 text-xs font-semibold flex items-center gap-2"
        >
          <ShieldCheck className="text-[var(--healthy-green)]" size={18} />
          Profile updated successfully!
        </motion.div>
      )}
    </div>
  );
}
