import { isObject } from '@vue/shared';


const reactiveMap = new WeakMap();

const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}
export function reactive(target) {
  if(!isObject(target)) {
    return;
  }
  if(target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  let exsitingProxy = reactiveMap.get(target);
  if(exsitingProxy) {
    return exsitingProxy;
  }
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if(key === ReactiveFlags.IS_REACTIVE) {
        return true;
      }
      // return target[key]
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      // target[key] = value
      // return true
      return Reflect.set(target, key, value, receiver);
    }
  })
  reactiveMap.set(target, proxy);
  return proxy;
}