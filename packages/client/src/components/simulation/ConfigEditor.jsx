import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const DEFAULT_PROCESS = { pid: 1, arrivalTime: 0, burstTime: 5, priority: 1 };

/**
 * ConfigEditor — renders the right input form based on module type.
 */
export default function ConfigEditor({ module, algorithm, config, onChange, disabled }) {
  const update = (key, value) => onChange({ ...config, [key]: value });

  const updateProcess = (idx, key, value) => {
    const procs = [...(config.processes ?? [])];
    procs[idx] = { ...procs[idx], [key]: Number(value) };
    onChange({ ...config, processes: procs });
  };

  const addProcess = () => {
    const procs = config.processes ?? [];
    const maxPid = procs.reduce((m, p) => Math.max(m, p.pid), 0);
    onChange({ ...config, processes: [...procs, { ...DEFAULT_PROCESS, pid: maxPid + 1 }] });
  };

  const removeProcess = (idx) => {
    const procs = [...(config.processes ?? [])];
    procs.splice(idx, 1);
    onChange({ ...config, processes: procs });
  };

  if (module === 'scheduling') return <SchedulingConfig config={config} update={update} updateProcess={updateProcess} addProcess={addProcess} removeProcess={removeProcess} algorithm={algorithm} disabled={disabled} />;
  if (module === 'memory')     return <MemoryConfig config={config} update={update} disabled={disabled} />;
  if (module === 'deadlock')   return <DeadlockConfig config={config} update={update} disabled={disabled} />;
  if (module === 'filesystem') return <FilesystemConfig config={config} update={update} disabled={disabled} />;
  return <p style={{ color: 'var(--clr-text-muted)' }}>Unknown module</p>;
}

// ── Scheduling ────────────────────────────────────────────────────────────────
function SchedulingConfig({ config, update, updateProcess, addProcess, removeProcess, algorithm, disabled }) {
  const showQuantum   = config.algorithm === 'roundRobin' || config.algorithm === 'mlfq';
  const showPriority  = config.algorithm === 'priority';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Algorithm</label>
        <select className="form-input" value={config.algorithm} onChange={e => update('algorithm', e.target.value)} disabled={disabled}>
          <option value="fcfs">FCFS</option>
          <option value="sjf">SJF</option>
          <option value="roundRobin">Round Robin</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {(config.algorithm === 'sjf' || config.algorithm === 'priority') && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
          <input type="checkbox" checked={config.preemptive ?? false} onChange={e => update('preemptive', e.target.checked)} disabled={disabled} />
          <span style={{ color: 'var(--clr-text-secondary)' }}>Preemptive</span>
        </label>
      )}

      {showQuantum && (
        <div className="form-group">
          <label className="form-label">Time Quantum</label>
          <input type="number" className="form-input" min={1} max={100} value={config.timeQuantum ?? 4} onChange={e => update('timeQuantum', Number(e.target.value))} disabled={disabled} />
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>Processes ({config.processes?.length ?? 0})</label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addProcess} disabled={disabled}><Plus size={14} /> Add</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: showPriority ? '32px 1fr 1fr 1fr 28px' : '32px 1fr 1fr 28px', gap: 4, fontSize: '0.7rem', color: 'var(--clr-text-muted)', padding: '0 4px' }}>
            <span>PID</span><span>Arrival</span><span>Burst</span>{showPriority && <span>Prio</span>}<span />
          </div>

          {(config.processes ?? []).map((p, idx) => (
            <div key={p.pid} style={{ display: 'grid', gridTemplateColumns: showPriority ? '32px 1fr 1fr 1fr 28px' : '32px 1fr 1fr 28px', gap: 4, alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clr-primary)', textAlign: 'center' }}>P{p.pid}</div>
              <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '0.8rem' }} min={0} value={p.arrivalTime} onChange={e => updateProcess(idx, 'arrivalTime', e.target.value)} disabled={disabled} />
              <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '0.8rem' }} min={1} value={p.burstTime} onChange={e => updateProcess(idx, 'burstTime', e.target.value)} disabled={disabled} />
              {showPriority && <input type="number" className="form-input" style={{ padding: '4px 8px', fontSize: '0.8rem' }} min={1} max={10} value={p.priority} onChange={e => updateProcess(idx, 'priority', e.target.value)} disabled={disabled} />}
              <button type="button" className="btn btn-ghost btn-icon" style={{ padding: 4 }} onClick={() => removeProcess(idx)} disabled={disabled || (config.processes?.length ?? 0) <= 1}><Trash2 size={13} style={{ color: 'var(--clr-danger)' }} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Memory ────────────────────────────────────────────────────────────────────
function MemoryConfig({ config, update, disabled }) {
  const [inputValue, setInputValue] = useState((config.pageReferenceString ?? []).join(', '));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Algorithm</label>
        <select className="form-input" value={config.algorithm} onChange={e => update('algorithm', e.target.value)} disabled={disabled}>
          <option value="fifo">FIFO</option>
          <option value="lru">LRU</option>
          <option value="optimal">Optimal</option>
          <option value="clock">Clock</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Frame Count</label>
        <input type="number" className="form-input" min={1} max={16} value={config.frameCount ?? 3} onChange={e => update('frameCount', Number(e.target.value))} disabled={disabled} />
      </div>
      <div className="form-group">
        <label className="form-label">Page Reference String <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem' }}>(comma separated)</span></label>
        <input
          type="text"
          className="form-input"
          style={{ fontFamily: 'var(--font-mono)' }}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            const arr = e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
            update('pageReferenceString', arr);
          }}
          disabled={disabled}
          placeholder="7, 0, 1, 2, 0, 3, 0, 4"
        />
        <span className="form-hint">{config.pageReferenceString?.length ?? 0} references</span>
      </div>
    </div>
  );
}

// ── Deadlock ──────────────────────────────────────────────────────────────────
function DeadlockConfig({ config, update, disabled }) {
  const [inputValue, setInputValue] = useState((config.available ?? []).join(', '));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Mode</label>
        <select className="form-input" value={config.mode} onChange={e => update('mode', e.target.value)} disabled={disabled}>
          <option value="bankers">Banker's Algorithm</option>
          <option value="detection">Detection (Wait-For Graph)</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group">
          <label className="form-label">Processes</label>
          <input type="number" className="form-input" min={1} max={20} value={config.processCount ?? 5} onChange={e => update('processCount', Number(e.target.value))} disabled={disabled} />
        </div>
        <div className="form-group">
          <label className="form-label">Resource Types</label>
          <input type="number" className="form-input" min={1} max={10} value={config.resourceTypes ?? 3} onChange={e => update('resourceTypes', Number(e.target.value))} disabled={disabled} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Available <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem' }}>(comma separated)</span></label>
        <input
          type="text"
          className="form-input"
          style={{ fontFamily: 'var(--font-mono)' }}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            const arr = e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
            update('available', arr);
          }}
          disabled={disabled}
        />
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Max/Allocation matrices are pre-configured from the template. Advanced editing available in future update.</p>
    </div>
  );
}

// ── Filesystem ────────────────────────────────────────────────────────────────
function FilesystemConfig({ config, update, disabled }) {
  const isDisk = config.mode === 'diskScheduling';
  const ds = config.diskScheduling ?? {};
  const updateDs = (k, v) => update('diskScheduling', { ...ds, [k]: v });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Mode</label>
        <select className="form-input" value={config.mode} onChange={e => update('mode', e.target.value)} disabled={disabled}>
          <option value="diskScheduling">Disk Scheduling</option>
          <option value="allocation">Block Allocation</option>
        </select>
      </div>

      {isDisk && (
        <>
          <div className="form-group">
            <label className="form-label">Algorithm</label>
            <select className="form-input" value={ds.algorithm ?? 'fcfs'} onChange={e => updateDs('algorithm', e.target.value)} disabled={disabled}>
              <option value="fcfs">FCFS</option>
              <option value="sstf">SSTF</option>
              <option value="scan">SCAN</option>
              <option value="cscan">C-SCAN</option>
              <option value="look">LOOK</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Initial Head Position</label>
            <input type="number" className="form-input" min={0} value={ds.initialHeadPosition ?? 53} onChange={e => updateDs('initialHeadPosition', Number(e.target.value))} disabled={disabled} />
          </div>
          <div className="form-group">
            <label className="form-label">Request Queue <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem' }}>(comma separated)</span></label>
            <input type="text" className="form-input" style={{ fontFamily: 'var(--font-mono)' }} value={(ds.requestQueue ?? []).join(', ')} onChange={e => { const arr = e.target.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)); updateDs('requestQueue', arr); }} disabled={disabled} placeholder="98, 183, 37, 122, 14" />
          </div>
          {(ds.algorithm === 'scan' || ds.algorithm === 'look') && (
            <div className="form-group">
              <label className="form-label">Direction</label>
              <select className="form-input" value={ds.direction ?? 'up'} onChange={e => updateDs('direction', e.target.value)} disabled={disabled}>
                <option value="up">Up (Rising)</option>
                <option value="down">Down (Falling)</option>
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
