import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6366f1','#14b8a6'];
const NULL_COLOR = 'rgba(255,255,255,0.04)';

/**
 * MemoryGrid — Konva-less pure React+CSS grid visualization of page frames.
 * Shows per-frame page number, hit/fault indicator for current step.
 */
export default function MemoryGrid({ step, frameCount = 4 }) {
  const frames = step?.frames ?? [];
  const isHit   = step?.hit;
  const page    = step?.page;
  const evicted = step?.evictedPage;
  const fault   = step?.fault;

  const displayFrames = Array.from({ length: frameCount }, (_, i) => {
    const f = frames[i];
    if (typeof f === 'object' && f !== null) return f.page ?? null;
    return f ?? null;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Status banner */}
      {step && (
        <motion.div
          key={step.index}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: fault ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
            border: `1px solid ${fault ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.875rem',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: fault ? 'var(--clr-danger)' : 'var(--clr-success)', flexShrink: 0 }} />
          <span>
            {fault
              ? <>Page <strong style={{ color: 'var(--clr-danger)' }}>{page}</strong> → PAGE FAULT {evicted !== null ? `(evicted P${evicted})` : '(cold miss)'}</>
              : <>Page <strong style={{ color: 'var(--clr-success)' }}>{page}</strong> → HIT</>
            }
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Ref #{step.index + 1}</span>
        </motion.div>
      )}

      {/* Frame grid */}
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 10, fontWeight: 500 }}>MEMORY FRAMES</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(frameCount, 8)}, 1fr)`, gap: 10 }}>
          {displayFrames.map((page, i) => {
            const color = page !== null ? COLORS[page % COLORS.length] : NULL_COLOR;
            const isEvicted = evicted !== null && page === evicted;
            const isNew = fault && step?.frames?.[i] === step?.page;
            return (
              <motion.div
                key={i}
                layout
                animate={{
                  scale: isNew ? [1, 1.08, 1] : 1,
                  borderColor: isEvicted ? 'rgba(239,68,68,0.6)' : isNew ? 'rgba(16,185,129,0.6)' : `${color}44`,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  aspectRatio: '1',
                  border: `2px solid ${color}44`,
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: page !== null ? `${color}18` : NULL_COLOR,
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>F{i}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: page !== null ? color : 'var(--clr-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {page !== null ? page : '—'}
                </div>
                {isEvicted && (
                  <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--clr-danger)' }} />
                )}
                {isNew && (
                  <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--clr-success)' }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reference string progress */}
      {step && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 6, fontWeight: 500 }}>
            PAGE FAULTS: <span style={{ color: 'var(--clr-danger)' }}>{/* shown in metrics */}—</span>
          </div>
        </div>
      )}
    </div>
  );
}
