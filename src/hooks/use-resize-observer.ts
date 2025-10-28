import { onBeforeMount, onMounted, shallowRef, type Ref } from "vue";

export function useResizeObserver(
  el: Ref<HTMLElement | undefined>,
  cb: ResizeObserverCallback
) {
  const observer = shallowRef<ResizeObserver>();
  onMounted(() => {
    if (el.value) {
      observer.value = new ResizeObserver((...args) => {
        cb(...args);
      });
      observer.value.observe(el.value);
    }
  });
  onBeforeMount(() => {
    observer.value?.disconnect();
    observer.value = undefined;
  });
  return observer;
}
