import { createRouter, createWebHistory } from "vue-router";

export const siderRoutes = [
  {
    path: "/work-space",
    component: () => import("../views/work-space/WorkSpace.vue"),
    meta: {
      title: "工作区",
      icon: "icon-gongzuoqu",
    },
  },
  {
    path: "/setting",
    component: () => import("../views/setting/Setting.vue"),
    meta: {
      title: "设置",
      icon: "icon-shezhi",
    },
  },
];

export const routes = [
  {
    path: "/",
    redirect: "/work-space",
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
