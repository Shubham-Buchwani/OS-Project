/**
 * FCFS — First Come First Served (non-preemptive)
 */
export function runFCFS(processes) {
  const procs = processes
    .map((p) => ({ ...p, remainingBurst: p.burstTime }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid);

  const steps = [];
  const ganttChart = [];
  const completed = [];
  let clock = 0;
  let idx = 0;

  while (completed.length < procs.length) {
    // Advance clock to next arrival if CPU is idle
    if (idx < procs.length && clock < procs[idx].arrivalTime) {
      clock = procs[idx].arrivalTime;
    }

    const proc = procs[idx];
    const start = clock;
    clock += proc.burstTime;

    ganttChart.push({ pid: proc.pid, start, end: clock });

    const completionTime = clock;
    const turnaroundTime = completionTime - proc.arrivalTime;
    const waitingTime = turnaroundTime - proc.burstTime;
    const responseTime = start - proc.arrivalTime;

    completed.push({ ...proc, completionTime, turnaroundTime, waitingTime, responseTime });

    steps.push({
      tick: clock,
      currentProcess: { pid: proc.pid, remainingBurst: 0 },
      readyQueue: procs.slice(idx + 1).filter((p) => p.arrivalTime <= clock).map((p) => ({ pid: p.pid, remainingBurst: p.burstTime })),
      ganttEntry: { pid: proc.pid, start, end: clock },
      completedProcesses: [...completed],
      event: 'PROCESS_COMPLETED',
    });

    idx++;
  }

  return { steps, ganttChart, completedProcesses: completed };
}

/**
 * SJF — Shortest Job First (non-preemptive & preemptive / SRTF)
 */
export function runSJF(processes, preemptive = false) {
  if (!preemptive) return runSJF_NonPreemptive(processes);
  return runSRTF(processes);
}

function runSJF_NonPreemptive(processes) {
  const procs = processes.map((p) => ({ ...p, remainingBurst: p.burstTime, started: false, done: false }));
  const steps = [];
  const ganttChart = [];
  const completed = [];
  let clock = 0;

  while (completed.length < procs.length) {
    const available = procs.filter((p) => !p.done && p.arrivalTime <= clock);
    if (available.length === 0) {
      clock = Math.min(...procs.filter((p) => !p.done).map((p) => p.arrivalTime));
      continue;
    }

    available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const proc = available[0];
    const start = clock;
    clock += proc.burstTime;
    proc.done = true;

    const completionTime = clock;
    const turnaroundTime = completionTime - proc.arrivalTime;
    const waitingTime = turnaroundTime - proc.burstTime;
    const responseTime = start - proc.arrivalTime;

    ganttChart.push({ pid: proc.pid, start, end: clock });
    const entry = { ...proc, completionTime, turnaroundTime, waitingTime, responseTime };
    completed.push(entry);

    steps.push({
      tick: clock,
      currentProcess: { pid: proc.pid, remainingBurst: 0 },
      readyQueue: procs.filter((p) => !p.done && p.pid !== proc.pid && p.arrivalTime <= clock).map((p) => ({ pid: p.pid, remainingBurst: p.remainingBurst })),
      ganttEntry: { pid: proc.pid, start, end: clock },
      completedProcesses: [...completed],
      event: 'PROCESS_COMPLETED',
    });
  }

  return { steps, ganttChart, completedProcesses: completed };
}

function runSRTF(processes) {
  const procs = processes.map((p) => ({
    ...p,
    remainingBurst: p.burstTime,
    startTime: -1,
    done: false,
  }));
  const steps = [];
  const ganttChart = [];
  const completed = [];
  let clock = 0;
  let lastPid = null;
  let segStart = 0;
  const maxTime = processes.reduce((s, p) => s + p.burstTime, 0) + Math.max(...processes.map((p) => p.arrivalTime));

  while (completed.length < procs.length && clock <= maxTime) {
    const available = procs.filter((p) => !p.done && p.arrivalTime <= clock);
    if (available.length === 0) { clock++; continue; }

    available.sort((a, b) => a.remainingBurst - b.remainingBurst || a.arrivalTime - b.arrivalTime);
    const proc = available[0];

    if (proc.startTime === -1) proc.startTime = clock;

    if (lastPid !== proc.pid) {
      if (lastPid !== null) ganttChart.push({ pid: lastPid, start: segStart, end: clock });
      segStart = clock;
      lastPid = proc.pid;
    }

    proc.remainingBurst--;
    clock++;

    if (proc.remainingBurst === 0) {
      proc.done = true;
      ganttChart.push({ pid: proc.pid, start: segStart, end: clock });
      lastPid = null;
      const completionTime = clock;
      const turnaroundTime = completionTime - proc.arrivalTime;
      const waitingTime = turnaroundTime - proc.burstTime;
      const responseTime = proc.startTime - proc.arrivalTime;
      const entry = { ...proc, completionTime, turnaroundTime, waitingTime, responseTime };
      completed.push(entry);

      steps.push({
        tick: clock,
        currentProcess: { pid: proc.pid, remainingBurst: 0 },
        readyQueue: procs.filter((p) => !p.done && p.pid !== proc.pid && p.arrivalTime <= clock).map((p) => ({ pid: p.pid, remainingBurst: p.remainingBurst })),
        ganttEntry: ganttChart[ganttChart.length - 1],
        completedProcesses: [...completed],
        event: 'PROCESS_COMPLETED',
      });
    } else {
      steps.push({
        tick: clock,
        currentProcess: { pid: proc.pid, remainingBurst: proc.remainingBurst },
        readyQueue: available.filter((p) => p.pid !== proc.pid).map((p) => ({ pid: p.pid, remainingBurst: p.remainingBurst })),
        ganttEntry: { pid: proc.pid, start: segStart, end: clock },
        completedProcesses: [...completed],
        event: 'TICK',
      });
    }
  }

  return { steps, ganttChart, completedProcesses: completed };
}

/**
 * Round Robin
 */
export function runRoundRobin(processes, timeQuantum) {
  const procs = processes.map((p) => ({
    ...p,
    remainingBurst: p.burstTime,
    startTime: -1,
    done: false,
  }));
  const steps = [];
  const ganttChart = [];
  const completed = [];
  const queue = [];
  let clock = 0;
  const enqueued = new Set();

  // Enqueue those arriving at t=0
  procs.filter((p) => p.arrivalTime === 0).sort((a, b) => a.pid - b.pid).forEach((p) => { queue.push(p); enqueued.add(p.pid); });

  while (completed.length < procs.length) {
    if (queue.length === 0) {
      const nextArrival = procs.filter((p) => !p.done && !enqueued.has(p.pid)).sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      if (!nextArrival) break;
      clock = nextArrival.arrivalTime;
      procs.filter((p) => p.arrivalTime <= clock && !p.done && !enqueued.has(p.pid)).sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid).forEach((p) => { queue.push(p); enqueued.add(p.pid); });
    }

    const proc = queue.shift();
    if (!proc) break;
    if (proc.startTime === -1) proc.startTime = clock;

    const execTime = Math.min(timeQuantum, proc.remainingBurst);
    const start = clock;
    clock += execTime;
    proc.remainingBurst -= execTime;

    ganttChart.push({ pid: proc.pid, start, end: clock });

    // Enqueue new arrivals during this quantum
    procs.filter((p) => p.arrivalTime > start && p.arrivalTime <= clock && !p.done && !enqueued.has(p.pid)).sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid - b.pid).forEach((p) => { queue.push(p); enqueued.add(p.pid); });

    if (proc.remainingBurst === 0) {
      proc.done = true;
      const completionTime = clock;
      const turnaroundTime = completionTime - proc.arrivalTime;
      const waitingTime = turnaroundTime - proc.burstTime;
      const responseTime = proc.startTime - proc.arrivalTime;
      completed.push({ ...proc, completionTime, turnaroundTime, waitingTime, responseTime });
      steps.push({ tick: clock, currentProcess: { pid: proc.pid, remainingBurst: 0 }, readyQueue: queue.map((p) => ({ pid: p.pid, remainingBurst: p.remainingBurst })), ganttEntry: ganttChart[ganttChart.length - 1], completedProcesses: [...completed], event: 'PROCESS_COMPLETED' });
    } else {
      queue.push(proc);
      steps.push({ tick: clock, currentProcess: { pid: proc.pid, remainingBurst: proc.remainingBurst }, readyQueue: queue.map((p) => ({ pid: p.pid, remainingBurst: p.remainingBurst })), ganttEntry: ganttChart[ganttChart.length - 1], completedProcesses: [...completed], event: 'CONTEXT_SWITCH' });
    }
  }

  return { steps, ganttChart, completedProcesses: completed };
}

/**
 * Priority Scheduling (non-preemptive & preemptive)
 * Lower priority number = higher priority
 */
export function runPriority(processes, preemptive = false) {
  if (!preemptive) {
    const procs = processes.map((p) => ({ ...p, remainingBurst: p.burstTime, done: false }));
    const steps = [];
    const ganttChart = [];
    const completed = [];
    let clock = 0;

    while (completed.length < procs.length) {
      const available = procs.filter((p) => !p.done && p.arrivalTime <= clock);
      if (available.length === 0) { clock = Math.min(...procs.filter((p) => !p.done).map((p) => p.arrivalTime)); continue; }
      available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
      const proc = available[0];
      const start = clock;
      clock += proc.burstTime;
      proc.done = true;
      ganttChart.push({ pid: proc.pid, start, end: clock });
      const ct = clock, tt = ct - proc.arrivalTime, wt = tt - proc.burstTime, rt = start - proc.arrivalTime;
      completed.push({ ...proc, completionTime: ct, turnaroundTime: tt, waitingTime: wt, responseTime: rt });
      steps.push({ tick: clock, currentProcess: { pid: proc.pid, remainingBurst: 0 }, readyQueue: procs.filter((p) => !p.done && p.pid !== proc.pid && p.arrivalTime <= clock).map((p) => ({ pid: p.pid, remainingBurst: p.remainingBurst })), ganttEntry: ganttChart[ganttChart.length - 1], completedProcesses: [...completed], event: 'PROCESS_COMPLETED' });
    }
    return { steps, ganttChart, completedProcesses: completed };
  }

  // Preemptive priority (priority remains static, switch when higher priority arrives)
  const procs = processes.map((p) => ({ ...p, remainingBurst: p.burstTime, startTime: -1, done: false }));
  const steps = [], ganttChart = [], completed = [];
  let clock = 0, lastPid = null, segStart = 0;
  const maxTime = processes.reduce((s, p) => s + p.burstTime, 0) + Math.max(...processes.map((p) => p.arrivalTime)) + 1;

  while (completed.length < procs.length && clock < maxTime) {
    const available = procs.filter((p) => !p.done && p.arrivalTime <= clock);
    if (available.length === 0) { clock++; continue; }
    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const proc = available[0];
    if (proc.startTime === -1) proc.startTime = clock;
    if (lastPid !== proc.pid) {
      if (lastPid !== null) ganttChart.push({ pid: lastPid, start: segStart, end: clock });
      segStart = clock; lastPid = proc.pid;
    }
    proc.remainingBurst--; clock++;
    if (proc.remainingBurst === 0) {
      proc.done = true;
      ganttChart.push({ pid: proc.pid, start: segStart, end: clock }); lastPid = null;
      const ct = clock, tt = ct - proc.arrivalTime, wt = tt - proc.burstTime, rt = proc.startTime - proc.arrivalTime;
      completed.push({ ...proc, completionTime: ct, turnaroundTime: tt, waitingTime: wt, responseTime: rt });
      steps.push({ tick: clock, currentProcess: { pid: proc.pid, remainingBurst: 0 }, readyQueue: procs.filter((p) => !p.done && p.arrivalTime <= clock).map((p) => ({ pid: p.pid, remainingBurst: p.remainingBurst })), ganttEntry: ganttChart[ganttChart.length - 1], completedProcesses: [...completed], event: 'PROCESS_COMPLETED' });
    }
  }
  return { steps, ganttChart, completedProcesses: completed };
}

/**
 * Compute aggregate metrics from completed processes
 */
export function computeSchedulingMetrics(completedProcesses, totalTime, contextSwitches = 0) {
  const n = completedProcesses.length;
  if (n === 0) return {};
  const avgWaitingTime = completedProcesses.reduce((s, p) => s + p.waitingTime, 0) / n;
  const avgTurnaroundTime = completedProcesses.reduce((s, p) => s + p.turnaroundTime, 0) / n;
  const avgResponseTime = completedProcesses.reduce((s, p) => s + p.responseTime, 0) / n;
  const totalBurst = completedProcesses.reduce((s, p) => s + p.burstTime, 0);
  const cpuUtilization = totalTime > 0 ? (totalBurst / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? n / totalTime : 0;
  return { avgWaitingTime: +avgWaitingTime.toFixed(2), avgTurnaroundTime: +avgTurnaroundTime.toFixed(2), avgResponseTime: +avgResponseTime.toFixed(2), cpuUtilization: +cpuUtilization.toFixed(2), throughput: +throughput.toFixed(4), contextSwitches, processCount: n, totalTime };
}
