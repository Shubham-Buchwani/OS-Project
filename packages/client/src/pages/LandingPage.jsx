import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

const SPECIFICATIONS = [
  { module: 'Process Scheduling', algorithms: ['FCFS', 'SJF (Preemptive)', 'Round Robin', 'Priority'], complexity: 'O(N log N)', status: 'Live' },
  { module: 'Memory Management',  algorithms: ['FIFO', 'LRU', 'Optimal', 'Clock'], complexity: 'O(1) - O(N)', status: 'Live' },
  { module: 'Deadlock Control',    algorithms: ['Bankers', 'Wait-for Graph'], complexity: 'O(P * R^2)', status: 'Live' },
  { module: 'Disk Scheduling',    algorithms: ['FCFS', 'SSTF', 'SCAN', 'LOOK'], complexity: 'O(N log N)', status: 'Live' },
];

function SimulationPreview() {
  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', width: '100%', maxWidth: 540 }}>
      {/* Window Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-bg-elevated)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--clr-text-muted)', fontFamily: 'var(--font-mono)' }}>simulation_run_01.exec</span>
      </div>
      
      {/* Simulation Content */}
      <div style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--clr-primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Live Schedule</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>CPU Activity Trace</div>
          </div>
          <div className="tag-tech" style={{ display: 'none', '@media (min-width: 480px)': { display: 'block' } }}>Algo: Round Robin</div>
        </div>

        {/* Mock Gantt Chart */}
        <div style={{ display: 'flex', gap: 4, height: 40, marginBottom: 32 }}>
          <div style={{ flex: 2, background: 'var(--clr-primary)', borderRadius: 4, opacity: 0.9 }} />
          <div style={{ flex: 1, background: 'var(--clr-accent)',  borderRadius: 4, opacity: 0.8 }} />
          <div style={{ flex: 3, background: 'var(--clr-primary)', borderRadius: 4, opacity: 0.7 }} />
          <div style={{ flex: 1.5, background: 'var(--clr-success)', borderRadius: 4, opacity: 0.6 }} />
          <div style={{ flex: 2, background: 'var(--clr-primary)', borderRadius: 4, opacity: 0.9 }} />
        </div>

        {/* Mock Job Queue */}
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            { id: 'P1', status: 'Running', time: '12ms' },
            { id: 'P2', status: 'Ready',   time: '4ms' },
            { id: 'P3', status: 'Waiting', time: '8ms' },
          ].map((job) => (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--clr-bg-elevated)', border: '1px solid var(--clr-border)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>{job.id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)' }}>{job.status}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{job.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--clr-bg)' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <header style={{ padding: '0 clamp(16px, 5vw, 48px)', height: 72, borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Cpu size={24} color="var(--clr-primary)" />
          <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', display: 'none', '@media (min-width: 480px)': { display: 'block' } }}>OS Simulator</span>
          <span className="tag-tech" style={{ display: 'none', '@media (min-width: 640px)': { display: 'block' } }}>v1.0.4</span>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      {/* ── Hero section ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(64px, 12vw, 120px) clamp(16px, 5vw, 48px)', borderBottom: '1px solid var(--clr-border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(40px, 8vw, 80px)', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--clr-bg-elevated)', border: '1px solid var(--clr-border)', borderRadius: 20, marginBottom: 24, fontSize: '0.8rem', color: 'var(--clr-primary)', fontWeight: 600 }}>
              <Layers size={14} /> System Core v2.0
            </div>
            <h1 style={{ marginBottom: 24, fontWeight: 700, lineHeight: 1.1 }}>
              Visual Simulation for Modern OS.
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'var(--clr-text-secondary)', marginBottom: 40, maxWidth: 560, lineHeight: 1.6 }}>
              A high-precision environment for testing and visualizing OS kernel algorithms. Built for computer science students and engineers.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>Start Simulating</button>
              <button className="btn btn-ghost btn-lg">Documentation</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SimulationPreview />
          </div>
        </div>
      </section>

      {/* ── Engineering Stack Strip ────────────────────────── */}
      <div style={{ padding: '24px 16px', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-bg-elevated)', display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 5vw, 48px)', flexWrap: 'wrap' }}>
        {['React', 'Node.js', 'Redis', 'D3.js', 'Framer'].map(tech => (
          <span key={tech} style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tech}</span>
        ))}
      </div>

      {/* ── Technical Overview ─────────────────────────────── */}
      <section style={{ padding: 'var(--section-spacing) clamp(16px, 5vw, 48px)' }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ marginBottom: 12 }}>Technical Overview</h2>
            <p style={{ color: 'var(--clr-text-muted)' }}>Core simulation modules supported by the engine.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {SPECIFICATIONS.map(spec => (
              <div key={spec.module} className="glass-card" style={{ padding: 'clamp(24px, 4vw, 32px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{spec.module}</h3>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '0.7rem', color: 'var(--clr-success)', fontWeight: 700 }}>
                    <CheckCircle2 size={12} /> Live
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Included Algos</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {spec.algorithms.slice(0, 3).map(algo => <span key={algo} className="tag-tech">{algo}</span>)}
                      {spec.algorithms.length > 3 && <span className="tag-tech">+{spec.algorithms.length - 3} more</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--clr-border)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)' }}>Complexity</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{spec.complexity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: 'var(--section-spacing) clamp(16px, 5vw, 48px)', borderTop: '1px solid var(--clr-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 20 }}>Deploy Your Simulation.</h2>
          <p style={{ marginBottom: 40, color: 'var(--clr-text-secondary)', maxWidth: 600, margin: '0 auto 40px' }}>Join students already mastering operating system internals with our visual workbench.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')} style={{ minWidth: 'clamp(200px, 40vw, 240px)' }}>
            Start Simulation <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ padding: '48px clamp(16px, 5vw, 48px)', borderTop: '1px solid var(--clr-border)', background: 'var(--clr-bg-elevated)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Cpu size={20} color="var(--clr-primary)" />
            <span style={{ fontWeight: 700 }}>OS Simulator</span>
          </div>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--clr-text-secondary)' }}>An open-source workbench for kernel algorithm visualization.</p>
        </div>
        <div>
          <h4 style={{ fontSize: '0.8rem', marginBottom: 16, textTransform: 'uppercase' }}>Modules</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
            <li>Scheduling</li>
            <li>Memory</li>
            <li>Deadlock</li>
          </ul>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--clr-text-muted)', gridColumn: '1 / -1', borderTop: '1px solid var(--clr-border)', paddingTop: 24, marginTop: 12 }}>
          © {new Date().getFullYear()} OS Simulator Project.
        </div>
      </footer>
    </div>
  );
}
