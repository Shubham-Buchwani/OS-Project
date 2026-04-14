import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw, Save, ChevronFirst, ChevronLast, Loader, BookmarkCheck } from 'lucide-react';
import { simulationsApi, runsApi } from '../lib/api.js';
import { usePlaybackStore, PLAYBACK_STATE } from '../stores/playbackStore.js';
import { toast } from '../stores/uiStore.js';
import GanttChart from '../components/visualizations/GanttChart.jsx';
import MemoryGrid from '../components/visualizations/MemoryGrid.jsx';
import DeadlockGraph from '../components/visualizations/DeadlockGraph.jsx';
import DiskChart from '../components/visualizations/DiskChart.jsx';
import ConfigEditor from '../components/simulation/ConfigEditor.jsx';
import MetricsPanel from '../components/simulation/MetricsPanel.jsx';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 5, 10];

export default function SimulationRunPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [runDoc, setRunDoc] = useState(null);
  const [config, setConfig] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'metrics' | 'notes'

  const { playbackState, steps, currentStepIndex, speed, metrics, loadRun, reset, play, pause, stepForward, stepBackward, jumpTo, setSpeed, getCurrentStep } = usePlaybackStore();

  // Fetch simulation template
  const { data: simData, isLoading: simLoading } = useQuery({
    queryKey: ['simulation', id],
    queryFn: () => simulationsApi.get(id),
    select: (r) => r.data.data,
  });

  // Set default config from template
  useEffect(() => {
    if (simData && !config) setConfig(simData.defaultConfig);
  }, [simData]);

  // Run mutation
  const { mutate: runSim, isPending: isRunning } = useMutation({
    mutationFn: () => simulationsApi.run(id, config),
    onSuccess: ({ data }) => {
      const run = data.data;
      setRunDoc(run);
      loadRun(run._id, run.steps, run.metrics);
      toast.success(`Simulation complete — ${run.stepCount} steps`);
    },
    onError: (err) => toast.error(err.response?.data?.error?.message ?? 'Simulation failed'),
  });

  // Save mutation
  const { mutate: saveRun, isPending: isSaving } = useMutation({
    mutationFn: () => runsApi.update(runDoc._id, { isSaved: true, userNotes }),
    onSuccess: () => toast.success('Run saved!'),
    onError: () => toast.error('Failed to save run'),
  });

  const currentStep = getCurrentStep();
  const canSave = runDoc && !runDoc.isSaved;

  const renderVisual = () => {
    if (!simData) return null;
    const module = simData.module;
    if (!currentStep && steps.length === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--clr-text-muted)', gap: 12 }}>
        <Play size={40} style={{ opacity: 0.3 }} />
        <p>Configure and run a simulation to see the visualization.</p>
      </div>
    );

    switch (module) {
      case 'scheduling': return <GanttChart ganttChart={runDoc?.result?.ganttChart ?? []} currentStep={currentStep} processes={config?.processes ?? []} />;
      case 'memory':     return <MemoryGrid step={currentStep} frameCount={config?.frameCount ?? 4} />;
      case 'deadlock':   return <DeadlockGraph step={currentStep} need={runDoc?.result?.need} allocation={config?.allocation} available={config?.available} adjacencyList={runDoc?.result?.adjacencyList} processCount={config?.processCount ?? 0} />;
      case 'filesystem': return <DiskChart step={currentStep} mode={config?.mode} diskScheduling={config?.diskScheduling} diskBlocks={config?.diskBlocks} />;
      default: return <p>Unknown module</p>;
    }
  };

  if (simLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader size={32} style={{ color: 'var(--clr-primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100%' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate('/simulations')}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ marginBottom: 0 }}>{simData?.title}</h2>
            <span className={`badge badge-${simData?.module}`}>{simData?.module}</span>
            <span className={`badge badge-${simData?.difficulty}`}>{simData?.difficulty}</span>
          </div>
          <p style={{ fontSize: '0.875rem', marginTop: 2 }}>{simData?.description}</p>
        </div>
        {canSave && (
          <button className="btn btn-secondary btn-sm" onClick={() => saveRun()} disabled={isSaving}>
            {isSaving ? <Loader size={14} /> : <Save size={14} />} Save Run
          </button>
        )}
        {runDoc?.isSaved && (
          <span className="badge badge-success"><BookmarkCheck size={12} /> Saved</span>
        )}
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, flex: 1, minHeight: 0 }}>

        {/* Left — Config Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 20, flex: 1, overflow: 'auto' }}>
            <h4 style={{ marginBottom: 16 }}>Configuration</h4>
            {config && simData && (
              <ConfigEditor
                module={simData.module}
                algorithm={simData.algorithm}
                config={config}
                onChange={setConfig}
                disabled={isRunning}
              />
            )}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => { reset(); runSim(); }}
            disabled={isRunning}
          >
            {isRunning ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running…</> : <><Play size={16} /> Run Simulation</>}
          </button>
        </div>

        {/* Right — Visualization + Playback */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['visual', 'metrics', 'notes'].map((tab) => (
              <button
                key={tab}
                className={`btn btn-sm ${activeTab === tab ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Visualization area */}
          <div className="glass-card" style={{ padding: 24, flex: 1, minHeight: 320 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
                {activeTab === 'visual'  && renderVisual()}
                {activeTab === 'metrics' && <MetricsPanel metrics={metrics} module={simData?.module} completedProcesses={runDoc?.result?.completedProcesses} />}
                {activeTab === 'notes'   && (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label className="form-label">Your Notes</label>
                    <textarea
                      className="form-input"
                      style={{ flex: 1, resize: 'none', minHeight: 200 }}
                      placeholder="Jot down observations about this simulation…"
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Playback Controls */}
          {steps.length > 0 && (
            <div className="glass-card" style={{ padding: 16 }}>
              {/* Step slider */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 6 }}>
                  <span>Step {currentStepIndex + 1}</span>
                  <span>of {steps.length}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={steps.length - 1}
                  value={currentStepIndex}
                  onChange={(e) => jumpTo(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--clr-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* Buttons row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => jumpTo(0)} title="Go to start"><ChevronFirst size={16} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={stepBackward} title="Step back"><SkipBack size={16} /></button>
                  {playbackState === PLAYBACK_STATE.PLAYING
                    ? <button className="btn btn-primary btn-sm" onClick={pause}><Pause size={16} /> Pause</button>
                    : <button className="btn btn-primary btn-sm" onClick={play} disabled={playbackState === PLAYBACK_STATE.COMPLETED}><Play size={16} /> Play</button>
                  }
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={stepForward} title="Step forward"><SkipForward size={16} /></button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => jumpTo(steps.length - 1)} title="Go to end"><ChevronLast size={16} /></button>
                </div>

                {/* Speed selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Speed:</span>
                  <select className="form-input" style={{ width: 72, padding: '4px 8px', fontSize: '0.8rem' }} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                    {SPEED_OPTIONS.map(s => <option key={s} value={s}>{s}×</option>)}
                  </select>
                </div>

                <button className="btn btn-ghost btn-sm btn-icon" onClick={reset} title="Reset"><RotateCcw size={16} /></button>
              </div>

              {/* State indicator */}
              {playbackState === PLAYBACK_STATE.COMPLETED && (
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-success)' }}>
                  ✓ Simulation complete
                </div>
              )}

              {/* Current step event */}
              {currentStep?.event && (
                <div style={{ marginTop: 8, padding: '6px 12px', background: 'var(--clr-primary-dim)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--clr-primary)', fontFamily: 'var(--font-mono)' }}>
                  {currentStep.event}{currentStep.tick !== undefined ? ` @ tick ${currentStep.tick}` : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
