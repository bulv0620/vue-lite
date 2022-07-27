import { isString } from "../utils";
import { render } from "./render";
import { h } from "./vnode";

export function createApp(rootComponent) {
    const app = {
        mount(el){
            if(isString(el)){
                el = document.querySelector(el);
            }

            if(!rootComponent.render && !rootComponent.template){
                rootComponent.template = el.innerHTML;
                el.innerHTML = '';
            }
            
            render(h(rootComponent), el);
        }
    }
    return app;
}