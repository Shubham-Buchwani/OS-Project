import { describe, it, expect } from 'vitest';
import { runFCFS, runSJF, runRoundRobin, runPriority, computeSchedulingMetrics } from '../src/scheduling/index.js';

describe('FCFS Scheduling', () => {
  it('single process completes instantly', () => {
    const result = runFCFS([{ pid: 1, arrivalTime: 0, burstTime: 5, priority: 1 }]);
    expect(result.completedProcesses[0].completionTime).toBe(5);
    expect(result.completedProcesses[0].waitingTime).toBe(0);
    expect(result.ganttChart).toEqual([{ pid: 1, start: 0, end: 5 }]);
  });

  it('textbook example — 3 processes', () => {
    const procs = [
      { pid: 1, arrivalTime: 0, burstTime: 24, priority: 1 },
      { pid: 2, arrivalTime: 0, burstTime: 3, priority: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 3, priority: 1 },
    ];
    const result = runFCFS(procs);
    const metrics = computeSchedulingMetrics(result.completedProcesses, 30);
    expect(metrics.avgWaitingTime).toBeCloseTo(17, 0);
    expect(result.completedProcesses).toHaveLength(3);
  });

  it('invariant: sum of gantt durations equals total time', () => {
    const procs = [
      { pid: 1, arrivalTime: 0, burstTime: 8, priority: 1 },
      { pid: 2, arrivalTime: 2, burstTime: 4, priority: 1 },
      { pid: 3, arrivalTime: 4, burstTime: 3, priority: 1 },
    ];
    const result = runFCFS(procs);
    const ganttTotal = result.ganttChart.reduce((s, g) => s + (g.end - g.start), 0);
    const burstTotal = procs.reduce((s, p) => s + p.burstTime, 0);
    expect(ganttTotal).toBe(burstTotal);
  });
});

describe('SJF Scheduling (Non-Preemptive)', () => {
  it('selects shortest job when multiple are available', () => {
    const procs = [
      { pid: 1, arrivalTime: 0, burstTime: 6, priority: 1 },
      { pid: 2, arrivalTime: 0, burstTime: 2, priority: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 4, priority: 1 },
    ];
    const result = runSJF(procs, false);
    // Should run P2(2), P3(4), P1(6)
    expect(result.ganttChart[0].pid).toBe(2);
    expect(result.ganttChart[1].pid).toBe(3);
    expect(result.ganttChart[2].pid).toBe(1);
  });
});

describe('Round Robin Scheduling', () => {
  it('textbook RR with quantum=4', () => {
    const procs = [
      { pid: 1, arrivalTime: 0, burstTime: 24, priority: 1 },
      { pid: 2, arrivalTime: 0, burstTime: 3, priority: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 3, priority: 1 },
    ];
    const result = runRoundRobin(procs, 4);
    expect(result.completedProcesses).toHaveLength(3);
    const p2 = result.completedProcesses.find((p) => p.pid === 2);
    const p3 = result.completedProcesses.find((p) => p.pid === 3);
    expect(p2.completionTime).toBeLessThan(30);
    expect(p3.completionTime).toBeLessThan(30);
  });

  it('invariant: turnaroundTime = completionTime - arrivalTime', () => {
    const procs = [
      { pid: 1, arrivalTime: 0, burstTime: 10 },
      { pid: 2, arrivalTime: 2, burstTime: 5 },
      { pid: 3, arrivalTime: 4, burstTime: 8 },
    ];
    const result = runRoundRobin(procs, 3);
    for (const p of result.completedProcesses) {
      expect(p.turnaroundTime).toBe(p.completionTime - p.arrivalTime);
      expect(p.waitingTime).toBe(p.turnaroundTime - p.burstTime);
    }
  });
});

describe('Priority Scheduling', () => {
  it('executes in priority order (non-preemptive)', () => {
    const procs = [
      { pid: 1, arrivalTime: 0, burstTime: 10, priority: 3 },
      { pid: 2, arrivalTime: 0, burstTime: 1, priority: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 2, priority: 2 },
    ];
    const result = runPriority(procs, false);
    expect(result.ganttChart[0].pid).toBe(2); // highest priority (lowest number)
    expect(result.ganttChart[1].pid).toBe(3);
    expect(result.ganttChart[2].pid).toBe(1);
  });
});
