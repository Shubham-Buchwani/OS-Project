import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FlaskConical, Cpu, Database, AlertTriangle, HardDrive } from 'lucide-react';
import { simulationsApi } from '../lib/api.js';
import Skeleton from '../components/ui/Skeleton.jsx';

const MODULE_OPTIONS = [
  { value: '',           label: 'All Modules' },
  { value: 'scheduling', label: 'Scheduling',  icon: Cpu           },
  { value: 'memory',     label: 'Memory',      icon: Database       },
  { value: 'deadlock',   label: 'Deadlock',    icon: AlertTriangle  },
  { value: 'filesystem', label: 'File System', icon: HardDrive      },
];

const DIFFICULTY_OPTIONS = ['', 'beginner', 'intermediate', 'advanced'];

export default function SimulationsPage() {
  const [filters, setFilters] = useState({ module: '', difficulty: '', search: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['simulations', filters, page],
    queryFn: () => simulationsApi.list({ ...filters, page, limit: 12 }),
    select: (r) => r.data,
    placeholderData: (prev) => prev,
  });

  const sims = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ marginBottom: 6 }}>Simulations</h1>
        <p>Choose a simulation and run it step-by-step.</p>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search simulations…"
            value={filters.search}
            onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
          />
        </div>

        <select className="form-input" style={{ flex: '0 0 160px' }} value={filters.module} onChange={(e) => { setFilters((f) => ({ ...f, module: e.target.value })); setPage(1); }}>
          {MODULE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select className="form-input" style={{ flex: '0 0 160px' }} value={filters.difficulty} onChange={(e) => { setFilters((f) => ({ ...f, difficulty: e.target.value })); setPage(1); }}>
          {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d ? d.charAt(0).toUpperCase() + d.slice(1) : 'All Levels'}</option>)}
        </select>
      </div>

      {/* Grid */}
      {isLoading && !data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height="200px" />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(filters) + page}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}
          >
            {sims.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: 'var(--clr-text-muted)' }}>
                <FlaskConical size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>No simulations found for those filters.</p>
              </div>
            ) : sims.map((sim, i) => (
              <motion.div
                key={sim._id}
                className="glass-card"
                style={{ padding: 22, display: 'flex', flexDirection: 'column' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className={`badge badge-${sim.module}`}>{sim.module}</span>
                  <span className={`badge badge-${sim.difficulty}`}>{sim.difficulty}</span>
                </div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>{sim.title}</h4>
                <p style={{ fontSize: '0.8rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 16 }}>{sim.description}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {sim.tags?.slice(0, 2).map(t => <span key={t} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                </div>
                <Link to={`/simulations/${sim._id}/run`} className="btn btn-primary btn-sm" style={{ marginTop: 16, justifyContent: 'center' }}>
                  <FlaskConical size={14} /> Run
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--clr-text-muted)' }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
