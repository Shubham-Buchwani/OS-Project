import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle, error: XCircle, info: Info };
const COLORS = { success: 'var(--clr-success)', error: 'var(--clr-danger)', info: 'var(--clr-primary)' };

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] ?? Info;
          return (
            <motion.div
              key={t.id}
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, x: 64, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 64, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Icon size={16} style={{ color: COLORS[t.type], flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--clr-text-primary)' }}>{t.message}</span>
              <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer', padding: 2 }}>
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
