import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useUserStore } from "@/stores/user";

declare module "vue-router" {
  interface RouteMeta {
    requiresGuest?: boolean;
    requiresAuth?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: {
        requiresGuest: true,
      },
    },
    {
      path: "/create",
      name: "create",
      component: () => import("../views/CreateProjectView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
  ],
});

router.beforeEach((to) => {
  const user = useUserStore();
  if (to.meta.requiresGuest && user.isAuthenticated) {
    return { name: "home" };
  } else if (to.meta.requiresAuth && !user.isAuthenticated)
    return { name: "login" };
  else {
    return true;
  }
});

export default router;
