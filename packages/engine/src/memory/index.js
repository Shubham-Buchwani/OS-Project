/**
 * Page Replacement Algorithms
 * Returns { steps, pageFaults, pageHits, hitRatio }
 */

/** FIFO Page Replacement */
export function runFIFO(frameCount, referenceString) {
  const frames = [];           // ordered: oldest first
  const steps = [];
  let pageFaults = 0, pageHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const framesCopy = [...frames];

    if (frames.includes(page)) {
      pageHits++;
      steps.push({ index: i, page, frames: framesCopy, hit: true, evictedPage: null, fault: false });
    } else {
      pageFaults++;
      let evicted = null;
      if (frames.length >= frameCount) evicted = frames.shift();
      frames.push(page);
      steps.push({ index: i, page, frames: [...frames], hit: false, evictedPage: evicted, fault: true });
    }
  }

  return { steps, pageFaults, pageHits, hitRatio: +(pageHits / referenceString.length).toFixed(4), faultRatio: +(pageFaults / referenceString.length).toFixed(4) };
}

/** LRU Page Replacement */
export function runLRU(frameCount, referenceString) {
  const frames = [];           // active frames
  const lastUsed = new Map();  // page → last used index
  const steps = [];
  let pageFaults = 0, pageHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];

    if (frames.includes(page)) {
      pageHits++;
      lastUsed.set(page, i);
      steps.push({ index: i, page, frames: [...frames], hit: true, evictedPage: null, fault: false });
    } else {
      pageFaults++;
      let evicted = null;
      if (frames.length >= frameCount) {
        // Evict LRU: frame with smallest lastUsed index
        let lruPage = null, lruTime = Infinity;
        for (const f of frames) {
          const t = lastUsed.get(f) ?? -1;
          if (t < lruTime) { lruTime = t; lruPage = f; }
        }
        evicted = lruPage;
        frames.splice(frames.indexOf(lruPage), 1);
      }
      frames.push(page);
      lastUsed.set(page, i);
      steps.push({ index: i, page, frames: [...frames], hit: false, evictedPage: evicted, fault: true });
    }
  }

  return { steps, pageFaults, pageHits, hitRatio: +(pageHits / referenceString.length).toFixed(4), faultRatio: +(pageFaults / referenceString.length).toFixed(4) };
}

/** Optimal Page Replacement */
export function runOptimal(frameCount, referenceString) {
  const frames = [];
  const steps = [];
  let pageFaults = 0, pageHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];

    if (frames.includes(page)) {
      pageHits++;
      steps.push({ index: i, page, frames: [...frames], hit: true, evictedPage: null, fault: false });
    } else {
      pageFaults++;
      let evicted = null;
      if (frames.length >= frameCount) {
        // Find page used furthest in future (or never used again)
        let farthest = -1, victimPage = null;
        for (const f of frames) {
          const nextUse = referenceString.indexOf(f, i + 1);
          const dist = nextUse === -1 ? Infinity : nextUse;
          if (dist > farthest) { farthest = dist; victimPage = f; }
        }
        evicted = victimPage;
        frames.splice(frames.indexOf(victimPage), 1);
      }
      frames.push(page);
      steps.push({ index: i, page, frames: [...frames], hit: false, evictedPage: evicted, fault: true });
    }
  }

  return { steps, pageFaults, pageHits, hitRatio: +(pageHits / referenceString.length).toFixed(4), faultRatio: +(pageFaults / referenceString.length).toFixed(4) };
}

/** Clock (Second Chance) Page Replacement */
export function runClock(frameCount, referenceString) {
  const frames = new Array(frameCount).fill(null).map(() => ({ page: null, ref: 0 }));
  let pointer = 0;
  const steps = [];
  let pageFaults = 0, pageHits = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const frameIdx = frames.findIndex((f) => f.page === page);

    if (frameIdx !== -1) {
      pageHits++;
      frames[frameIdx].ref = 1;
      steps.push({ index: i, page, frames: frames.map((f) => ({ ...f })), hit: true, evictedPage: null, fault: false, pointer });
    } else {
      pageFaults++;
      let evicted = null;
      // Find victim using clock hand
      while (frames[pointer].ref === 1) {
        frames[pointer].ref = 0;
        pointer = (pointer + 1) % frameCount;
      }
      evicted = frames[pointer].page;
      frames[pointer] = { page, ref: 1 };
      pointer = (pointer + 1) % frameCount;
      steps.push({ index: i, page, frames: frames.map((f) => ({ ...f })), hit: false, evictedPage: evicted, fault: true, pointer });
    }
  }

  return { steps, pageFaults, pageHits, hitRatio: +(pageHits / referenceString.length).toFixed(4), faultRatio: +(pageFaults / referenceString.length).toFixed(4) };
}
