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
    {
      path: "/edit/:id",
      name: "editor",
      component: () => import("../views/Editor.vue"),
      meta: {
        requiresAuth: true,
      }, 
    }
  ],
});

router.beforeEach( async (to) => {
  const user = useUserStore();
  if(await user.fetchUserData()) {
    return { name: "home" };
  };
  if (to.meta.requiresGuest && user.isAuthenticated) {
    return { name: "home" };
  } else if (to.meta.requiresAuth && !user.isAuthenticated)
    return { name: "login" };
  else {
    return true;
  }
});

export default router;
