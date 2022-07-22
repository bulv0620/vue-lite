import { ShapeFlag } from "./vnode";
import { patchProps } from "./patchProps";
import { mountComponent } from "./component";

export function render(vnode, container) {
    const prevVNode = container._vnode;
    if (!vnode) {
        if (prevVNode) {
            unmount(prevVNode);
        }
    }
    else {
        patch(prevVNode, vnode, container);
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

function unmountComponent(vnode) {
    unmount(vnode.component.subTree);
}

function processComponent(n1, n2, container, anchor) {
    if (n1) {
        updateComponent(n1, n2);
    }
    else {
        mountComponent(n2, container, anchor, patch);
    }
}

function updateComponent(n1, n2) {
    n2.component = n1.component;
    n2.component.next = n2;
    n2.component.update();
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
            unmountChildren(c1);
        }
        container.textContent = c2;
    }
    else if (s2 & ShapeFlag.ARRAY_CHILDREN) {
        if (s1 & ShapeFlag.TEXT_CHILDREN) {
            container.textcontent = '';
            mountArrayChildren(c2, container, anchor);
        }
        else if (s1 & ShapeFlag.ARRAY_CHILDREN) {
            if (hasKey(c1, c2)) {
                patchKeyedChildren(c1, c2, container, anchor);
            }
            else {
                patchUnkeyedChildren(c1, c2, container, anchor);
            }
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
            unmountChildren(c1);
        }
    }

}

function hasKey(c1, c2) {
    return c1[0] && c1[0].key && c2[0] && c2[0].key;
}

function patchUnkeyedChildren(c1, c2, container, anchor) {
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

function patchKeyedChildren(c1, c2, container, anchor) {
    let fp = 0;
    let rp1 = c1.length - 1;
    let rp2 = c2.length - 1;

    while (fp < rp1 && fp < rp2 && c1[fp].key === c2[fp].key) {
        patch(c1[fp], c2[fp], container, anchor);
        fp++;
    }

    while (fp < rp1 && fp < rp2 && c1[rp1].key === c2[rp2].key) {
        patch(c1[rp1], c2[rp2], container, anchor);
        rp1--;
        rp2--;
    }

    if (fp > rp1) {
        for (let i = fp; i <= rp2; i++) {
            const curAnchor = c2[rp2 + 1].el;
            patch(null, c2[i], container, curAnchor);
        }
    }
    else if (fp > rp2) {
        for (let i = fp; i <= rp1; i++) {
            unmount(c1[i]);
        }
    }
    else {
        const nextPos = rp2 + 1;
        const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
        coreDiff(c1.slice(fp, rp1 + 1), c2.slice(fp, rp2 + 1), container, curAnchor);
    }
}

function coreDiff(c1, c2, container, anchor) {
    const oldNodeMap = new Map();
    c1.forEach((node, index) => {
        oldNodeMap.set(node.key, {
            index,
            node
        })
    })

    let maxNewIndex = 0;
    let move = false;
    const source = new Array(c2.length).fill(-1);
    const toMounted = [];

    for (let i = 0; i < c2.length; i++) {
        const newNode = c2[i];
        if (oldNodeMap.has(newNode.key)) {
            const { node: oldNode, index: oldIndex } = oldNodeMap.get(newNode.key);
            patch(oldNode, newNode, container, anchor);
            if (oldIndex < maxNewIndex) {
                move = true;
            }
            else {
                maxNewIndex = oldIndex;
            }
            source[i] = oldIndex;
            oldNodeMap.delete(newNode.key);
        }
        else {
            toMounted.push(i)
        }
    }

    oldNodeMap.forEach(item => {
        unmount(item.node);
    })

    if (move) {
        const seq = getSequence(source);
        let seqRp = seq.length - 1;
        for (let i = source.length - 1; i >= 0; i--) {
            if (source[i] === -1) {
                continue;
            }
            if (seq[seqRp] === i) {
                seqRp--;
            }
            else {
                const pos = i;
                const nextPos = pos + 1;
                const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
                container.insertBefore(c2[pos].el, curAnchor);
            }
        }
    }
    if (toMounted.length) {
        for (let i = toMounted.length - 1; i >= 0; i--) {
            const pos = toMounted[i];
            const nextPos = pos + 1;
            const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor;
            patch(null, c2[pos], container, curAnchor);
        }
    }
}

function getSequence(nums) {
    const list = [];
    const pos = [];
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === -1) {
            continue;
        }

        if (nums[i] > list[list.length - 1]) {
            list.push(nums[i]);
            pos.push(list.length - 1);
        }
        else {
            let l = 0;
            let r = list.length - 1;
            while (l <= r) {
                let mid = ~~((l + r) / 2);
                if (list[mid] > nums[i]) {
                    r = mid - 1;
                }
                else if (list[mid] < nums[i]) {
                    l = mid + 1;
                } else {
                    l = mid;
                    break;
                }
            }
            list[l] = nums[i];
            pos.push(l);
        }
    }

    let cur = list.length - 1;
    for (let i = pos.length - 1; i >= 0 && cur >= 0; i--) {
        if (cur === pos[i]) {
            list[cur--] = i;
        }
    }

    return list;
}
