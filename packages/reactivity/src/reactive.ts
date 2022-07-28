import { isObject } from '@vue/shared';
import { ReactiveFlags, mutableHandlers } from './baseHandler';

const reactiveMap = new WeakMap();

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
  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy);
  return proxy;
}