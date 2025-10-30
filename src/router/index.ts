import { createRouter, createWebHistory } from "vue-router";

export const siderRoutes = [
  {
    name: "WorkSpaceList",
    path: "/work-space/list",
    component: () => import("../views/work-space/WorkSpaceList.vue"),
    meta: {
      title: "工作区",
      icon: "icon-gongzuoqu",
      menu: true,
    },
  },
  {
    name: "WorkSpaceAdd",
    path: "/work-space/add",
    component: () => import("../views/work-space/WorkSpaceForm.vue"),
    meta: {
      title: "新增工作区",
      menu: false,
    },
  },
  {
    name: "WorkSpaceEdit",
    path: "/work-space/edit/:id",
    component: () => import("../views/work-space/WorkSpaceForm.vue"),
    meta: {
      title: "编辑工作区",
      menu: false,
    },
  },
  {
    name: "ShortcutList",
    path: "/shortcut/list",
    component: () => import("../views/shortcut/ShortcutList.vue"),
    meta: {
      title: "快捷方式",
      icon: "icon-030-shortcutscriptapp",
      menu: true,
    },
  },
  {
    name: "Setting",
    path: "/setting",
    component: () => import("../views/setting/Setting.vue"),
    meta: {
      title: "设置",
      icon: "icon-shezhi",
      menu: true,
    },
  },
];

export const routes = [
  {
    path: "/",
    redirect: "/work-space/list",
  },
  {
    path: "/sider",
    component: () => import("../components/sider-layout/SiderLayout.vue"),
    children: siderRoutes,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  next();
});

export default router;
