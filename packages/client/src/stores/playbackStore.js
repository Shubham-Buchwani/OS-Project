import { create } from 'zustand';

/**
 * Playback state machine states: IDLE | PLAYING | PAUSED | COMPLETED
 */
export const PLAYBACK_STATE = Object.freeze({
  IDLE: 'IDLE',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
});

export const usePlaybackStore = create((set, get) => ({
  // State
  playbackState: PLAYBACK_STATE.IDLE,
  steps: [],
  currentStepIndex: 0,
  metrics: null,
  runId: null,
  speed: 1, // multiplier: 0.5x, 1x, 2x, 5x
  intervalId: null,

  // Load a new run's steps into the store
  loadRun: (runId, steps, metrics) => {
    const { _clearInterval } = get();
    _clearInterval();
    set({
      runId,
      steps,
      metrics,
      currentStepIndex: 0,
      playbackState: steps.length > 0 ? PLAYBACK_STATE.PAUSED : PLAYBACK_STATE.IDLE,
    });
  },

  // Reset to initial state
  reset: () => {
    get()._clearInterval();
    set({ playbackState: PLAYBACK_STATE.IDLE, steps: [], currentStepIndex: 0, metrics: null, runId: null });
  },

  // Play — auto-advance
  play: () => {
    const { steps, currentStepIndex, playbackState, speed, _advance } = get();
    if (playbackState === PLAYBACK_STATE.COMPLETED) return;
    if (steps.length === 0) return;

    const ms = Math.round(1000 / speed);
    const id = setInterval(() => {
      const { currentStepIndex, steps, _clearInterval } = get();
      if (currentStepIndex >= steps.length - 1) {
        _clearInterval();
        set({ playbackState: PLAYBACK_STATE.COMPLETED });
        return;
      }
      set((s) => ({ currentStepIndex: s.currentStepIndex + 1 }));
    }, ms);

    set({ playbackState: PLAYBACK_STATE.PLAYING, intervalId: id });
  },

  pause: () => {
    get()._clearInterval();
    set({ playbackState: PLAYBACK_STATE.PAUSED });
  },

  stepForward: () => {
    const { steps, currentStepIndex, playbackState } = get();
    if (playbackState === PLAYBACK_STATE.PLAYING) return;
    if (currentStepIndex >= steps.length - 1) {
      set({ playbackState: PLAYBACK_STATE.COMPLETED });
      return;
    }
    set((s) => ({ currentStepIndex: s.currentStepIndex + 1 }));
  },

  stepBackward: () => {
    const { playbackState } = get();
    if (playbackState === PLAYBACK_STATE.PLAYING) return;
    set((s) => ({
      currentStepIndex: Math.max(0, s.currentStepIndex - 1),
      playbackState: PLAYBACK_STATE.PAUSED,
    }));
  },

  jumpTo: (index) => {
    const { steps, playbackState } = get();
    if (playbackState === PLAYBACK_STATE.PLAYING) get().pause();
    const clamped = Math.max(0, Math.min(index, steps.length - 1));
    set({ currentStepIndex: clamped, playbackState: PLAYBACK_STATE.PAUSED });
  },

  setSpeed: (speed) => {
    const was = get().playbackState;
    get()._clearInterval();
    set({ speed });
    if (was === PLAYBACK_STATE.PLAYING) setTimeout(() => get().play(), 0);
  },

  // Internal: clear interval
  _clearInterval: () => {
    const { intervalId } = get();
    if (intervalId) { clearInterval(intervalId); set({ intervalId: null }); }
  },

  // Derived helper
  getCurrentStep: () => {
    const { steps, currentStepIndex } = get();
    return steps[currentStepIndex] ?? null;
  },
}));
