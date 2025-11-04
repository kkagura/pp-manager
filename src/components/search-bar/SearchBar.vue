<script lang="ts">
import { defineComponent, ref, computed, provide, h, watch } from "vue";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { searchBarContextKey, SearchBarContext } from "./context";
import SearchAction from "./SearchAction.vue";

export default defineComponent({
  name: "SearchBar",
  props: {
    labelWidth: {
      type: [String, Number],
      default: "fit-content",
    },
    gutter: {
      type: Number,
      default: 12,
    },
    expand: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["expand", "search", "reset"],
  setup(props, { slots, emit }) {
    const searchBarRef = ref<HTMLElement>();
    const columns = ref(4); // 默认4列
    const isExpand = ref(props.expand);

    watch(
      () => props.expand,
      (newVal) => {
        isExpand.value = newVal;
      }
    );

    // 根据宽度计算列数
    const calculateColumns = (width: number) => {
      if (width < 600) {
        return 2;
      } else if (width < 900) {
        return 3;
      } else {
        return 4;
      }
    };

    // 监听宽度变化
    useResizeObserver(searchBarRef, (entries) => {
      const entry = entries[0];
      if (entry?.contentRect) {
        const width = entry.contentRect.width;
        columns.value = calculateColumns(width);
      }
    });

    const context = computed<SearchBarContext>(() => {
      return {
        labelWidth: props.labelWidth,
        gutter: props.gutter,
      };
    });

    provide(searchBarContextKey, context);

    return () => {
      let children = slots.default?.() || [];
      const needExpand = children.length > columns.value - 1;
      const action = h(
        SearchAction,
        {
          showExpandButton: needExpand,
          expand: isExpand.value,
          onExpand: (expanded: boolean) => {
            isExpand.value = expanded;
            emit("expand", expanded);
          },
          onSearch: () => {
            emit("search");
          },
          onReset: () => {
            emit("reset");
          },
        },
        {
          // 将父元素slots中的action传递给SearchAction的default插槽
          default: slots.action ? slots.action : undefined,
          extra: slots.actionExtra ? slots.actionExtra : undefined,
        }
      );
      children.splice(columns.value - 1, 0, action);
      if (!isExpand.value) {
        children = children.slice(0, columns.value);
      }
      if (!needExpand) {
        // 计算最后一行的元素数量
        const totalItems = children.length;
        const lastRowItems = totalItems % columns.value;

        // 如果最后一行有元素且不满，让最后一个元素占满剩余空间
        if (lastRowItems > 0 && lastRowItems < columns.value) {
          const lastChild = action;
          if (lastChild && typeof lastChild === "object") {
            const spanColumns = columns.value - lastRowItems + 1;
            // 设置最后一个元素的grid-column样式
            if (!lastChild.props) {
              lastChild.props = {};
            }
            const originalStyle = lastChild.props.style || {};
            lastChild.props.style = {
              ...originalStyle,
              gridColumn: `span ${spanColumns}`,
            };
          }
        }
      }

      return h(
        "div",
        {
          ref: searchBarRef,
          class: "search-bar",
          style: {
            display: "grid",
            gridColumnGap: `${props.gutter}px`,
            gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
          },
        },
        children
      );
    };
  },
});
</script>
