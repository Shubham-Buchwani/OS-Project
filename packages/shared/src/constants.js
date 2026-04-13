// ─── User Roles ─────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
});

// ─── Simulation Modules ──────────────────────────────────────────────────────
export const MODULES = Object.freeze({
  SCHEDULING: 'scheduling',
  MEMORY: 'memory',
  DEADLOCK: 'deadlock',
  FILESYSTEM: 'filesystem',
});

// ─── Scheduling Algorithms ───────────────────────────────────────────────────
export const SCHEDULING_ALGORITHMS = Object.freeze({
  FCFS: 'fcfs',
  SJF: 'sjf',
  ROUND_ROBIN: 'roundRobin',
  PRIORITY: 'priority',
  MLFQ: 'mlfq',
});

// ─── Memory Algorithms ───────────────────────────────────────────────────────
export const MEMORY_ALGORITHMS = Object.freeze({
  FIFO: 'fifo',
  LRU: 'lru',
  OPTIMAL: 'optimal',
  CLOCK: 'clock',
});

// ─── Deadlock Modes ──────────────────────────────────────────────────────────
export const DEADLOCK_MODES = Object.freeze({
  BANKERS: 'bankers',
  DETECTION: 'detection',
});

// ─── File System Modes ───────────────────────────────────────────────────────
export const FILESYSTEM_MODES = Object.freeze({
  ALLOCATION: 'allocation',
  DISK_SCHEDULING: 'diskScheduling',
});

export const ALLOCATION_METHODS = Object.freeze({
  CONTIGUOUS: 'contiguous',
  LINKED: 'linked',
  INDEXED: 'indexed',
});

export const DISK_ALGORITHMS = Object.freeze({
  FCFS: 'fcfs',
  SSTF: 'sstf',
  SCAN: 'scan',
  CSCAN: 'cscan',
  LOOK: 'look',
});

// ─── Simulation Run Status ───────────────────────────────────────────────────
export const RUN_STATUS = Object.freeze({
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

// ─── Difficulty ──────────────────────────────────────────────────────────────
export const DIFFICULTY = Object.freeze({
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
});

// ─── Engine Limits ───────────────────────────────────────────────────────────
export const ENGINE_LIMITS = Object.freeze({
  MAX_STEPS: 10_000,
  MAX_PROCESSES: 100,
  MAX_FRAMES: 64,
  MAX_DISK_BLOCKS: 512,
  MAX_REF_STRING: 500,
});

// ─── Subscription Tiers ──────────────────────────────────────────────────────
export const SUBSCRIPTION_TIERS = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
});
