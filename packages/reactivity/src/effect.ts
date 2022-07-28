
export let activeEffect = undefined;

class ReactiveEffect {
  public active = true; // 这个effect默认激活
  constructor(public fn) {// 用户传递的参数也会放到this上

  }
  run() {
    if(!this.active) { return this.fn(); } // 如果effect不激活，就只执行，但是不依赖收集

    // 如果effect激活，就执行，并且依赖收集
    // 核心就是将当前的effect和稍后渲染的属性关联一起
    try {
      activeEffect = this;
      this.fn(); // 当稍后调用取值操作的时候，就可以获取到这个全局的activeEffect了
    } finally {
      activeEffect = undefined;
    }
    
  }
}




export function effect(fn) {
  const _effect = new ReactiveEffect(fn); // 创建响应式的effect
  _effect.run(); // 默认执行一次
}