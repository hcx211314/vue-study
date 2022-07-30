
export let activeEffect = undefined;

function clearupEffect(effect){
  const { deps } = effect; // deps is a Set 里面装的是name对应的effect
  for(let i = 0; i < deps.length; i++) {
    deps[i].delete(effect); // 接触effect，重新收集依赖
  }
  effect.deps.length = 0;
}

class ReactiveEffect {
  public parent = undefined;
  public deps = []
  public active = true; // 这个effect默认激活
  constructor(public fn, public scheduler) {// 用户传递的参数也会放到this上

  }
  run() {
    if(!this.active) { return this.fn(); } // 如果effect不激活，就只执行，但是不依赖收集

    // 如果effect激活，就执行，并且依赖收集
    // 核心就是将当前的effect和稍后渲染的属性关联一起
    try {
      this.parent = activeEffect
      activeEffect = this;

      // 这里我们需要在执行用户函数之前收集的内容清空
      clearupEffect(this)

      this.fn(); // 当稍后调用取值操作的时候，就可以获取到这个全局的activeEffect了
    } finally {
      activeEffect = this.parent;
    }
    
  }

  stop() {
    if(this.active) {
      this.active = false
      clearupEffect(this) // 停止effect的收集
    }
  }
}




export function effect(fn, options:any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler); // 创建响应式的effect
  _effect.run(); // 默认执行一次

  const runner = _effect.run.bind(_effect); // 绑定this执行
  runner.effect = _effect;  //effect挂载到runner上
  return runner
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
  let effects = depsMap.get(key)
  if(effects) {
    effects = new Set(effects)
    effects.forEach(effect => {
      // 我们在执行effect的时候，又要执行自己，那么我们需要屏蔽掉自己
      if(effect !== activeEffect) {
        if(effect.scheduler) { // 如果用户传入了自己的，就调用自己的
          effect.scheduler(effect) 
        } else {
          effect.run()
        }
      }
    })
  }
}