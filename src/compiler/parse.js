import { NodeTypes, ElementTypes, createRoot } from "./ast";
import { isVoidTag, isNativeTag } from ".";
import { camelize } from "../utils";

export function parse(content) {
    const ctx = createParseContext(content);
    const children = parseChildren(ctx);

    const root = createRoot(children);

    return root;
}

function createParseContext(content) {
    return {
        options: {
            delimiters: ['{{', '}}'],
            isVoidTag,
            isNativeTag
        },
        source: content
    }
}

function parseChildren(ctx) {
    const nodes = [];
    while (!isEnd(ctx)) {
        const s = ctx.source;
        let node;
        if (s.startsWith(ctx.options.delimiters[0])) {
            node = parseInterpolation(ctx);
        }
        else if (s[0] === '<') {
            node = parseElement(ctx);
        }
        else {
            node = parseText(ctx);
        }
        nodes.push(node);
    }

    let removedWhiteSpace = false;
    nodes.forEach((node, index) => {
        if (node.type === NodeTypes.TEXT) {
            // 区分文本节点是否全是空白
            if (/[^\t\r\f\n ]/.test(node.content)) {
                node.content = node.content.replace(/[\t\r\f\n ]+/g, ' ');
            }
            else {
                const prev = nodes[index - 1];
                const next = nodes[index + 1];

                if (!prev ||
                    !next ||
                    (prev.type === NodeTypes.ELEMENT &&
                        next.type === NodeTypes.ELEMENT &&
                        /[\r\n]/.test(node.content))
                ) {
                    removedWhiteSpace = true;
                    nodes[index] = null;
                } else {
                    node.content = ' '
                }
            }
        }
    })
    return removedWhiteSpace ? nodes.filter(Boolean) : nodes;
}

function parseText(ctx) {
    const endTokens = ['<', ctx.options.delimiters[0]];
    let endIndex = ctx.source.length;

    endTokens.forEach(item => {
        let index = ctx.source.indexOf(item);
        if (index !== -1 && index < endIndex) {
            endIndex = index;
        }
    })

    const content = parseTextData(ctx, endIndex);

    return {
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(ctx, endIndex) {
    const text = ctx.source.slice(0, endIndex);
    advanceBy(ctx, endIndex);
    return text;
}

function parseInterpolation(ctx) {
    const [open, close] = ctx.options.delimiters;
    advanceBy(ctx, open.length);

    const closeIndex = ctx.source.indexOf(close);

    const content = parseTextData(ctx, closeIndex);

    advanceBy(ctx, close.length);

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content,
            isStatic: false,
        }
    }
}

function parseElement(ctx) {
    const element = parseTag(ctx);

    if (element.isSelfClosing || ctx.options.isVoidTag(element.tag)) {
        return element;
    }

    element.children = parseChildren(ctx);

    parseTag(ctx);

    return element;
}

function parseTag(ctx) {
    const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(ctx.source);

    const tag = match[1];

    advanceBy(ctx, match[0].length);
    advanceWhiteSpace(ctx);

    const { props, directives } = parseAttributes(ctx);

    const isSelfClosing = ctx.source.startsWith('/>');
    advanceBy(ctx, isSelfClosing ? 2 : 1)

    const tagType = isComponent(tag, ctx) ? ElementTypes.COMPONENT : ElementTypes.ELEMENT;

    return {
        type: NodeTypes.ELEMENT,
        tag, // 标签名
        tagType, // 组件 or 原生tag
        props, // 属性节点数组
        directives, // 指令数组
        isSelfClosing, // 是否自闭合
        children: []
    }
}

function isComponent(tag, ctx) {
    return !ctx.options.isNativeTag(tag);
}

// <div id="foo" v-if="ok"> hello {{ name }} </div>
function parseAttributes(ctx) {
    const props = [];
    const directives = [];

    while (ctx.source.length && !ctx.source.startsWith('>') && !ctx.source.startsWith('/>')) {
        let attr = parseAttribute(ctx);

        if (attr.type === NodeTypes.ATTRIBUTE) {
            props.push(attr);
        }
        else {
            directives.push(attr);
        }
    }

    return {
        props,
        directives
    }
}

function parseAttribute(ctx) {
    console.log(ctx.source)
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(ctx.source);
    const name = match[0];

    advanceBy(ctx, name.length);
    advanceWhiteSpace(ctx);

    let value;
    if (ctx.source[0] === '=') {
        advanceBy(ctx, 1);
        advanceWhiteSpace(ctx);
        value = parseAttributeValue(ctx);
        advanceWhiteSpace(ctx);
    }

    if (/^(:|@|v-)/.test(name)) {
        let dirName;
        let argContent;
        if (name[0] === '@') {
            dirName = 'on';
            argContent = name.slice(1);
        }
        else if (name[0] === ':') {
            dirName = 'bind'
            argContent = name.slice(1);
        }
        else if (name.startsWith('v-')) {
            [dirName, argContent] = name.slice(2).split(':');
        }

        return {
            type: NodeTypes.DIRECTIVE,
            name: dirName, // 指令名称
            exp: value && {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: value.content,
                isStatic: false,
            }, // 表达式
            arg: argContent && {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: camelize(argContent),
                isStatic: true,
            } // 属性
        }
    }

    return {
        type: NodeTypes.ATTRIBUTE,
        name,
        value: value && {
            type: NodeTypes.TEXT,
            content: value.content
        }
    }
}

function parseAttributeValue(ctx) {
    const quote = ctx.source[0];

    advanceBy(ctx, 1);

    const endIndex = ctx.source.indexOf(quote);

    const content = parseTextData(ctx, endIndex);

    advanceBy(ctx, 1);

    return { content }
}

function isEnd(ctx) {
    const s = ctx.source;
    return s.startsWith('</') || !s
}

function advanceBy(ctx, num) {
    ctx.source = ctx.source.slice(num);
}

function advanceWhiteSpace(ctx) {
    const match = /^[\t\r\n\f ]+/.exec(ctx.source);
    if (match) {
        advanceBy(ctx, match[0].length);
    }
}