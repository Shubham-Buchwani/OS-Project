import { z } from 'zod';
import {
  SCHEDULING_ALGORITHMS,
  MEMORY_ALGORITHMS,
  DEADLOCK_MODES,
  FILESYSTEM_MODES,
  ALLOCATION_METHODS,
  DISK_ALGORITHMS,
  MODULES,
  DIFFICULTY,
  ENGINE_LIMITS,
} from './constants.js';

// ─── Auth Schemas ────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  displayName: z.string().min(2, 'Display name too short').max(50, 'Display name too long').trim(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

// ─── Process schema (used across scheduling configs) ─────────────────────────
const processSchema = z.object({
  pid: z.number().int().positive(),
  arrivalTime: z.number().int().min(0),
  burstTime: z.number().int().positive(),
  priority: z.number().int().min(1).max(10).optional().default(1),
});

// ─── Scheduling Config Schema ─────────────────────────────────────────────────
export const schedulingConfigSchema = z
  .object({
    algorithm: z.enum(Object.values(SCHEDULING_ALGORITHMS)),
    preemptive: z.boolean().optional().default(false),
    timeQuantum: z.number().int().positive().max(100).optional(),
    processes: z
      .array(processSchema)
      .min(1, 'At least one process required')
      .max(ENGINE_LIMITS.MAX_PROCESSES, `Max ${ENGINE_LIMITS.MAX_PROCESSES} processes`),
    mlfqConfig: z
      .object({
        levels: z.number().int().min(2).max(5).default(3),
        quanta: z.array(z.number().int().positive()).default([4, 8, 16]),
        boostInterval: z.number().int().positive().default(50),
      })
      .optional(),
  })
  .refine(
    (data) =>
      data.algorithm !== SCHEDULING_ALGORITHMS.ROUND_ROBIN || data.timeQuantum != null,
    { message: 'timeQuantum is required for Round Robin', path: ['timeQuantum'] }
  )
  .refine(
    (data) => data.algorithm !== SCHEDULING_ALGORITHMS.MLFQ || data.mlfqConfig != null,
    { message: 'mlfqConfig is required for MLFQ', path: ['mlfqConfig'] }
  );

// ─── Memory Config Schema ─────────────────────────────────────────────────────
export const memoryConfigSchema = z.object({
  algorithm: z.enum(Object.values(MEMORY_ALGORITHMS)),
  frameCount: z
    .number()
    .int()
    .positive()
    .max(ENGINE_LIMITS.MAX_FRAMES, `Max ${ENGINE_LIMITS.MAX_FRAMES} frames`),
  pageReferenceString: z
    .array(z.number().int().min(0))
    .min(1)
    .max(ENGINE_LIMITS.MAX_REF_STRING, `Max ${ENGINE_LIMITS.MAX_REF_STRING} references`),
});

// ─── Deadlock Config Schema ───────────────────────────────────────────────────
export const deadlockConfigSchema = z
  .object({
    mode: z.enum(Object.values(DEADLOCK_MODES)),
    processCount: z.number().int().min(1).max(20),
    resourceTypes: z.number().int().min(1).max(10),
    available: z.array(z.number().int().min(0)),
    maximum: z.array(z.array(z.number().int().min(0))),
    allocation: z.array(z.array(z.number().int().min(0))),
    requestSequence: z
      .array(
        z.object({
          pid: z.number().int().min(0),
          request: z.array(z.number().int().min(0)),
        })
      )
      .optional(),
  })
  .refine((d) => d.available.length === d.resourceTypes, {
    message: 'available array length must equal resourceTypes',
    path: ['available'],
  })
  .refine((d) => d.maximum.length === d.processCount, {
    message: 'maximum must have one row per process',
    path: ['maximum'],
  })
  .refine((d) => d.allocation.length === d.processCount, {
    message: 'allocation must have one row per process',
    path: ['allocation'],
  });

// ─── File System Config Schema ────────────────────────────────────────────────
export const filesystemConfigSchema = z.object({
  mode: z.enum(Object.values(FILESYSTEM_MODES)),
  // Allocation mode
  diskBlocks: z.number().int().positive().max(ENGINE_LIMITS.MAX_DISK_BLOCKS).optional(),
  blockSize: z.number().int().positive().optional(),
  allocationMethod: z.enum(Object.values(ALLOCATION_METHODS)).optional(),
  operations: z
    .array(
      z.object({
        type: z.enum(['create', 'delete', 'read']),
        fileName: z.string().min(1),
        size: z.number().int().positive().optional(),
      })
    )
    .optional(),
  // Disk scheduling mode
  diskScheduling: z
    .object({
      algorithm: z.enum(Object.values(DISK_ALGORITHMS)),
      initialHeadPosition: z.number().int().min(0),
      requestQueue: z.array(z.number().int().min(0)).min(1),
      direction: z.enum(['up', 'down']).default('up'),
      diskSize: z.number().int().positive().default(200),
    })
    .optional(),
});

// ─── Simulation Template Schema ───────────────────────────────────────────────
export const createSimulationSchema = z.object({
  title: z.string().min(3).max(120).trim(),
  module: z.enum(Object.values(MODULES)),
  algorithm: z.string().min(1).max(50),
  difficulty: z.enum(Object.values(DIFFICULTY)),
  description: z.string().max(2000).optional().default(''),
  defaultConfig: z.record(z.unknown()),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
});

export const updateSimulationSchema = createSimulationSchema.partial();

// ─── Run Config schema (combined) ────────────────────────────────────────────
export const runConfigSchema = z.object({
  config: z.record(z.unknown()),
});

// ─── Pagination schema ────────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});
