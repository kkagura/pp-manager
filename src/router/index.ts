import { createRouter, createWebHashHistory } from "vue-router";

export const siderRoutes = [
  {
    name: "HomePage",
    path: "/home",
    component: () => import("../views/home-page/HomePage.vue"),
    meta: {
      title: "首页",
      icon: "icon-shouye",
      menu: true,
    },
  },
  {
    name: "NoteList",
    path: "/note/list",
    component: () => import("../views/note/NoteList.vue"),
    meta: {
      title: "小计",
      icon: "icon-yunyingxiaoji",
      menu: true,
    },
  },
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
      activeMenu: "WorkSpaceList",
    },
  },
  {
    name: "WorkSpaceEdit",
    path: "/work-space/edit/:id",
    component: () => import("../views/work-space/WorkSpaceForm.vue"),
    meta: {
      title: "编辑工作区",
      menu: false,
      activeMenu: "WorkSpaceList",
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
    name: "SourceList",
    path: "/source/list",
    component: () => import("../views/source/SourceList.vue"),
    meta: {
      title: "资源",
      icon: "icon-ziyuan",
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
    redirect: "/home",
  },
  {
    path: "/sider",
    component: () => import("../components/sider-layout/SiderLayout.vue"),
    children: siderRoutes,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  next();
});

export default router;
