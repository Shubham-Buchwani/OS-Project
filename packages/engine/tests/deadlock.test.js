import { describe, it, expect } from 'vitest';
import { runBankers, detectDeadlock } from '../src/deadlock/index.js';

// Textbook example from Silberschatz OS Concepts (10th Ed)
const BANKERS_SAFE = {
  available: [3, 3, 2],
  maximum: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
};

describe("Banker's Algorithm", () => {
  it('textbook safe state → returns safe=true with sequence', () => {
    const { safe, safeSequence } = runBankers(
      BANKERS_SAFE.available,
      BANKERS_SAFE.maximum,
      BANKERS_SAFE.allocation
    );
    expect(safe).toBe(true);
    expect(safeSequence).toHaveLength(5);
  });

  it('safe sequence is valid: all 5 processes complete', () => {
    const { safeSequence } = runBankers(
      BANKERS_SAFE.available,
      BANKERS_SAFE.maximum,
      BANKERS_SAFE.allocation
    );
    expect(new Set(safeSequence).size).toBe(5);
  });

  it('unsafe state: insufficient resources → returns safe=false', () => {
    const { safe } = runBankers(
      [0, 0, 0],   // no resources available
      BANKERS_SAFE.maximum,
      BANKERS_SAFE.allocation
    );
    expect(safe).toBe(false);
  });

  it('need matrix is correctly computed', () => {
    const { need } = runBankers(
      BANKERS_SAFE.available,
      BANKERS_SAFE.maximum,
      BANKERS_SAFE.allocation
    );
    // P0: need = max - alloc = [7-0, 5-1, 3-0] = [7,4,3]
    expect(need[0]).toEqual([7, 4, 3]);
    // P1: [3-2, 2-0, 2-0] = [1,2,2]
    expect(need[1]).toEqual([1, 2, 2]);
  });
});

describe('Wait-For Graph Deadlock Detection', () => {
  it('cycle → deadlock detected', () => {
    // P0 → P1 → P2 → P0
    const edges = [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }];
    const { deadlocked, cycle } = detectDeadlock(3, edges);
    expect(deadlocked).toBe(true);
    expect(cycle.length).toBeGreaterThan(0);
  });

  it('no cycle → no deadlock', () => {
    // P0 → P1 → P2 (linear, no cycle)
    const edges = [{ from: 0, to: 1 }, { from: 1, to: 2 }];
    const { deadlocked } = detectDeadlock(3, edges);
    expect(deadlocked).toBe(false);
  });

  it('self-loop is a cycle', () => {
    const edges = [{ from: 0, to: 0 }];
    const { deadlocked } = detectDeadlock(1, edges);
    expect(deadlocked).toBe(true);
  });

  it('empty graph → no deadlock', () => {
    const { deadlocked } = detectDeadlock(5, []);
    expect(deadlocked).toBe(false);
  });
});
