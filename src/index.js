import { render, h, Text, Fragment } from "./runtime";

render(
    h('ul', null, [
        h('li', { key: 1 }, '1'),
        h('li', { key: 2 }, '2'),
        h('li', { key: 3 }, '3'),
        h('li', { key: 4 }, '4'),
    ]),
    document.body
);

setTimeout(() => {
    render(
        h('ul', null, [
            h('li', { key: 7 }, 'new1'),
            h('li', { key: 1 }, '1'),
            h('li', { key: 2 }, '2'),
            h('li', { key: 6 }, 'new2'),
            h('li', { key: 3 }, '3'),
            h('li', { key: 4 }, '4'),
            h('li', { key: 5 }, '5'),
        ]),
        document.body
    );
}, 2000)

setTimeout(() => {
    render(
        h('ul', null, [
            h('li', { key: 1 }, '1'),
            h('li', { key: 2 }, '2'),
            h('li', { key: 3 }, '3'),
            h('li', { key: 4 }, '4'),
            h('li', { key: 6 }, '6'),
            h('li', { key: 7 }, '7'),
        ]),
        document.body
    );
}, 4000)