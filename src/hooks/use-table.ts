import { Page, PageParams } from "@/modules/base/base.service";
import { reactive } from "vue";

interface UseTableOptions<P extends Record<string, any>, R> {
  fetch: (params: PageParams<P>) => Promise<Page<R>>;
  searchParams: P;
}

export interface UseTableContext<P extends Record<string, any>, R> {
  searchParams: P;
  pagination: PageParams;
  records: R[];
  total: number;
  loading: boolean;
  search: (reset?: boolean) => void;
  reset: () => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
}
export const useTable = <P extends Record<string, any>, R>(
  options: UseTableOptions<P, R>
): UseTableContext<P, R> => {
  const originSearchParams: P = JSON.parse(
    JSON.stringify(options.searchParams)
  );
  const context = reactive<UseTableContext<P, R>>({
    searchParams: options.searchParams,
    pagination: {
      page: 1,
      pageSize: 10,
    },
    records: [],
    total: 0,
    loading: false,
    search,
    reset,
    handlePageChange,
    handlePageSizeChange,
  }) as UseTableContext<P, R>;

  function search(reset = true) {
    if (reset) {
      context.pagination.page = 1;
    }
    context.loading = true;
    options
      .fetch({
        ...context.pagination,
        ...context.searchParams,
      })
      .then((res) => {
        context.records = res.records;
        context.total = res.total;
      })
      .finally(() => {
        context.loading = false;
      });
  }

  function reset() {
    context.searchParams = JSON.parse(JSON.stringify(originSearchParams));
    search();
  }

  function handlePageChange(page: number) {
    context.pagination.page = page;
    search();
  }

  function handlePageSizeChange(pageSize: number) {
    context.pagination.pageSize = pageSize;
    search();
  }

  return context;
};
