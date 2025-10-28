import { ComputedRef, inject, InjectionKey } from "vue";

export interface SearchBarContext {
  labelWidth: string | number;
  gutter: number;
}

export const searchBarContextKey = Symbol("searchBarContext") as InjectionKey<
  ComputedRef<SearchBarContext>
>;

export const useSearchBarContext = () => {
  const context = inject(searchBarContextKey);
  if (!context) {
    throw new Error("useSearchBarContext must be used within a SearchBar");
  }
  return context;
};
