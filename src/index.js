import { render, h, Text, Fragment, createApp } from "./runtime";
import { ref } from "./reactive";

createApp({
    setup() {
        const count = ref(0);
        function addCount() {
            count.value++;
        }
        return {
            count,
            addCount
        }
    },
    render(ctx) {
        return h('div', null, [
            h('div', null, ctx.count.value),
            h('button', { onClick: ctx.addCount }, 'add'),
        ])
    }
}).mount(document.body)