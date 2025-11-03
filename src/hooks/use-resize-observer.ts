import { debounce } from "@/utils/debounce";
import { onBeforeMount, onMounted, shallowRef, type Ref } from "vue";

export function useResizeObserver(
  el: Ref<HTMLElement | undefined>,
  cb: ResizeObserverCallback
) {
  const observer = shallowRef<ResizeObserver>();
  const debouncedCb = debounce(cb, 10);
  onMounted(() => {
    if (el.value) {
      observer.value = new ResizeObserver((...args) => {
        debouncedCb(...args);
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
