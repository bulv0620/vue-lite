import { isString } from "../utils";
import { render } from "./render";
import { h } from "./vnode";

export function createApp(rootComponent) {
    const app = {
        mount(el){
            if(isString(el)){
                el = document.querySelector(el);
            }
            render(h(rootComponent), el);
        }
    }
    return app;
}