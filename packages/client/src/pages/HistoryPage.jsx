import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, Bookmark, BookmarkCheck, FlaskConical, Loader } from 'lucide-react';
import { runsApi } from '../lib/api.js';
import { toast } from '../stores/uiStore.js';

function formatDuration(ms) {
  if (!ms) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export default function HistoryPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
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

  const runs = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 6 }}>Run History</h1>
        <p>All your simulation runs — save, review, and replay.</p>
      </motion.div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Loader size={28} style={{ color: 'var(--clr-primary)', animation: 'spin 1s linear infinite' }} /></div>
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
              {/* Module badge */}
              <span className={`badge badge-${run.simulationId?.module ?? 'primary'}`}>{run.simulationId?.module ?? '?'}</span>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--clr-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {run.simulationId?.title ?? 'Simulation'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                  {new Date(run.createdAt).toLocaleString()} · {run.stepCount} steps · {formatDuration(run.durationMs)}
                </div>
              </div>

              {/* Status */}
              <span className={`badge badge-${run.status === 'completed' ? 'success' : run.status === 'failed' ? 'danger' : 'primary'}`}>
                {run.status}
              </span>

              {/* Saved indicator */}
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
