import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield, TrendingUp, ArrowRight, Play, ChevronRight } from 'lucide-react';

const FEATURES = [
  { icon: Cpu,       color: '#8b5cf6', title: 'Process Scheduling',    desc: 'Step through FCFS, SJF, Round Robin, Priority & MLFQ with animated Gantt charts.' },
  { icon: Shield,    color: '#06b6d4', title: 'Memory Management',     desc: 'Visualize FIFO, LRU, Optimal & Clock page replacement frame-by-frame.' },
  { icon: Zap,       color: '#ef4444', title: 'Deadlock Detection',    desc: "Run Banker's Algorithm and Wait-For Graph cycle detection interactively." },
  { icon: TrendingUp,color: '#10b981', title: 'File System Simulation',desc: 'Explore disk block allocation and SCAN/SSTF/LOOK disk arm scheduling.' },
];

const STATS = [
  { value: '10+', label: 'Algorithms' },
  { value: '4',   label: 'OS Modules' },
  { value: '∞',   label: 'Simulations' },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--clr-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--clr-primary-dim)', border: '1px solid var(--clr-border-hover)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-primary)' }}>
            <Cpu size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OS Simulator</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login"    className="btn btn-ghost btn-sm">Log In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-60%, -50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', top: '30%', right: '10%', pointerEvents: 'none' }} />

        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} style={{ position: 'relative', zIndex: 1 }}>
          <motion.div variants={fadeUp}>
            <span className="badge badge-primary" style={{ marginBottom: 24, display: 'inline-flex' }}>
              <Zap size={12} /> Interactive OS Learning
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ maxWidth: 760, marginBottom: 24 }}>
            Master Operating System Concepts Through{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Real-Time Simulations
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: '1.2rem', color: 'var(--clr-text-secondary)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Step through process scheduling, memory management, deadlocks, and file systems — algorithm by algorithm, tick by tick.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              <Play size={18} /> Start Learning Free
            </button>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Sign In <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, paddingTop: 48, borderTop: '1px solid var(--clr-border)' }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section style={{ padding: '64px 48px', borderTop: '1px solid var(--clr-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Everything you need to master OS</h2>
            <p>Four core modules, ten algorithms, unlimited simulations.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card"
                style={{ padding: 28 }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <div style={{ width: 44, height: 44, background: `${f.color}22`, border: `1px solid ${f.color}44`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>
                  <f.icon size={22} />
                </div>
                <h4 style={{ marginBottom: 8, color: 'var(--clr-text-primary)' }}>{f.title}</h4>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '64px 48px', textAlign: 'center', borderTop: '1px solid var(--clr-border)' }}>
        <h2 style={{ marginBottom: 16 }}>Ready to simulate?</h2>
        <p style={{ marginBottom: 32 }}>Join now and start exploring OS algorithms interactively.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
          Create Free Account <ChevronRight size={18} />
        </button>
      </section>

      <footer style={{ padding: '24px 48px', borderTop: '1px solid var(--clr-border)', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} OS Simulator · Built for learners
      </footer>
    </div>
  );
}
