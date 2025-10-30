<template>
  <div class="pro-table-wrapper" ref="wrapperRef">
    <el-table
      v-bind="tableProps"
      :data="records"
      :height="fixHeader ? tableBodyHeight : undefined"
    >
      <slot></slot>
    </el-table>
    <div class="pro-table-pagination">
      <el-pagination
        :page-size="pagination.pageSize"
        :current-page="pagination.page"
        :total="total"
        @current-change="tableContext.handlePageChange"
        @size-change="tableContext.handlePageSizeChange"
        background
      ></el-pagination>
    </div>
  </div>
</template>

<script
  generic="T extends Record<string, any>, P extends Record<string, any>"
  lang="ts"
  setup
>
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { UseTableContext } from "@/hooks/use-table";
import { omit } from "@/utils/object";
import { TableProps } from "element-plus";
import { computed, ref, toRefs } from "vue";

type IProTableProps = Omit<TableProps<T>, "data" | "height"> & {
  tableContext: UseTableContext<P, T>;
  fixHeader?: boolean;
};

const props = withDefaults(defineProps<IProTableProps>(), {
  fixHeader: true,
  border: true,
  stripe: true,
  showHeader: true,
  fit: true,
});

const { pagination, records, total } = toRefs(props.tableContext);

const tableProps = computed(() => {
  return omit(props, ["fixHeader"]);
});

const wrapperRef = ref<HTMLElement>();
const tableBodyHeight = ref(0);
useResizeObserver(wrapperRef, () => {
  const wrapper = wrapperRef.value!;
  // const header = wrapper.querySelector(".el-table__header");
  const pagination = wrapper.querySelector(".pro-table-pagination");
  let height = wrapper.clientHeight;
  // if (header) {
  //   height -= header.clientHeight;
  // }
  if (pagination) {
    height -= pagination.clientHeight;
  }
  tableBodyHeight.value = height;
});
</script>
<style scoped lang="less">
.pro-table-wrapper {
  width: 100%;
  height: 100%;
  .pro-table-pagination {
    padding: 8px 0;
  }
}
</style>
