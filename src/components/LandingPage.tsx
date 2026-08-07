import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, BarChart3, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-navy)] text-[var(--text-primary)]">
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass' : 'bg-transparent'}`}>
        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-[var(--accent-cyan)] font-['Clash_Display']">MedGuard AI</div>
          <button onClick={onGetStarted} className="px-6 py-2 border border-[var(--border-glass)] rounded-full text-sm hover:bg-[var(--card-bg)]">Get Started</button>
        </div>
      </nav>

      <header className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            AI-Powered Biomedical<br /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-cyan)] to-blue-500">
                Equipment Intelligence
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto"
          >
            Clinical-grade intelligence for hospital infrastructure. Monitor, predict, maintain, and ensure compliance with the precision of a Command Center.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onGetStarted}
            className="group relative px-10 py-4 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-full text-lg font-bold hover:shadow-[0_0_20px_var(--accent-cyan)] transition-all"
          >
            <span className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-cyan)] opacity-20" />
            Get Started <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </header>

      {/* Stats Ticker */}
      <div className="border-y border-[var(--border-glass)] py-4 glass text-center text-[var(--text-secondary)] text-sm">
        1,248 devices monitored &nbsp; • &nbsp; 99.7% uptime &nbsp; • &nbsp; 42 alerts resolved today
      </div>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, title: 'Predictive Maintenance', text: 'AI-driven failure prediction' },
          { icon: ShieldCheck, title: 'Compliance Automation', text: 'Audit-ready compliance' },
          { icon: BarChart3, title: 'Risk Intelligence', text: 'Real-time hazard analysis' },
          { icon: Bot, title: 'Biomedical Copilot', text: 'Expert AI guidance' },
        ].map((f, i) => (
            <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass p-8 rounded-3xl border border-[var(--border-glass)] hover:border-[var(--accent-cyan)] transition-all group"
            >
                <f.icon size={32} className="text-[var(--accent-cyan)] mb-4 group-hover:drop-shadow-[0_0_8px_var(--accent-cyan)]" />
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-[var(--text-secondary)]">{f.text}</p>
            </motion.div>
        ))}
      </section>
    </div>
  );
}
