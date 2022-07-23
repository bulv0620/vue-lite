
const fnQueue = [];
let isFlushing = false;
const resolvedPromise = Promise.resolve();
let curResolvedPromise = null;

export function nextTick(fn) {
    const p = curResolvedPromise || resolvedPromise;
    return fn ? p.then(fn) : p;
}

export function queueJob(fn) {
    if (!fnQueue.length || !fnQueue.includes(fn)) {
        fnQueue.push(fn);
        queueFlush();
    }
}

function queueFlush() {
    if (!isFlushing) {
        isFlushing = true;
        curResolvedPromise = resolvedPromise.then(flushJobs);
    }
}

function flushJobs() {
    try {
        for (let i = 0; i < fnQueue.length; i++) {
            const fn = fnQueue[i];
            return fn();
        }
    } finally {
        isFlushing = false;
        fnQueue.length = 0;
    }
}