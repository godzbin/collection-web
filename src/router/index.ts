import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue"; // 我们将创建这个组件

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/log",
    name: "Log",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/Log.vue"), // 懒加载
  },
  {
    path: "/setting",
    name: "Setting",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("../views/Setting.vue"), // 懒加载
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"), // 动态导入
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
