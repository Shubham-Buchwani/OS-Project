/**
 * Narrative Utilities for OS Simulations
 * Transforms technical state changes into layman-friendly educational explanations.
 */

// ─── Scheduling Narratives ───────────────────────────────────────────────────

export function getSchedulingNarrative(step, algorithm, config) {
  const { event, tick, currentProcess, readyQueue, completedProcesses } = step;
  const pid = currentProcess?.pid;

  switch (event) {
    case 'PROCESS_COMPLETED':
      return {
        title: `Process ${pid} is Finished!`,
        explanation: `Process ${pid} has completed all its work. It has now left the CPU building. The system is calculating how long it stayed—the less time it took, the more efficient our scheduler is!`,
        tip: "Think of this like a customer finishing their checkout at a grocery store and leaving."
      };
    
    case 'CONTEXT_SWITCH':
      return {
        title: "Time for a Switch!",
        explanation: `Process ${pid} has been working for a while, but it's time to let someone else have a turn. The CPU is 'pausing' Process ${pid} and saving its spot so it can resume later.`,
        tip: "This is what makes your computer feel like it's doing many things at once (Multitasking)."
      };

    case 'TICK':
      if (pid !== undefined) {
        return {
          title: "The CPU is Working",
          explanation: `Process ${pid} is currently inside the CPU 'Kitchen', getting its work done. Other processes, like ${readyQueue.map(p => 'P'+p.pid).join(', ')}, are waiting in the 'Queue' for their turn.`,
          tip: "A CPU can usually only do one thing at a very high speed! We switch fast to make it look simultaneous."
        };
      }
      return {
        title: "CPU Waiting",
        explanation: "The CPU is currently idle because no tasks have arrived yet. It's like a chef waiting for a customer to enter the restaurant.",
        tip: "Idle time is wasted time for a computer. We always want to keep the CPU busy!"
      };

    default:
      return { title: "Steady State", explanation: "The simulation is progressing according to the rules of the algorithm.", tip: "" };
  }
}

// ─── Memory Narratives ───────────────────────────────────────────────────────

export function getMemoryNarrative(step, algorithm, frameCount) {
  const { page, hit, fault, evictedPage, frames } = step;

  if (hit) {
    return {
      title: "It's a Page Hit! 🎉",
      explanation: `The computer needed Page ${page}, and luckily, it was already sitting in one of our ${frameCount} memory slots! No extra work needed.`,
      tip: "Page Hits are great because accessing RAM is thousands of times faster than accessing the hard disk."
    };
  }

  if (fault) {
    if (evictedPage === null) {
      return {
        title: "Bringing Page In",
        explanation: `The computer needed Page ${page}, but it wasn't in memory. Since we have an empty slot, we just fetched it from the disk and placed it there.`,
        tip: "This is called a 'Cold Start' or 'Compulsory Fault'—you have to load it at least once!"
      };
    } else {
      return {
        title: "Memory is Full - Swap Time!",
        explanation: `Memory is full! To bring in Page ${page}, we had to kick out Page ${evictedPage}. We chose Page ${evictedPage} because the ${algorithm.toUpperCase()} rule said it was the best candidate to remove.`,
        tip: `The goal of ${algorithm.toUpperCase()} is to guess which page we won't need for the longest time.`
      };
    }
  }

  return null;
}

// ─── Deadlock Narratives ─────────────────────────────────────────────────────

export function getDeadlockNarrative(step, mode) {
  const { action, pid, note, safeSequence, deadlocked } = step;

  switch (action) {
    case 'ALLOCATE':
      return {
        title: "Checking for Safety",
        explanation: `The system is checking if it's 'safe' to let Process ${pid} finish. It looks like Process ${pid} only needs resources that we currently have available.`,
        tip: "In the Banker's algorithm, we are like a bank manager making sure we never run out of cash."
      };
    case 'RELEASE':
      return {
        title: "Releasing Resources",
        explanation: `Process ${pid} has finished its 'hypothetical' run and returned all its resources to the system. Now the system has even more resources to help other processes!`,
        tip: "Releasing resources is the key to preventing deadlocks."
      };
    case 'SAFE':
      return {
        title: "System is SAFE ✅",
        explanation: `Success! We found a sequence (${safeSequence?.join(' → ')}) that allows every single process to finish without getting stuck.`,
        tip: "A safe state means a deadlock is impossible right now."
      };
    case 'UNSAFE':
      return {
        title: "DANGER: Unsafe State ⚠️",
        explanation: "We couldn't find a way to finish all processes. While not stuck yet, we might get into a deadlock if we're not careful!",
        tip: "Being in an unsafe state is like driving toward a dead-end street with no way to turn around."
      };
    case 'DEADLOCK_FOUND':
      return {
        title: "DEADLOCK! 🛑",
        explanation: `A cycle was found involving Processes: ${deadlocked?.join(', ')}. They are all waiting for each other, and nobody can move.`,
        tip: "This is like four cars arriving at a 4-way stop at the exact same time and everyone refusing to go first."
      };
    case 'VISIT':
      return {
        title: "Searching for Cycles",
        explanation: `The detective (Algorithm) is looking at Process ${step.node} to see what it's waiting for. We're tracing the 'Wait-For' lines.`,
        tip: "A loop in this graph means a deadlock is happening."
      };
    default:
      return note ? { title: "Simulation Step", explanation: note, tip: "" } : null;
  }
}

// ─── Filesystem Narratives ──────────────────────────────────────────────────

export function getFilesystemNarrative(step, mode) {
  // Disk Scheduling
  if (step.from !== undefined && step.to !== undefined) {
    return {
      title: step.note ? step.note : "Moving Disk Head",
      explanation: `The disk head is physically moving from track ${step.from} to track ${step.to}. This mechanical movement is the 'heavy lifting' of data retrieval!`,
      tip: "Minimizing this movement (reducing 'Seek Time') is why we need clever scheduling algorithms."
    };
  }
  
  // Block Allocation
  if (step.op) {
    const { type, fileName, size } = step.op;
    if (type === 'create') {
      return {
        title: `Creating File: ${fileName}`,
        explanation: step.success 
          ? `We successfully carved out some space on the disk for '${fileName}'. We found ${step.allocatedBlocks.join(', ')} free spots and marked them as 'taken'.`
          : `Uh oh! We couldn't create '${fileName}' because of an error: ${step.error}.`,
        tip: "Creating a file is like finding enough contiguous (or linked) locker space for all your books."
      };
    }
    if (type === 'delete') {
      return {
        title: `Deleting File: ${fileName}`,
        explanation: `We've removed the entry for '${fileName}' and marked its old blocks (${step.freedBlocks.join(', ')}) as free. Other files can now use this space!`,
        tip: "Deleting didn't actually 'wipe' the tracks—it just marked the spots as 'available' for rent again."
      };
    }
    if (type === 'read') {
      return {
        title: `Reading File: ${fileName}`,
        explanation: `The system is navigating to blocks ${step.accessedBlocks.join(', ')} to read the data for '${fileName}'.`,
        tip: "Reading is usually faster than writing because we don't need to find new empty spots."
      };
    }
  }

  return {
    title: "Disk Operation",
    explanation: step.note || "Managing data storage on the physical disk surface.",
    tip: ""
  };
}

/**
 * Master function to resolve narrative based on module
 */
export function getStepNarrative(step, module, algorithm, config) {
  if (!step) return null;
  
  switch (module) {
    case 'scheduling': return getSchedulingNarrative(step, algorithm, config);
    case 'memory':     return getMemoryNarrative(step, algorithm, config?.frameCount);
    case 'deadlock':   return getDeadlockNarrative(step, module); // Actually mode in deadlock
    case 'filesystem': return getFilesystemNarrative(step, module);
    default: return null;
  }
}
