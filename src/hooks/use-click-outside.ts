import { isChildOf } from "@/utils/dom";
import { onMounted, onUnmounted, Ref } from "vue";

export function useClickOutside(
  target: Ref<HTMLElement | undefined>,
  cb: () => void,
  options: {
    trigger?: Array<"click" | "contextmenu">;
  } = {
    trigger: ["click"],
  }
) {
  const { trigger = ["click"] } = options;

  const handleTrigger = (event: MouseEvent) => {
    if (
      target.value &&
      !isChildOf(
        event.target as HTMLElement,
        (element) => element === target.value
      )
    ) {
      cb();
    }
  };
  onMounted(() => {
    trigger.forEach((trigger) => {
      document.addEventListener(trigger, handleTrigger);
    });
  });
  onUnmounted(() => {
    trigger.forEach((trigger) => {
      document.removeEventListener(trigger, handleTrigger);
    });
  });
}
