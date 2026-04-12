/**
 * Database seed script — run once to populate default simulations.
 * Usage: node src/scripts/seed.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { Simulation } from '../models/Simulation.js';
import { Progress } from '../models/Progress.js';

const ADMIN_EMAIL = 'admin@ossim.app';
const ADMIN_PASSWORD = 'Admin@12345!';

const SIMULATIONS = [
  // ── Scheduling ──────────────────────────────────────────────────────────
  {
    title: 'FCFS Scheduling — Getting Started',
    slug: 'fcfs-scheduling-intro',
    module: 'scheduling',
    algorithm: 'fcfs',
    difficulty: 'beginner',
    description: 'Explore First Come First Served scheduling. No preemption — the simplest algorithm. Great for understanding the baseline.',
    tags: ['non-preemptive', 'beginner', 'cpu-scheduling'],
    isPublished: true,
    defaultConfig: {
      algorithm: 'fcfs',
      preemptive: false,
      processes: [
        { pid: 1, arrivalTime: 0, burstTime: 10, priority: 1 },
        { pid: 2, arrivalTime: 2, burstTime: 5, priority: 1 },
        { pid: 3, arrivalTime: 4, burstTime: 8, priority: 1 },
      ],
    },
  },
  {
    title: 'Shortest Job First (Non-Preemptive)',
    slug: 'sjf-non-preemptive',
    module: 'scheduling',
    algorithm: 'sjf',
    difficulty: 'intermediate',
    description: 'SJF picks the process with the shortest burst time. Optimal for minimizing average waiting time — but can cause starvation.',
    tags: ['non-preemptive', 'sjf', 'optimal'],
    isPublished: true,
    defaultConfig: {
      algorithm: 'sjf',
      preemptive: false,
      processes: [
        { pid: 1, arrivalTime: 0, burstTime: 6, priority: 1 },
        { pid: 2, arrivalTime: 1, burstTime: 2, priority: 1 },
        { pid: 3, arrivalTime: 2, burstTime: 8, priority: 1 },
        { pid: 4, arrivalTime: 3, burstTime: 3, priority: 1 },
      ],
    },
  },
  {
    title: 'Round Robin — Time Quantum = 4',
    slug: 'round-robin-q4',
    module: 'scheduling',
    algorithm: 'roundRobin',
    difficulty: 'intermediate',
    description: 'Round Robin divides CPU time fairly using a fixed quantum. Observe how processes take turns and how quantum size impacts performance.',
    tags: ['preemptive', 'fair', 'time-sharing'],
    isPublished: true,
    defaultConfig: {
      algorithm: 'roundRobin',
      preemptive: true,
      timeQuantum: 4,
      processes: [
        { pid: 1, arrivalTime: 0, burstTime: 24, priority: 1 },
        { pid: 2, arrivalTime: 0, burstTime: 3, priority: 1 },
        { pid: 3, arrivalTime: 0, burstTime: 3, priority: 1 },
      ],
    },
  },
  {
    title: 'Priority Scheduling (Preemptive)',
    slug: 'priority-preemptive',
    module: 'scheduling',
    algorithm: 'priority',
    difficulty: 'advanced',
    description: 'Every process has a priority. The highest-priority process always runs first. Watch for starvation of low-priority processes.',
    tags: ['preemptive', 'priority', 'starvation'],
    isPublished: true,
    defaultConfig: {
      algorithm: 'priority',
      preemptive: true,
      processes: [
        { pid: 1, arrivalTime: 0, burstTime: 10, priority: 3 },
        { pid: 2, arrivalTime: 1, burstTime: 5, priority: 1 },
        { pid: 3, arrivalTime: 2, burstTime: 8, priority: 2 },
        { pid: 4, arrivalTime: 3, burstTime: 3, priority: 4 },
      ],
    },
  },
  // ── Memory ──────────────────────────────────────────────────────────────
  {
    title: 'FIFO Page Replacement',
    slug: 'fifo-page-replacement',
    module: 'memory',
    algorithm: 'fifo',
    difficulty: 'beginner',
    description: 'First-In, First-Out: the oldest page in memory is evicted. Simple but can suffer from Belady\'s anomaly.',
    tags: ['page-replacement', 'fifo', 'memory'],
    isPublished: true,
    defaultConfig: {
      algorithm: 'fifo',
      frameCount: 3,
      pageReferenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
    },
  },
  {
    title: 'LRU Page Replacement',
    slug: 'lru-page-replacement',
    module: 'memory',
    algorithm: 'lru',
    difficulty: 'intermediate',
    description: 'Least Recently Used: evict the page not used for the longest time. Approximates optimal behavior.',
    tags: ['page-replacement', 'lru', 'memory'],
    isPublished: true,
    defaultConfig: {
      algorithm: 'lru',
      frameCount: 3,
      pageReferenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
    },
  },
  {
    title: 'Optimal Page Replacement',
    slug: 'optimal-page-replacement',
    module: 'memory',
    algorithm: 'optimal',
    difficulty: 'advanced',
    description: 'Optimal: evict the page that won\'t be used for the longest time. Impossible to implement in practice, but perfect for benchmarking.',
    tags: ['page-replacement', 'optimal', 'memory'],
    isPublished: true,
    defaultConfig: {
      algorithm: 'optimal',
      frameCount: 3,
      pageReferenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
    },
  },
  // ── Deadlock ─────────────────────────────────────────────────────────────
  {
    title: "Banker's Algorithm — Safe State",
    slug: 'bankers-algorithm-safe',
    module: 'deadlock',
    algorithm: 'bankers',
    difficulty: 'intermediate',
    description: "Classic Banker's Algorithm from Silberschatz. 5 processes, 3 resource types. The system is in a safe state — find the safe sequence.",
    tags: ['deadlock', 'avoidance', 'safe-state'],
    isPublished: true,
    defaultConfig: {
      mode: 'bankers',
      processCount: 5,
      resourceTypes: 3,
      available: [3, 3, 2],
      maximum: [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]],
      allocation: [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]],
    },
  },
  // ── Filesystem ───────────────────────────────────────────────────────────
  {
    title: 'Disk Scheduling — SCAN Algorithm',
    slug: 'disk-scheduling-scan',
    module: 'filesystem',
    algorithm: 'scan',
    difficulty: 'intermediate',
    description: 'SCAN (elevator algorithm): the disk arm sweeps back and forth servicing requests. Compare total seek distance vs FCFS.',
    tags: ['disk-scheduling', 'scan', 'elevator'],
    isPublished: true,
    defaultConfig: {
      mode: 'diskScheduling',
      diskScheduling: {
        algorithm: 'scan',
        initialHeadPosition: 53,
        requestQueue: [98, 183, 37, 122, 14, 124, 65, 67],
        direction: 'up',
        diskSize: 200,
      },
    },
  },
  {
    title: 'File Block Allocation — Indexed Method',
    slug: 'file-allocation-indexed',
    module: 'filesystem',
    algorithm: 'indexed',
    difficulty: 'beginner',
    description: 'Watch how files are allocated on disk using the indexed method. Each file has an index block storing pointers to its data blocks.',
    tags: ['file-system', 'allocation', 'indexed'],
    isPublished: true,
    defaultConfig: {
      mode: 'allocation',
      diskBlocks: 32,
      blockSize: 512,
      allocationMethod: 'indexed',
      operations: [
        { type: 'create', fileName: 'main.c', size: 1536 },
        { type: 'create', fileName: 'data.txt', size: 2048 },
        { type: 'read', fileName: 'main.c' },
        { type: 'delete', fileName: 'data.txt' },
        { type: 'create', fileName: 'report.pdf', size: 3072 },
      ],
    },
  },
];

export async function runSeed() {
  console.log('🌱 Checking database seeds...');

  // Create admin user
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    admin = await User.create({ email: ADMIN_EMAIL, passwordHash, displayName: 'Admin', role: 'admin' });
    await Progress.create({ userId: admin._id });
    console.log(`👤 Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log('👤 Admin already exists, skipping.');
  }

  // Seed simulations
  let created = 0;
  for (const sim of SIMULATIONS) {
    const exists = await Simulation.findOne({ slug: sim.slug });
    if (!exists) {
      await Simulation.create({ ...sim, createdBy: admin._id });
      created++;
    }
  }
  console.log(`🎭 Seeded ${created} simulations (${SIMULATIONS.length - created} already existed)`);
  console.log('✅ Seed check complete');
}

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mongoose.connect(config.MONGODB_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => { 
      console.error('Seed failed:', err); 
      process.exit(1); 
    });
}
