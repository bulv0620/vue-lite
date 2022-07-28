import { isArray, isNumber, isObject, isString } from "../../utils";

export function renderList(source, renderItem) {
    const nodes = [];
    if (isNumber(source)) {
        for (let i = 0; i < source; i++) {
            // (item, index) => {}
            nodes.push(renderItem(i + 1, i));
        }
    }
    else if (isString(source) || isArray(source)) {
        for (let i = 0; i < source.length; i++) {
            // (item, index) => {}
            nodes.push(renderItem(source[i], i));
        }
    }
    else if (isObject(source)) {
        Object.keys(source).forEach((key, i) => {
            // (value, key, index) => {}
            nodes.push(renderItem(source[key], key, i));
        })
    }

    return nodes;
}