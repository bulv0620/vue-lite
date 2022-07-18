import { isObject, hasChanged, isArray } from "../utils";
import { track, trigger } from "./effect";

const proxyMap = new WeakMap();

export function reactive(target){
    if(!isObject(target)){
        return target;
    }

    if(isReactive(target)){
        return target;
    }

    if(proxyMap.has(target)){
        return proxyMap.get(target);
    }

    const proxy = new Proxy(target, {
        get(target, property){
            if(property === '__isReactive'){
                return true;
            }
            const res = Reflect.get(...arguments);
            track(target, property);

            return isObject(res) ? reactive(res) : res;
        },

        set(target, property, value){
            const oldVal = target[property];
            const oldLength = target.length;
            const res = Reflect.set(...arguments);
            if(hasChanged(oldVal, value)){
                trigger(target, property);
            }
            if(isArray(target) && hasChanged(oldLength, target.length)){
                trigger(target, 'length');
            }
            return res
        }
    })

    proxyMap.set(target, proxy);
    return proxy;
}

export function isReactive(target){
    return !!(target && target.__isReactive);
}