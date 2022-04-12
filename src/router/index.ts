import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Modeler from "../views/BotModeler.vue";
import Overview from "../views/BotOverview.vue";
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
    path: "/modeler/:modelId",
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
