export function isObject(target) {
    return typeof target === 'object' && target !== null;
}

export function hasChanged(oldVal, val) {
    return oldVal !== val && !(Number.isNaN(oldVal) && Number.isNaN(val));
}

export function isArray(target) {
    return Array.isArray(target);
}

export function isFunction(target) {
    return typeof target === 'function';
}

export function isString(value) {
    return typeof value === 'string';
}

export function isNumber(value) {
    return typeof value === 'number';
}

export function isBoolean(value) {
    return typeof value === 'boolean';
}

export function camelize(str) {
    return str.replace(/-(\w)g/, (_, c) => (c ? c.toUpperCase() : ''));
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase()
        + str.slice(1)
}