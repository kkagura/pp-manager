declare module "vue" {
  export interface GlobalComponents {
    PageContainer: typeof import("@/components/page-layout/PageContainer.vue")["default"];
    PageHeader: typeof import("@/components/page-layout/PageHeader.vue")["default"];
    PageContent: typeof import("@/components/page-layout/PageContent.vue")["default"];
    PageSider: typeof import("@/components/page-layout/PageSider.vue")["default"];
    SearchBar: typeof import("@/components/search-bar/SearchBar.vue")["default"];
    SearchItem: typeof import("@/components/search-bar/SearchItem.vue")["default"];
  }
}

export {};
