import { effect, reactive } from '../reactive'
import { queueJob } from './scheduler';
import { normalizeVNode } from './vnode';

export function mountComponent(vnode, container, anchor, patch) {
    const { type: component } = vnode;

    const instance = (vnode.component = {
        props: null,
        attrs: null,
        setupState: null,
        ctx: null,
        subTree: null,
        update: null,
        isMounted: false,
        next: null,
    });
    updateProps(vnode, instance);

    // setup
    instance.setupState = component.setup?.(instance.props, { attrs: instance.attrs });

    // 源码中使用proxy
    instance.ctx = {
        ...instance.props,
        ...instance.setupState
    }

    instance.update = effect(() => {
        // console.log('render')
        if (instance.next) {
            vnode = instance.next;
            instance.next = null;
            updateProps(vnode, instance);
            instance.ctx = {
                ...instance.props,
                ...instance.setupState
            }
        }

        const prev = instance.subTree;
        const subTree = (instance.subTree = normalizeVNode(component.render(instance.ctx)));

        fallThrough(instance, subTree);

        patch(prev, subTree, container, anchor);
        vnode.el = subTree.el;

        if (!instance.isMounted) {
            instance.isMounted = false;
        }
    }, {
        scheduler: queueJob
    })
}

function fallThrough(instance, subTree) {
    if (Object.keys(instance.attrs).length) {
        subTree.props = {
            ...subTree.props,
            ...instance.attrs
        }
    }
}

function updateProps(vnode, instance) {
    const { type: component } = vnode;

    const props = (instance.props = {});
    const attrs = (instance.attrs = {});

    for (const key in vnode.props) {
        if (component.props?.includes(key)) {
            props[key] = vnode.props[key];
        }
        else {
            attrs[key] = vnode.props[key];
        }
    }

    instance.props = reactive(props);
}