import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FlaskConical, TrendingUp, History, ArrowRight, Cpu, Database, AlertTriangle, HardDrive } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { progressApi, simulationsApi } from '../lib/api.js';
import Skeleton from '../components/ui/Skeleton.jsx';

const MODULE_META = {
  scheduling: { icon: Cpu,           label: 'Process Scheduling', color: '#8b5cf6' },
  memory:     { icon: Database,      label: 'Memory Management',  color: '#06b6d4' },
  deadlock:   { icon: AlertTriangle, label: 'Deadlock Detection', color: '#ef4444' },
  filesystem: { icon: HardDrive,     label: 'File System',        color: '#10b981' },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressApi.get(),
    select: (r) => r.data.data,
  });

  const { data: simsData, isLoading: isSimsLoading } = useQuery({
    queryKey: ['simulations', { limit: 6 }],
    queryFn: () => simulationsApi.list({ limit: 6 }),
    select: (r) => r.data.data,
  });

  const progress = progressData;
  const sims = simsData ?? [];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 6 }}>
          Welcome back, <span style={{ background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.displayName}</span>
        </h1>
        <p>Continue your OS learning journey. Pick up where you left off.</p>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {isProgressLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="100px" />)
        ) : (
          [
            { label: 'Overall Progress', value: `${progress?.overallCompletionPercent ?? 0}%`, sub: 'completion' },
            { label: 'Total Runs', value: progress?.totalSimulationsRun ?? 0, sub: 'simulations' },
            { label: 'Day Streak', value: `${progress?.streakDays ?? 0} 🔥`, sub: 'days active' },
            { label: 'Achievements', value: progress?.achievements?.length ?? 0, sub: 'unlocked' },
          ].map((s) => (
            <motion.div key={s.label} className="glass-card" style={{ padding: 20 }} whileHover={{ y: -2 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>{s.sub}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))
        )}
      </div>

      {/* Module progress */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <h3 style={{ marginBottom: 20 }}>Module Progress</h3>
        {isProgressLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Skeleton width="60%" height="20px" />
                <Skeleton height="8px" borderRadius="4px" />
                <Skeleton width="40%" height="14px" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {Object.entries(MODULE_META).map(([key, meta]) => {
              const mod = progress?.modules?.[key];
              const runs = mod?.totalRuns ?? 0;
              const algorithms = mod?.completedAlgorithms ?? [];
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <meta.icon size={16} style={{ color: meta.color }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{meta.label}</span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, algorithms.length * 20)}%` }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}aa)` }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{runs} runs · {algorithms.length} algorithms</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick simulations */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>Jump In</h3>
        <Link to="/simulations" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {isSimsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height="180px" />)
        ) : (
          sims.slice(0, 6).map((sim, i) => {
            const meta = MODULE_META[sim.module] ?? {};
            return (
              <motion.div
                key={sim._id}
                className="glass-card"
                style={{ padding: 20, cursor: 'pointer' }}
                whileHover={{ y: -3, borderColor: meta.color + '66' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span className={`badge badge-${sim.module}`}>{sim.module}</span>
                  <span className={`badge badge-${sim.difficulty}`}>{sim.difficulty}</span>
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 8, color: 'var(--clr-text-primary)' }}>{sim.title}</h4>
                <p style={{ fontSize: '0.8rem', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sim.description}</p>
                <Link to={`/simulations/${sim._id}/run`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <FlaskConical size={14} /> Run Simulation
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
