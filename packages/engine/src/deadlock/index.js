/**
 * Deadlock Algorithms
 * 1. Banker's Algorithm (Safety + Request handling)
 * 2. Wait-For Graph cycle detection
 */

/**
 * Banker's Algorithm
 * @param {number[]} available
 * @param {number[][]} maximum
 * @param {number[][]} allocation
 * @returns {{ safe: boolean, safeSequence: number[], steps: object[], need: number[][] }}
 */
export function runBankers(available, maximum, allocation) {
  const n = allocation.length;        // number of processes
  const m = available.length;         // number of resource types

  // Compute need matrix
  const need = allocation.map((row, i) =>
    row.map((val, j) => maximum[i][j] - val)
  );

  const work = [...available];
  const finish = new Array(n).fill(false);
  const safeSequence = [];
  const steps = [];

  let found = true;
  while (found) {
    found = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i] && need[i].every((r, j) => r <= work[j])) {
        // Process i can proceed
        steps.push({
          action: 'ALLOCATE',
          pid: i,
          work: [...work],
          finish: [...finish],
          selected: i,
          note: `P${i} need [${need[i]}] ≤ work [${work}] — can execute`,
        });

        work.forEach((_, j) => (work[j] += allocation[i][j]));
        finish[i] = true;
        safeSequence.push(i);
        found = true;

        steps.push({
          action: 'RELEASE',
          pid: i,
          work: [...work],
          finish: [...finish],
          note: `P${i} releases resources, work becomes [${work}]`,
        });
      }
    }
  }

  const safe = finish.every(Boolean);

  // Identify deadlocked processes (those not finished)
  const deadlocked = finish
    .map((f, i) => (!f ? i : -1))
    .filter((i) => i !== -1);

  steps.push({
    action: safe ? 'SAFE' : 'UNSAFE',
    safeSequence: safe ? safeSequence : [],
    deadlocked,
    note: safe
      ? `System is in safe state. Safe sequence: P${safeSequence.join(' → P')}`
      : `Deadlock detected! Processes involved: P${deadlocked.join(', P')}`,
  });

  return { safe, safeSequence, steps, need, deadlocked };
}

/**
 * Simulate a resource request using Banker's Algorithm
 * Returns { granted, reason, newState }
 */
export function requestResource(available, maximum, allocation, pid, request) {
  const n = allocation.length;
  const m = available.length;
  const need = allocation.map((row, i) => row.map((v, j) => maximum[i][j] - v));

  // Step 1: request ≤ need?
  if (request.some((r, j) => r > need[pid][j])) {
    return { granted: false, reason: `Request exceeds maximum need for P${pid}` };
  }
  // Step 2: request ≤ available?
  if (request.some((r, j) => r > available[j])) {
    return { granted: false, reason: `Resources not available, P${pid} must wait` };
  }

  // Tentatively allocate
  const newAvailable = available.map((v, j) => v - request[j]);
  const newAllocation = allocation.map((row, i) =>
    i === pid ? row.map((v, j) => v + request[j]) : [...row]
  );
  const newMaximum = maximum.map((row) => [...row]);

  const { safe, safeSequence } = runBankers(newAvailable, newMaximum, newAllocation);

  if (safe) {
    return { granted: true, reason: `Request granted. New safe sequence: P${safeSequence.join(' → P')}`, newAvailable, newAllocation };
  } else {
    return { granted: false, reason: `Granting request would lead to unsafe state. P${pid} must wait.` };
  }
}

/**
 * Wait-For Graph Deadlock Detection
 * edges: Array<{ from: pid, to: pid }> (Pi waits for Pj)
 * Returns { deadlocked: boolean, cycle: number[] | null }
 */
export function detectDeadlock(processCount, edges) {
  // Build adjacency list
  const adj = Array.from({ length: processCount }, () => []);
  for (const { from, to } of edges) {
    if (from < processCount && to < processCount) adj[from].push(to);
  }

  const steps = [];
  const visited = new Array(processCount).fill(false);
  const recStack = new Array(processCount).fill(false);
  let cycle = null;

  function dfs(node, path) {
    visited[node] = true;
    recStack[node] = true;
    path.push(node);

    steps.push({ action: 'VISIT', node, path: [...path], recStack: [...recStack] });

    for (const neighbor of adj[node]) {
      if (!visited[neighbor]) {
        const result = dfs(neighbor, path);
        if (result) return result;
      } else if (recStack[neighbor]) {
        // Found cycle
        const cycleStart = path.indexOf(neighbor);
        return path.slice(cycleStart);
      }
    }

    path.pop();
    recStack[node] = false;
    steps.push({ action: 'BACKTRACK', node, path: [...path] });
    return null;
  }

  for (let i = 0; i < processCount; i++) {
    if (!visited[i]) {
      cycle = dfs(i, []);
      if (cycle) break;
    }
  }

  steps.push({
    action: cycle ? 'DEADLOCK_FOUND' : 'NO_DEADLOCK',
    cycle,
    note: cycle ? `Cycle found: P${cycle.join(' → P')} → P${cycle[0]}` : 'No cycle detected. System is deadlock-free.',
  });

  return { deadlocked: !!cycle, cycle, steps, adjacencyList: adj };
}
