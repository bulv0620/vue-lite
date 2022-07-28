import { camelize, capitalize, isString } from "../utils";
import { render } from "./render";
import { h } from "./vnode";

let components;
export function createApp(rootComponent) {
    components = rootComponent.components || {};
    const app = {
        mount(el) {
            if (isString(el)) {
                el = document.querySelector(el);
            }

            if (!rootComponent.render && !rootComponent.template) {
                rootComponent.template = el.innerHTML;
                el.innerHTML = '';
            }

            render(h(rootComponent), el);
        }
    }
    return app;
}

export function resolveComponent(name) {
    return components && (components[name] || components[camelize(name)] || components[capitalize((camelize(name)))])
}