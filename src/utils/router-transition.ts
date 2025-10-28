import { onBeforeUnmount } from "vue";

const transitionCbs: Function[] = [];

export const callRouterTransitionCbs = () => {
  const copied = [...transitionCbs];
  transitionCbs.length = 0;
  copied.forEach((cb) => cb());
};

/**
 * 当页面使用类似于zoom-in的动画时，在onMounted中获取元素的尺寸会有问题，因为此时动画还在进行中
 * 元素还处于缩放状态，在这种情况下可以通过该函数来获取元素尺寸
 * 在页面过渡动画结束后调用
 * @param cb
 */
export const onRouterTransitionAppeared = (cb: Function) => {
  transitionCbs.push(cb);
  onBeforeUnmount(() => {
    const i = transitionCbs.indexOf(cb);
    if (i !== -1) {
      transitionCbs.splice(i, 1);
    }
  });
};
