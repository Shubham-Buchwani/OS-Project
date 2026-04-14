/**
 * File System Engine
 * 1. Disk Block Allocation (Contiguous, Linked, Indexed)
 * 2. Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK)
 */

// ─────────────────────────────────────────────────────────────────────────────
//  DISK SCHEDULING
// ─────────────────────────────────────────────────────────────────────────────

export function runDiskFCFS(initialHead, requests) {
  const steps = [];
  let head = initialHead;
  let totalSeek = 0;
  const seekSequence = [head];

  for (const req of requests) {
    const seek = Math.abs(req - head);
    totalSeek += seek;
    head = req;
    seekSequence.push(head);
    steps.push({ from: seekSequence[seekSequence.length - 2], to: head, seek, totalSeek, pendingRequests: requests.slice(requests.indexOf(req) + 1) });
  }

  return { steps, seekSequence, totalSeek, avgSeek: +(totalSeek / requests.length).toFixed(2) };
}

export function runDiskSSTF(initialHead, requests) {
  const steps = [];
  let head = initialHead;
  let totalSeek = 0;
  const seekSequence = [head];
  const pending = [...requests];

  while (pending.length > 0) {
    pending.sort((a, b) => Math.abs(a - head) - Math.abs(b - head));
    const next = pending.shift();
    const seek = Math.abs(next - head);
    totalSeek += seek;
    head = next;
    seekSequence.push(head);
    steps.push({ from: seekSequence[seekSequence.length - 2], to: head, seek, totalSeek, pendingRequests: [...pending] });
  }

  return { steps, seekSequence, totalSeek, avgSeek: +(totalSeek / requests.length).toFixed(2) };
}

export function runDiskSCAN(initialHead, requests, direction = 'up', diskSize = 200) {
  const steps = [];
  let head = initialHead;
  let totalSeek = 0;
  const seekSequence = [head];
  let dir = direction; // 'up' | 'down'

  const sorted = [...new Set(requests)].sort((a, b) => a - b);
  const lower = sorted.filter((r) => r < head).reverse();
  const upper = sorted.filter((r) => r >= head);

  const sequence = dir === 'up'
    ? [...upper, diskSize - 1, ...lower]
    : [...lower, 0, ...upper];

  for (const next of sequence) {
    if (!requests.includes(next) && next !== diskSize - 1 && next !== 0) continue;
    const seek = Math.abs(next - head);
    totalSeek += seek;
    const prev = head;
    head = next;
    seekSequence.push(head);
    steps.push({ from: prev, to: head, seek, totalSeek, note: requests.includes(next) ? `Service ${next}` : `Boundary at ${next}` });
  }

  return { steps, seekSequence, totalSeek, avgSeek: +(totalSeek / requests.length).toFixed(2) };
}

export function runDiskCSCAN(initialHead, requests, diskSize = 200) {
  const steps = [];
  let head = initialHead;
  let totalSeek = 0;
  const seekSequence = [head];

  const sorted = [...new Set(requests)].sort((a, b) => a - b);
  const upper = sorted.filter((r) => r >= head);
  const lower = sorted.filter((r) => r < head);
  const sequence = [...upper, diskSize - 1, 0, ...lower];

  for (const next of sequence) {
    const seek = Math.abs(next - head);
    totalSeek += seek;
    const prev = head;
    head = next;
    seekSequence.push(head);
    steps.push({ from: prev, to: head, seek, totalSeek, note: requests.includes(next) ? `Service ${next}` : (next === diskSize - 1 ? `Go to end (${diskSize - 1})` : `Jump to start (0)`) });
  }

  return { steps, seekSequence, totalSeek, avgSeek: +(totalSeek / requests.length).toFixed(2) };
}

export function runDiskLOOK(initialHead, requests, direction = 'up') {
  const steps = [];
  let head = initialHead;
  let totalSeek = 0;
  const seekSequence = [head];

  const sorted = [...new Set(requests)].sort((a, b) => a - b);
  const lower = sorted.filter((r) => r < head).reverse();
  const upper = sorted.filter((r) => r >= head);
  const sequence = direction === 'up' ? [...upper, ...lower] : [...lower, ...upper];

  for (const next of sequence) {
    const seek = Math.abs(next - head);
    totalSeek += seek;
    const prev = head;
    head = next;
    seekSequence.push(head);
    steps.push({ from: prev, to: head, seek, totalSeek });
  }

  return { steps, seekSequence, totalSeek, avgSeek: +(totalSeek / requests.length).toFixed(2) };
}

// ─────────────────────────────────────────────────────────────────────────────
//  BLOCK ALLOCATION
// ─────────────────────────────────────────────────────────────────────────────

export function runBlockAllocation(diskBlocks, blockSize, method, operations) {
  const bitmap = new Array(diskBlocks).fill(false); // false = free, true = used
  const fileTable = new Map();                       // fileName → { blocks[] }
  const steps = [];

  function findFreeBlocks(count) {
    const freeBlocks = [];
    for (let i = 0; i < bitmap.length && freeBlocks.length < count; i++) {
      if (!bitmap[i]) freeBlocks.push(i);
    }
    return freeBlocks.length === count ? freeBlocks : null;
  }

  function findContiguousFreeBlocks(count) {
    let start = -1, run = 0;
    for (let i = 0; i < bitmap.length; i++) {
      if (!bitmap[i]) {
        if (run === 0) start = i;
        run++;
        if (run === count) return Array.from({ length: count }, (_, k) => start + k);
      } else {
        run = 0; start = -1;
      }
    }
    return null;
  }

  for (const op of operations) {
    if (op.type === 'create') {
      const blocksNeeded = Math.ceil(op.size / blockSize);
      let allocated = null;
      let indexBlock = null;

      if (method === 'contiguous') {
        allocated = findContiguousFreeBlocks(blocksNeeded);
        if (!allocated) { steps.push({ op, success: false, error: 'Not enough contiguous space', bitmap: [...bitmap], fileTable: Object.fromEntries(fileTable) }); continue; }
      } else if (method === 'linked' || method === 'indexed') {
        allocated = findFreeBlocks(blocksNeeded + (method === 'indexed' ? 1 : 0));
        if (!allocated) { steps.push({ op, success: false, error: 'Not enough free blocks', bitmap: [...bitmap], fileTable: Object.fromEntries(fileTable) }); continue; }
        if (method === 'indexed') { indexBlock = allocated.shift(); }
      }

      allocated.forEach((b) => (bitmap[b] = true));
      if (indexBlock !== null) bitmap[indexBlock] = true;
      fileTable.set(op.fileName, { blocks: allocated, indexBlock, size: op.size, method });
      steps.push({ op, success: true, allocatedBlocks: allocated, indexBlock, bitmap: [...bitmap], fileTable: Object.fromEntries([...fileTable].map(([k, v]) => [k, { ...v }])) });

    } else if (op.type === 'delete') {
      const file = fileTable.get(op.fileName);
      if (!file) { steps.push({ op, success: false, error: `File "${op.fileName}" not found`, bitmap: [...bitmap], fileTable: Object.fromEntries(fileTable) }); continue; }
      file.blocks.forEach((b) => (bitmap[b] = false));
      if (file.indexBlock !== null && file.indexBlock !== undefined) bitmap[file.indexBlock] = false;
      fileTable.delete(op.fileName);
      steps.push({ op, success: true, freedBlocks: file.blocks, bitmap: [...bitmap], fileTable: Object.fromEntries([...fileTable].map(([k, v]) => [k, { ...v }])) });

    } else if (op.type === 'read') {
      const file = fileTable.get(op.fileName);
      if (!file) { steps.push({ op, success: false, error: `File "${op.fileName}" not found`, bitmap: [...bitmap], fileTable: Object.fromEntries(fileTable) }); continue; }
      steps.push({ op, success: true, accessedBlocks: file.blocks, bitmap: [...bitmap], fileTable: Object.fromEntries([...fileTable].map(([k, v]) => [k, { ...v }])) });
    }
  }

  const freeBlocks = bitmap.filter((b) => !b).length;
  const usedBlocks = bitmap.filter((b) => b).length;
  const fragmentation = method === 'contiguous' ? +(freeBlocks / diskBlocks * 100).toFixed(2) : 0;

  return { steps, finalBitmap: [...bitmap], fileTable: Object.fromEntries([...fileTable].map(([k, v]) => [k, { ...v }])), metrics: { totalBlocks: diskBlocks, usedBlocks, freeBlocks, fragmentation } };
}
