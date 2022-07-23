const effectFnStack = [];
let activeEffectFn = null;

export function effect(fn, options = {}) {
    const effectFn = () => {
        try {
            effectFnStack.push(effectFn);
            activeEffectFn = effectFn;
            return fn()
        } finally {
            effectFnStack.pop();
            activeEffectFn = effectFnStack[effectFnStack.length - 1];
        }
    }

    if (!options.lazy) {
        effectFn();
    }

    effectFn.scheduler = options.scheduler;

    return effectFn;
}

// effectFn 存储
const effectMap = new WeakMap();

// effect 捕获器
export function track(target, property) {

    if (!activeEffectFn) {
        return
    }

    let depsMap = effectMap.get(target);
    if (!depsMap) {
        effectMap.set(target, (depsMap = new Map()));
    }

    let deps = depsMap.get(property);
    if (!deps) {
        depsMap.set(property, (deps = new Set()));
    }

    deps.add(activeEffectFn);
}

// effect 触发器
export function trigger(target, property) {
    const depsMap = effectMap.get(target);
    if (!depsMap) return;

    const deps = depsMap.get(property);
    if (!deps) return;

    deps.forEach(effectFn => {
        if (effectFn.scheduler) {
            effectFn.scheduler(effectFn);
        }
        else {
            effectFn()
        }
    })
}