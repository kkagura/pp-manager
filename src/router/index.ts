import { createRouter, createWebHashHistory } from "vue-router";
import pinia from "@/store";
import { useAuthStore } from "@/store/auth";
import { getAccessToken } from "@/request";

export const siderRoutes = [
  {
    name: "HomePage",
    path: "/home",
    component: () => import("../views/home-page/HomePage.vue"),
    meta: {
      title: "首页",
      icon: "icon-shouye",
      menu: true,
      requiresAuth: true,
    },
  },
  {
    name: "NoteList",
    path: "/note/list",
    component: () => import("../views/note/NoteList.vue"),
    meta: {
      title: "笔记",
      icon: "icon-yunyingxiaoji",
      menu: true,
      requiresAuth: true,
    },
  },
  {
    name: "TodoList",
    path: "/todo/list",
    component: () => import("../views/todo/TodoList.vue"),
    meta: {
      title: "待办",
      icon: "icon-daiban",
      menu: true,
      requiresAuth: true,
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
      requiresAuth: true,
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
      requiresAuth: true,
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
      requiresAuth: true,
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
      requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: "StringTools",
    path: "/string-tools",
    component: () => import("../views/string-tools/StringTools.vue"),
    meta: {
      title: "字符串工具",
      icon: "icon-zifuchuantihuan_2",
      menu: true,
      requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: "Changelog",
    path: "/changelog",
    component: () => import("../views/changelog/Changelog.vue"),
    meta: {
      title: "更新日志",
      menu: false,
      activeMenu: "Setting",
      requiresAuth: true,
    },
  },
];

export const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    name: "Login",
    path: "/login",
    component: () => import("../views/login/LoginPage.vue"),
    meta: {
      title: "登录",
      requiresAuth: false,
    },
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

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia);

  if (to.meta.title) {
    document.title = to.meta.title;
  }

  if (to.name === "Login") {
    if (!getAccessToken()) {
      return true;
    }

    const currentUser = await authStore.fetchCurrentUser();
    return currentUser ? resolveRedirect(to.query.redirect) : true;
  }

  if (to.meta.requiresAuth) {
    const currentUser = await authStore.fetchCurrentUser();
    if (!currentUser) {
      return {
        name: "Login",
        query: {
          redirect: to.fullPath,
        },
      };
    }
  }

  return true;
});

function resolveRedirect(redirect: unknown): string {
  return typeof redirect === "string" && redirect.startsWith("/")
    ? redirect
    : "/home";
}

export default router;
