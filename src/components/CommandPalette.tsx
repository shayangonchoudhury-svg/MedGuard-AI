import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Activity, Building, FileText, ShieldCheck, Wrench, X } from 'lucide-react';
import { getSearchResults, SearchResult } from '../lib/search';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const icons = { Activity, Building, FileText, ShieldCheck, Wrench };

export default function CommandPalette({ isOpen, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setResults(getSearchResults(query));
      setSelectedIndex(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(prev - 1, 0));
      if (e.key === 'Enter') results[selectedIndex] && onNavigate(results[selectedIndex].path);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[var(--bg-navy)] border border-[var(--border-glass)] rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b border-[var(--border-glass)]">
              <Search className="text-[var(--text-secondary)]" size={20} />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent focus:outline-none text-[var(--text-primary)]" placeholder="Search equipment, reports..." />
              <button onClick={onClose}><X size={20} className='text-[var(--text-secondary)]' /></button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {results.length === 0 && query && <p className="p-4 text-center text-[var(--text-secondary)]">No results found.</p>}
              {results.map((r, i) => {
                const Icon = icons[r.icon as keyof typeof icons] || Activity;
                return (
                  <button key={r.id} onClick={() => onNavigate(r.path)} className={`w-full flex items-center gap-4 p-3 rounded-lg ${i === selectedIndex ? 'bg-[var(--card-bg)] border border-[var(--accent-cyan)]' : 'hover:bg-[var(--card-bg)]'}`}>
                    <div className='p-2 rounded-lg bg-[var(--card-bg)] text-[var(--accent-cyan)]'><Icon size={18}/></div>
                    <div className='text-left'>
                      <p className='font-bold text-[var(--text-primary)]'>{r.title}</p>
                      <p className='text-xs text-[var(--text-secondary)]'>{r.category} • {r.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
