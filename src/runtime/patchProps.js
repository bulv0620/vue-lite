import { isBoolean } from "../utils";

export function patchProps(p1, p2, container) {
    if (p1 === p2) {
        return;
    }

    p1 = p1 || {};
    p2 = p2 || {};
    for (const key in p2) {
        if (key === 'key') {
            continue;
        }
        const newVal = p2[key];
        const oldVal = p1[key];
        if (newVal !== oldVal) {
            patchDomProp(oldVal, newVal, key, container);
        }
    }
    for (const key in p1) {
        if (key === 'key') {
            continue;
        }
        if (!p2[key]) {
            p2.el.removeAttribute(key);
        }
    }
}

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted|disabled)$/;
function patchDomProp(oldVal, newVal, key, el) {
    switch (key) {
        case 'class':
            el.className = newVal || '';
            break;
        case 'style':
            if (!newVal) {
                el.removeAttribute('style');
            }
            else {
                for (const styleName in newVal) {
                    el.style[styleName] = newVal[styleName];
                }
                for (const styleName in oldVal) {
                    if (!newVal[styleName]) {
                        el.style[styleName] = '';
                    }
                }
            }
            break;
        default:
            if (/^on[A-Z]/.test(key)) {
                const eventName = key.slice(2).toLowerCase();
                if (oldVal) {
                    el.removeEventListener(eventName, oldVal);
                }
                if (newVal) {
                    el.addEventListener(eventName, newVal);
                }
            }
            else if (domPropsRE.test(key)) {
                if (newVal === '' && isBoolean(el[key])) {
                    newVal = true;
                }
                el[key] = newVal;
            }
            else {
                if (newVal == null || newVal === false) {
                    el.removeAttribute(key);
                }
                else {
                    el.setAttribute(key, newVal);
                }
            }
            break;
    }
}