import {
  createRouter,
  createWebHashHistory,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw
} from "vue-router";
import Home from "../views/Home.vue";
import {getToken} from "../utils/auth.ts"; // 我们将创建这个组件

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
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"), // 懒加载
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 定义不需要登录即可访问的白名单
const whiteList = ['/login'];

// 全局前置守卫
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // 1. 获取 token (假设存储在 localStorage 中，key 为 'token')
  // 您之前提到的 baseUrl 环境变量也可以在这里配合使用，如果需要请求后端验证 token 有效性
  console.log(from)
  const token = getToken();
  // 如果需要检查用户信息，也可以同时获取
  // const userInfo = localStorage.getItem('userInfo');

  // 2. 判断目标路由是否在白名单中
  if (whiteList.includes(to.path)) {
    // 如果在白名单（如登录页）且有 token，通常建议重定向到首页，防止已登录用户再次看到登录页
    if (token) {
      next({ path: '/' });
    } else {
      next();
    }
  } else {
    // 3. 不在白名单（需要登录的页面）
    if (token) {
      // 有 token，允许访问
      // 可选：在这里可以添加逻辑，通过 token 向后端请求最新用户信息
      next();
    } else {
      // 无 token，重定向到登录页
      // 可选：携带 redirect 参数，登录后跳回原页面
      next(`/login?redirect=${to.fullPath}`);
    }
  }
});


export default router;
