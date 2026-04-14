import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Flame, Cpu, Database, AlertTriangle, HardDrive, CheckCircle } from 'lucide-react';
import { progressApi } from '../lib/api.js';
import Skeleton from '../components/ui/Skeleton.jsx';

const MODULE_META = {
  scheduling: { icon: Cpu,           label: 'Process Scheduling', color: '#8b5cf6', algorithms: ['fcfs','sjf','roundRobin','priority','mlfq'] },
  memory:     { icon: Database,      label: 'Memory Management',  color: '#06b6d4', algorithms: ['fifo','lru','optimal','clock'] },
  deadlock:   { icon: AlertTriangle, label: 'Deadlock Detection', color: '#ef4444', algorithms: ['bankers','detection'] },
  filesystem: { icon: HardDrive,     label: 'File System',        color: '#10b981', algorithms: ['fcfs','sstf','scan','cscan','look'] },
};

export default function ProgressPage() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressApi.get(),
    select: (r) => r.data.data,
  });

  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => progressApi.leaderboard(),
    select: (r) => r.data.data,
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 6 }}>Your Progress</h1>
        <p>Track your mastery across all OS modules.</p>
      </motion.div>

      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height="120px" />)
        ) : (
          [
            { icon: CheckCircle, color: '#8b5cf6', label: 'Completion',  value: `${progress?.overallCompletionPercent ?? 0}%` },
            { icon: Flame,       color: '#f59e0b', label: 'Day Streak',  value: `${progress?.streakDays ?? 0}d` },
            { icon: Trophy,      color: '#10b981', label: 'Achievements',value: progress?.achievements?.length ?? 0 },
          ].map((s) => (
            <motion.div key={s.label} className="glass-card" style={{ padding: 20, textAlign: 'center' }} whileHover={{ y: -2 }}>
              <s.icon size={24} style={{ color: s.color, margin: '0 auto 8px' }} />
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{s.label}</div>
            </motion.div>
          ))
        )}
      </div>

      {/* Module breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height="180px" />)
        ) : (
          Object.entries(MODULE_META).map(([key, meta]) => {
            const mod = progress?.modules?.[key];
            const completed = mod?.completedAlgorithms ?? [];
            const totalRuns = mod?.totalRuns ?? 0;
            const pct = Math.round((completed.length / meta.algorithms.length) * 100);

            return (
              <motion.div key={key} className="glass-card" style={{ padding: 22 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: `${meta.color}22`, border: `1px solid ${meta.color}44`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                    <meta.icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{meta.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{totalRuns} runs</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '1.1rem', fontWeight: 700, color: meta.color }}>{pct}%</div>
                </div>

                <div className="progress-track" style={{ marginBottom: 14 }}>
                  <motion.div
                    className="progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)` }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {meta.algorithms.map((algo) => (
                    <span
                      key={algo}
                      className="badge"
                      style={{
                        background: completed.includes(algo) ? `${meta.color}22` : 'rgba(255,255,255,0.04)',
                        color: completed.includes(algo) ? meta.color : 'var(--clr-text-muted)',
                        border: `1px solid ${completed.includes(algo) ? meta.color + '44' : 'transparent'}`,
                        fontSize: '0.7rem',
                      }}
                    >
                      {completed.includes(algo) && <CheckCircle size={10} />} {algo}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Leaderboard */}
      <div className="glass-card" style={{ padding: 22 }}>
        <h3 style={{ marginBottom: 16 }}>Leaderboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isLeaderboardLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height="50px" />)
          ) : (
            leaderboard.slice(0, 10).map((entry, i) => (
              <div key={entry._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: i < 3 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 8, border: i < 3 ? '1px solid rgba(245,158,11,0.15)' : '1px solid transparent' }}>
                <span style={{ width: 24, textAlign: 'center', fontWeight: 700, color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                  {entry.userId?.displayName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{entry.userId?.displayName ?? 'Anonymous'}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-primary)' }}>{entry.overallCompletionPercent}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{entry.totalSimulationsRun} runs</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
