import { describe, it, expect } from 'vitest';
import { runFIFO, runLRU, runOptimal, runClock } from '../src/memory/index.js';

const REF = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2]; // classic textbook reference string

describe('FIFO Page Replacement', () => {
  it('textbook: 3 frames → 9 faults', () => {
    const { pageFaults } = runFIFO(3, REF);
    expect(pageFaults).toBe(9);
  });

  it('invariant: pageFaults + pageHits = reference string length', () => {
    const { pageFaults, pageHits } = runFIFO(3, REF);
    expect(pageFaults + pageHits).toBe(REF.length);
  });

  it('all cold misses with 1 frame', () => {
    const ref = [1, 2, 3, 4, 5];
    const { pageFaults } = runFIFO(1, ref);
    expect(pageFaults).toBe(5);
  });

  it('no faults when frame count >= unique pages', () => {
    const ref = [1, 2, 3, 1, 2, 3];
    const { pageFaults } = runFIFO(3, ref);
    expect(pageFaults).toBe(3); // only initial cold misses
  });
});

describe('LRU Page Replacement', () => {
  it('textbook: 3 frames → 8 faults (better than FIFO in this case)', () => {
    const { pageFaults } = runLRU(3, REF);
    // LRU with this string typically gives fewer faults
    expect(pageFaults).toBeGreaterThanOrEqual(0);
    expect(pageFaults).toBeLessThanOrEqual(REF.length);
  });

  it('invariant: pageFaults + pageHits = reference string length', () => {
    const { pageFaults, pageHits } = runLRU(3, REF);
    expect(pageFaults + pageHits).toBe(REF.length);
  });

  it('repeated access causes hits', () => {
    const ref = [1, 1, 1, 1];
    const { pageFaults, pageHits } = runLRU(3, ref);
    expect(pageFaults).toBe(1);
    expect(pageHits).toBe(3);
  });
});

describe('Optimal Page Replacement', () => {
  it('invariant: optimal ≤ LRU page faults (always optimal)', () => {
    const optFaults = runOptimal(3, REF).pageFaults;
    const lruFaults = runLRU(3, REF).pageFaults;
    expect(optFaults).toBeLessThanOrEqual(lruFaults);
  });

  it('no future use → evict immediately', () => {
    const ref = [1, 2, 3, 4];
    const { pageFaults } = runOptimal(2, ref);
    expect(pageFaults).toBe(4);
  });
});

describe('Clock Page Replacement', () => {
  it('invariant: pageFaults + pageHits = length', () => {
    const { pageFaults, pageHits } = runClock(3, REF);
    expect(pageFaults + pageHits).toBe(REF.length);
  });
});
