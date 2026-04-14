import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Flame, Cpu, Database, AlertTriangle, HardDrive, CheckCircle, Trash2, Bookmark, BookmarkCheck, FlaskConical } from 'lucide-react';
import { progressApi, runsApi } from '../lib/api.js';
import { toast } from '../stores/uiStore.js';
import Skeleton from '../components/ui/Skeleton.jsx';

function formatDuration(ms) {
  if (!ms) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export default function HistoryPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

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

  const { data: runsData, isLoading: isRunsLoading } = useQuery({
    queryKey: ['runs', page],
    queryFn: () => runsApi.list({ page, limit: 15 }),
    select: (r) => r.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => runsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['runs'] }); toast.success('Run deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const saveMutation = useMutation({
    mutationFn: (id) => runsApi.update(id, { isSaved: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['runs'] }); toast.success('Run saved!'); },
  });

  const runs = runsData?.data ?? [];
  const pagination = runsData?.pagination ?? {};

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 6 }}>Progress & History</h1>
        <p>Track your simulation journey and review past runs.</p>
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

      <div className="glass-card" style={{ padding: 22, marginBottom: 32 }}>
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

      {isRunsLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height="70px" />)}
        </div>
      ) : runs.length === 0 ? (
        <div className="glass-card" style={{ padding: 64, textAlign: 'center' }}>
          <FlaskConical size={40} style={{ margin: '0 auto 16px', color: 'var(--clr-text-muted)', opacity: 0.4 }} />
          <h4 style={{ marginBottom: 8 }}>No runs yet</h4>
          <p>Head to Simulations and run one!</p>
          <Link to="/simulations" className="btn btn-primary btn-sm" style={{ marginTop: 16, display: 'inline-flex' }}>Browse Simulations</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {runs.map((run, i) => (
            <motion.div
              key={run._id}
              className="glass-card"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            >
              <span className={`badge badge-${run.simulationId?.module ?? 'primary'}`}>{run.simulationId?.module ?? '?'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--clr-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {run.simulationId?.title ?? 'Simulation'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                  {new Date(run.createdAt).toLocaleString()} · {run.stepCount} steps · {formatDuration(run.durationMs)}
                </div>
              </div>
              <span className={`badge badge-${run.status === 'completed' ? 'success' : run.status === 'failed' ? 'danger' : 'primary'}`}>
                {run.status}
              </span>
              {run.isSaved && <span className="badge badge-accent" title="Saved"><BookmarkCheck size={12} /></span>}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {!run.isSaved && (
                  <button className="btn btn-ghost btn-sm btn-icon" title="Save" onClick={() => saveMutation.mutate(run._id)}>
                    <Bookmark size={15} />
                  </button>
                )}
                <button className="btn btn-ghost btn-sm btn-icon" title="Delete" style={{ color: 'var(--clr-danger)' }} onClick={() => deleteMutation.mutate(run._id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>Page {page} / {pagination.totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
