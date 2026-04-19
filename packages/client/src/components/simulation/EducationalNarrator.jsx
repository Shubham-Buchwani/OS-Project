import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Info, HelpCircle, GraduationCap } from 'lucide-react';
import { getStepNarrative } from '../../lib/narrativeUtils.js';

/**
 * EducationalNarrator Component
 * Displays layman-friendly explanations during simulations.
 */
export default function EducationalNarrator({ step, module, algorithm, config }) {
  const narrative = getStepNarrative(step, module, algorithm, config);

  if (!narrative) return null;

  return (
    <div className="educational-narrator" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={narrative.title + step?.tick + step?.index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {/* Title and Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              background: 'var(--clr-primary-dim)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--clr-primary)',
              border: '1px solid var(--clr-border)'
            }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>{narrative.title}</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {module} • {algorithm}
              </span>
            </div>
          </div>

          {/* Core Explanation */}
          <div className="glass-card" style={{ 
            padding: '16px 20px', 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderLeft: '4px solid var(--clr-primary)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0'
          }}>
            <p style={{ 
              margin: 0, 
              color: 'var(--clr-text-secondary)', 
              fontSize: '0.95rem', 
              lineHeight: 1.6 
            }}>
              {narrative.explanation}
            </p>
          </div>

          {/* Pro Tip / Analogy */}
          {narrative.tip && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ 
                display: 'flex', 
                gap: 10, 
                padding: '12px 16px', 
                background: 'var(--clr-accent-dim)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}
            >
              <Lightbulb size={18} style={{ color: 'var(--clr-accent)', flexShrink: 0 }} />
              <p style={{ 
                margin: 0, 
                fontSize: '0.85rem', 
                color: 'var(--clr-accent)',
                fontStyle: 'italic'
              }}>
                <strong>Did you know?</strong> {narrative.tip}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
