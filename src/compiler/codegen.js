import { capitalize } from "../utils";
import { NodeTypes, ElementTypes } from "./ast";

export function generate(ast) {
    const res = traverseNode(ast);
    const code = `
with(ctx){
    const {renderList, h, Text, Fragment, withModel, resolveComponent} = VueLite;
    return ${res};
}
`
    return code;
}

function traverseNode(node, parent) {
    switch (node.type) {
        case NodeTypes.ROOT:
            if (node.children.length === 1) {
                return traverseNode(node.children[0], node);
            }
            const res = traverseChildren(node);
            return res;
        case NodeTypes.ELEMENT:
            return resolveElementASTNode(node, parent);
        case NodeTypes.TEXT:
            return createTextVNode(node);
        case NodeTypes.INTERPOLATION:
            return createInterPolationVNode(node);
        default:
            break;
    }
}

function createTextVNode(node) {
    return `h(Text, null, ${createText(node)})`;
}

function createInterPolationVNode(node) {
    return `h(Text, null, ${createText(node.content)})`;
}

function createText({ isStatic = true, content = '' } = {}) {
    return isStatic ? JSON.stringify(content) : content;
}

function resolveElementASTNode(node, parent) {

    const ifNode = pluck(node.directives, 'if') || pluck(node.directives, 'else-if');
    if (ifNode) {
        const { exp } = ifNode;
        let consequent = resolveElementASTNode(node, parent);
        let alternate;

        const { children } = parent;
        const i = children.findIndex(child => child === node) + 1;

        for (; i < children.length; i++) {
            const sibling = children[i];
            if (sibling.type === NodeTypes.TEXT && !sibling.content.trim()) {
                children.splice(i--, 1);
                continue;
            }

            if (sibling.type === NodeTypes.ELEMENT) {
                if (pluck(sibling.directives, 'else') || pluck(sibling.directives, 'else-if', false)) {
                    alternate = resolveElementASTNode(sibling, parent);
                    children.splice(i, 1);
                }
            }
            break;
        }

        return `${exp.content} ? ${consequent} : ${alternate || createTextVNode()}`;
    }

    const forNode = pluck(node.directives, 'for');
    if (forNode) {
        const { exp } = forNode;
        const [args, source] = exp.content.split(/\sin\s|\sof\s/);
        return `h(Fragment, null, renderList(${source.trim()}, ${args.trim()} => ${resolveElementASTNode(node, parent)}))`;
    }

    return createElementVNode(node);
}

function createElementVNode(node) {
    const { children } = node;
    const tag = node.tagType === ElementTypes.ELEMENT ? JSON.stringify(node.tag) : `resolveComponent("${node.tag}")`;


    const propArr = createPropArr(node);
    let propStr = propArr.length ? `{${propArr.join(', ')}}` : 'null';

    const vmodelNode = pluck(node.directives, 'model');
    if (vmodelNode) {
        const {exp} = vmodelNode;
        const getter = `() => ${createText(exp)}`;
        const setter = `(value) => ${createText(exp)} = value`
        propStr = `withModel(${tag}, ${propStr}, ${getter}, ${setter})`;
    }

    if (!children.length) {
        if (propStr === 'null') {
            return `h(${tag})`
        }
        return `h(${tag}, ${propStr})`;
    }

    let childrenStr = traverseChildren(node);
    return `h(${tag}, ${propStr}, ${childrenStr})`
}

function createPropArr(node) {
    const { props, directives } = node;

    return [
        ...props.map(prop => `${prop.name}: ${createText(prop.value)}`),
        ...directives.map(dir => {
            switch (dir.name) {
                case 'bind':
                    return `${dir.arg.content}: ${createText(dir.exp)}`;
                case 'on':
                    const eventName = `on${capitalize(dir.arg.content)}`
                    let exp = dir.exp.content;

                    if (/\([^)]*\)$/.test(exp) && !exp.includes('=>')) {
                        exp = `$event => (${exp})`;
                    }

                    return `${eventName}: ${exp}`;
                case 'html':
                    return `innerHTML: ${createText(dir.exp)}`;
                default:
                    return `${dir.name}: ${createText(dir.exp)}`;
            }
        })
    ];
}

function traverseChildren(node) {
    const { children } = node;
    if (children.length === 1) {
        const child = children[0];
        if (child.type === NodeTypes.TEXT) {
            return createText(child);
        }
        if (child.type === NodeTypes.INTERPOLATION) {
            return createText(child.content);
        }
    }

    const list = [];
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        list.push(traverseNode(child, node));
    }

    return `[${list.join(', ')}]`
}

function pluck(directives, name, remove = true) {
    const index = directives.findIndex(dir => dir.name === name);
    const dir = directives[index];
    if (remove && index > -1) {
        directives.splice(index, 1);
    }
    return dir;
}