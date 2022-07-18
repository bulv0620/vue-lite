export function isObject(target){
    return typeof target === 'object' && target !== null;
}

export function hasChanged(oldVal, val){
    return oldVal !== val && !(Number.isNaN(oldVal) && Number.isNaN(val));
}

export function isArray(target){
    return Array.isArray(target);
}

export function isFunction(target){
    return typeof target === 'function';
}