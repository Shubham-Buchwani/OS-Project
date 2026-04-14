const METRIC_DEFS = {
  scheduling: [
    { key: 'avgWaitingTime',    label: 'Avg Waiting Time',    unit: 'ms', color: '#8b5cf6' },
    { key: 'avgTurnaroundTime', label: 'Avg Turnaround Time', unit: 'ms', color: '#06b6d4' },
    { key: 'avgResponseTime',   label: 'Avg Response Time',   unit: 'ms', color: '#10b981' },
    { key: 'cpuUtilization',    label: 'CPU Utilization',     unit: '%',  color: '#f59e0b' },
    { key: 'throughput',        label: 'Throughput',          unit: '/t', color: '#ec4899' },
    { key: 'contextSwitches',   label: 'Context Switches',    unit: '',   color: '#6366f1' },
  ],
  memory: [
    { key: 'pageFaults',        label: 'Page Faults',  unit: '',   color: '#ef4444' },
    { key: 'pageHits',          label: 'Page Hits',    unit: '',   color: '#10b981' },
    { key: 'hitRatio',          label: 'Hit Ratio',    unit: '%',  color: '#06b6d4', format: v => `${(v * 100).toFixed(1)}%` },
    { key: 'faultRatio',        label: 'Fault Ratio',  unit: '%',  color: '#f59e0b', format: v => `${(v * 100).toFixed(1)}%` },
    { key: 'totalReferences',   label: 'Total Refs',   unit: '',   color: '#8b5cf6' },
    { key: 'frameCount',        label: 'Frames',       unit: '',   color: '#6366f1' },
  ],
  deadlock: [
    { key: 'safe',              label: 'System State', unit: '',   color: '#10b981', format: v => v ? 'SAFE ✓' : 'UNSAFE ✗' },
    { key: 'processCount',      label: 'Processes',    unit: '',   color: '#8b5cf6' },
    { key: 'resourceTypes',     label: 'Resources',    unit: '',   color: '#06b6d4' },
  ],
  filesystem: [
    { key: 'totalSeek',         label: 'Total Seek',   unit: ' cyl', color: '#8b5cf6' },
    { key: 'avgSeek',           label: 'Avg Seek',     unit: ' cyl', color: '#06b6d4' },
    { key: 'requestCount',      label: 'Requests',     unit: '',     color: '#10b981' },
  ],
};

export default function MetricsPanel({ metrics, module, completedProcesses }) {
  if (!metrics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--clr-text-muted)', gap: 8 }}>
        <p>Run a simulation to see metrics.</p>
      </div>
    );
  }

  const defs = METRIC_DEFS[module] ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {defs.map(({ key, label, unit, color, format }) => {
          const raw = metrics[key];
          if (raw === undefined || raw === null) return null;
          const display = format ? format(raw) : `${typeof raw === 'number' ? (Number.isInteger(raw) ? raw : raw.toFixed(2)) : raw}${unit}`;
          return (
            <div key={key} style={{ background: `${color}0f`, border: `1px solid ${color}30`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{display}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Safe sequence for deadlock */}
      {module === 'deadlock' && metrics.safeSequence?.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--clr-success)' }}>
          Safe Sequence: P{metrics.safeSequence.join(' → P')}
        </div>
      )}
      {module === 'deadlock' && metrics.deadlocked?.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--clr-danger)' }}>
          Deadlocked Processes: P{metrics.deadlocked.join(', P')}
        </div>
      )}

      {/* Per-process table */}
      {completedProcesses?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>PER-PROCESS BREAKDOWN</div>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  {['PID','Arrival','Burst','CT','TAT','WT','RT'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--clr-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedProcesses.map(p => (
                  <tr key={p.pid} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[`P${p.pid}`, p.arrivalTime, p.burstTime, p.completionTime, p.turnaroundTime, p.waitingTime, p.responseTime].map((v, i) => (
                      <td key={i} style={{ padding: '6px 10px', fontFamily: i === 0 ? 'var(--font-mono)' : 'inherit', color: i === 0 ? 'var(--clr-primary)' : 'var(--clr-text-primary)' }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
