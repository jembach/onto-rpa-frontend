import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Modeler from "../views/Modeler.vue";
import Overview from "../views/Overview.vue";
import NotFound from "../views/404.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Overview",
    component: Overview,
    meta: {
      title: "Overview",
    },
  },
  {
    path: "/modeler",
    name: "Modeler",
    component: Modeler,
    meta: {
      title: "Modeler",
    },
  },
  { path: "/:pathMatch(.*)", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
