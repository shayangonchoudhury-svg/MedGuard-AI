import { Search, Bell, User as UserIcon, ChevronDown, UserCircle, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import CommandPalette from './CommandPalette';
import { useAuth } from '../context/AuthContext';

export default function TopNav({
  onNavigate,
  unreadCount,
  onOpenNotifications
}: {
  onNavigate: (page: 'Dashboard' | 'Equipment' | 'Compliance' | 'AIAssistant' | 'Analytics' | 'Settings' | 'Profile') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
}) {
  const { user, logOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logOut();
  };

  return (
    <>
      <nav className="sticky top-0 z-40 glass border-b border-[var(--border-glass)] px-8 py-4 flex items-center justify-between ml-64">
        <div className="relative w-96 cursor-pointer" onClick={() => setIsSearchOpen(true)}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
          <input
            readOnly
            type="text"
            placeholder="Search equipment, reports..."
            className="w-full pl-10 pr-16 py-2.5 bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] placeholder-[var(--text-secondary)] cursor-pointer"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 border border-[var(--border-glass)] bg-[var(--card-bg)] text-[var(--text-secondary)] text-[10px] px-2 py-0.5 rounded">
            ⌘K
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="font-semibold text-[var(--text-secondary)] text-sm hidden sm:inline">
            Apollo Hospitals
          </span>

          <button
            onClick={onOpenNotifications}
            className="text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--critical-red)] text-[10px] flex items-center justify-center rounded-full text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[var(--card-bg)]/60 transition-all border border-transparent hover:border-[var(--border-glass)]"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-[var(--accent-cyan)]/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--card-bg)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-cyan)] font-bold text-sm">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight max-w-[120px] truncate">
                  {user?.displayName || 'Biomedical Engineer'}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-tight max-w-[120px] truncate">
                  {user?.email || ''}
                </p>
              </div>
              <ChevronDown size={16} className="text-[var(--text-secondary)]" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute top-14 right-0 w-64 glass rounded-2xl border border-[var(--border-glass)] p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-[var(--border-glass)] mb-2">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {user?.displayName || 'Authenticated User'}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="space-y-1">
                  {[
                    { name: 'My Profile', icon: UserCircle, page: 'Profile' as const },
                    { name: 'Account Settings', icon: Settings, page: 'Settings' as const },
                    { name: 'Help & Docs', icon: HelpCircle, page: 'Dashboard' as const },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        onNavigate(item.page);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--card-bg)] rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <item.icon size={16} /> {item.name}
                    </button>
                  ))}

                  <div className="pt-2 mt-2 border-t border-[var(--border-glass)]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 rounded-xl text-xs text-[var(--critical-red)] font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(path) => {
          onNavigate(path as any);
          setIsSearchOpen(false);
        }}
      />
    </>
  );
}
