import { isBoolean } from "../utils";
import { ShapeFlag } from "./vnode";

/**
 * 渲染函数
 * @param {Object} vnode 虚拟dom节点
 * @param {Object} container 挂载位置
 */
export function render(vnode, container) {
    mount(vnode, container);
}

// 挂载函数, 判断dom类型, 分配相应的渲染函数
function mount(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlag.ELEMENT) {
        mountElement(vnode, container);
    }
    else if (shapeFlag & ShapeFlag.TEXT) {
        mountText(vnode, container);
    }
    else if (shapeFlag & ShapeFlag.FRAGMENT) {
        mountFragment(vnode, container);
    }
    else if (shapeFlag & ShapeFlag.COMPONENT) {
        mountComponent(vnode, container);
    }
}

// 挂载元素
function mountElement(vnode, container) {
    const { type, props } = vnode;
    const el = document.createElement(type);
    mountProps(props, el)
    mountChildren(vnode, el);
    container.appendChild(el);
}

// 挂载文本
function mountText(vnode, container) {
    const textNode = document.createTextNode(vnode.children);
    container.appendChild(textNode);
}

// 挂载片段
function mountFragment(vnode, container) {
    mountChildren(vnode, container);
}

// 挂载组件（未开发）
function mountComponent(vnode, container) { 
    console.warn('mountComponent has not yet been developed');
 }

// 挂载子节点
function mountChildren(vnode, el) {
    const { shapeFlag, children } = vnode;
    if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
        mountText(vnode, el);
    }
    else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
        children.forEach(child => {
            mount(child, el);
        })
    }
}

// domProps类型区分正则
const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted|disabled)$/;
// 挂载props
function mountProps(props, el) {
    for(const key in props){
        let value = props[key];
        switch (key) {
            case 'class':
                el.className = value;
                break;
            case 'style':
                for(const styleName in value){
                    el.style[styleName] = value[styleName];
                }
                break;
            default:
                if(/^on[A-Z]/.test(key)){
                    el.addEventListener(key.slice(2).toLowerCase(), value);
                }
                else if(domPropsRE.test(key)){
                    if(value === '' && isBoolean(el[key])){
                        value = true;
                    }
                    el[key] = value;
                }
                else{
                    if(value == null || value === false){
                        el.removeAttribute(key, value);
                    }
                    else{
                        el.setAttribute(key, value);
                    }
                }
                break;
        }
    }
}