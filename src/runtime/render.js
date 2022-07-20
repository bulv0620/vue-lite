import { ShapeFlag } from "./vnode";
import { patchProps } from "./patchProps";

export function render(vnode, container) {
    const prevVNode = container._vnode;
    if (!vnode) {
        if (prevVNode) {
            unmount(prevVNode);
        }
    }
    else {
        if (vnode !== prevVNode) {
            patch(prevVNode, vnode, container);
        }
    }
    container._vnode = vnode;
}

function unmount(vnode) {
    const { shapeFlag, el } = vnode;
    if (shapeFlag & ShapeFlag.COMPONENT) {
        unmountComponent(vnode);
    }
    else if (shapeFlag & ShapeFlag.FRAGMENT) {
        unmountFragment(vnode);
    }
    else {
        el.parentElement.removeChild(el);
    }
}

function unmountComponent() {
    // todo
}

function unmountFragment(vnode) {
    let { el: cur, anchor: end } = vnode;
    const parentNode = cur.parentNode;
    while (cur !== end) {
        parentNode.removeChild(cur);
        cur = cur.nextSibling;
    }
    parentNode.removeChild(end);
}

function unmountChildren(children) {
    children.forEach(child => {
        unmount(child);
    })
}

function patch(n1, n2, container, anchor) {
    if (n1 && !isSameVNodeType(n1, n2)) {
        anchor = (n1.anchor || n1.el).nextSibling;
        unmount(n1);
        n1 = null;
    }

    const { shapeFlag } = n2;
    if (shapeFlag & ShapeFlag.COMPONENT) {
        processComponent(n1, n2, container, anchor);
    }
    else if (shapeFlag & ShapeFlag.TEXT) {
        processText(n1, n2, container, anchor);
    }
    else if (shapeFlag & ShapeFlag.FRAGMENT) {
        processFragment(n1, n2, container, anchor);
    }
    else {
        processElement(n1, n2, container, anchor);
    }

}

function isSameVNodeType(n1, n2) {
    return n1.type === n2.type;
}

function processComponent(n1, n2, container, anchor) {
    // todo
}

function processText(n1, n2, container, anchor) {
    if (n1) {
        n2.el = n1.el;
        n1.el.textContent = n2.children;
    }
    else {
        mountText(n2, container, anchor);
    }
}

function processFragment(n1, n2, container, anchor) {
    const fragmentStartAnchor = (n2.el = n1 ? n1.el : document.createTextNode(''));
    const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : document.createTextNode(''));
    if (n1) {
        patchChildren(n1, n2, container, fragmentEndAnchor);
    }
    else {
        container.insertBefore(fragmentStartAnchor, anchor);
        container.insertBefore(fragmentEndAnchor, anchor);
        mountArrayChildren(n2.children, container, fragmentEndAnchor);
    }
}

function processElement(n1, n2, container, anchor) {
    if (n1) {
        patchElement(n1, n2);
    } else {
        mountElement(n2, container, anchor);
    }
}

function mountText(vnode, container, anchor) {
    const textNode = document.createTextNode(vnode.children);
    container.insertBefore(textNode, anchor);
    vnode.el = textNode;
}

function mountElement(vnode, container, anchor) {
    const { type, props, shapeFlag, children } = vnode;
    const el = document.createElement(type);
    patchProps(null, props, el)

    if (shapeFlag & ShapeFlag.TEXT_CHILDREN) {
        mountText(vnode, el);
    }
    else if (shapeFlag & ShapeFlag.ARRAY_CHILDREN) {
        mountArrayChildren(children, el)
    }

    container.insertBefore(el, anchor);
    vnode.el = el;
}

function mountArrayChildren(children, container, anchor) {
    children.forEach(child => {
        patch(null, child, container, anchor);
    })
}

function patchElement(n1, n2) {
    n2.el = n1.el;
    patchProps(n1.props, n2.props, n2.el);
    patchChildren(n1, n2, n2.el);
}

function patchChildren(n1, n2, container, anchor) {
    const { shapeFlag: s1, children: c1 } = n1
    const { shapeFlag: s2, children: c2 } = n2

    if (s2 & ShapeFlag.TEXT_CHILDREN) {
        if (s1 & ShapeFlag.ARRAY_CHILDREN) {
            unmountChildren(n1);
        }
        container.textContent = c2;
    }
    else if (s2 & ShapeFlag.ARRAY_CHILDREN) {
        if (s1 & ShapeFlag.TEXT_CHILDREN) {
            container.textcontent = '';
            mountArrayChildren(c2, container, anchor);
        }
        else if (s1 & ShapeFlag.ARRAY_CHILDREN) {
            patchArrayChildren(c1, c2, container, anchor);
        }
        else {
            mountArrayChildren(c2, container, anchor)
        }
    }
    else {
        if (s1 & ShapeFlag.TEXT_CHILDREN) {
            container.textContent = '';
        }
        else if (s1 & ShapeFlag.ARRAY_CHILDREN) {
            unmountChildren(n1);
        }
    }

}

function patchArrayChildren(c1, c2, container, anchor) {
    const oldLength = c1.length;
    const newLength = c2.length;

    const minLength = Math.min(oldLength, newLength);

    for (let i = 0; i < minLength; i++) {
        patch(c1[i], c2[i], container, anchor);
    }
    if (oldLength > newLength) {
        unmountChildren(c1.slice(minLength));
    }
    else if (oldLength < newLength) {
        mountArrayChildren(c2.slice(minLength), container, anchor);
    }
}