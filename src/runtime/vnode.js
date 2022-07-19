import { isArray, isNumber, isString } from "../utils";

export const ShapeFlag = {
    ELEMENT: 1, // 0000 0001
    TEXT: 1 << 1, // 0000 0010
    FRAGMENT: 1 << 2, // 0000 0100
    COMPONENT: 1 << 3, // 0000 1000
    TEXT_CHILDREN: 1 << 4, // 0001 0000
    ARRAY_CHILDREN: 1 << 5, // 0010 0000
    CHILDREN: (1 << 4) | (1 << 5) // 0011 0000
}

export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');

/**
 * 虚拟dom生成函数: createVNode()
 * @param {string | Text | Fragment | Object} type 
 * @param {Object | null} props 
 * @param {string | number | Array | null} children 
 */
export function h(type, props, children) {
    let shapeFlag = 0;

    if (isString(type)) {
        shapeFlag = ShapeFlag.ELEMENT;
    }
    else if (type === Text) {
        shapeFlag = ShapeFlag.TEXT;
    }
    else if (type === Fragment) {
        shapeFlag = ShapeFlag.FRAGMENT;
    }
    else {
        shapeFlag = ShapeFlag.COMPONENT;
    }

    if (isString(children) || isNumber(children)) {
        shapeFlag |= ShapeFlag.TEXT_CHILDREN;
        children = children.toString();
    }
    else if(isArray(children)){
        shapeFlag |= ShapeFlag.ARRAY_CHILDREN;
    }

    return {
        type,
        props,
        children,
        shapeFlag
    }
}