
export let activeEffect = undefined;

class ReactiveEffect {
  public parent = undefined;
  public deps = []
  public active = true; // 这个effect默认激活
  constructor(public fn) {// 用户传递的参数也会放到this上

  }
  run() {
    if(!this.active) { return this.fn(); } // 如果effect不激活，就只执行，但是不依赖收集

    // 如果effect激活，就执行，并且依赖收集
    // 核心就是将当前的effect和稍后渲染的属性关联一起
    try {
      this.parent = activeEffect
      activeEffect = this;
      this.fn(); // 当稍后调用取值操作的时候，就可以获取到这个全局的activeEffect了
    } finally {
      activeEffect = this.parent;
    }
    
  }
}




export function effect(fn) {
  const _effect = new ReactiveEffect(fn); // 创建响应式的effect
  _effect.run(); // 默认执行一次
}


const targetMap = new WeakMap();
export function track(target, type, key) {
  if(!activeEffect) {
    return 
  }
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  let shouldTrack = !dep.has(activeEffect)
  if(shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }


}


export function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target) 
  if(!depsMap) { // 触发的值不在模板中使用
    return
  }
  const effects = depsMap.get(key)
  effects && effects.forEach(effect => {
    // 我们在执行effect的时候，又要执行自己，那么我们需要屏蔽掉自己
    if(effect !== activeEffect) {
      effect.run()
    }
  })
}