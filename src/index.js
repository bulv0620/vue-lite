import { render, h, Text, Fragment } from "./runtime";
import { ref } from "./reactive";

const comp = {
    setup() {
        const count = ref(0);
        const add = () => count.value++;
        return {
            count,
            add,
        };
    },
    render(ctx) {
        return h('div', null, [
            h('div', { class: 'a' }, ctx.count.value),
            h('button', { onClick: ctx.add }, 'add')
        ])
    },
}

const vnodeProps = {
    class: 'foo',
    bar: 'bar'
}

const vnode = h(comp, vnodeProps);
render(vnode, document.body);

// const Comp = {
//     props: ['foo'],
//     render(ctx) {
//         return h('div', { class: 'a', id: ctx.bar }, ctx.foo);
//     },
// };

// const vnodeProps = {
//     foo: 'foo',
//     bar: 'bar',
// };

// const vnode = h(Comp, vnodeProps);
// render(vnode, document.body); // 渲染为<div class="a" bar="bar">foo</div>