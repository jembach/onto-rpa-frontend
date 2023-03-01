import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Modeler from "../views/BotModeler.vue";
import Overview from "../views/BotOverview.vue";
import ModelAbstractor from "../views/BotModelAbstractor.vue";
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
    path: "/modeler/:modelId?",
    name: "Modeler",
    component: Modeler,
    meta: {
      title: "Modeler",
    },
  },
  {
    path: "/abstractor/:modelId",
    name: "ModelAbstractor",
    component: ModelAbstractor,
    meta: {
      title: "Model Abstractor",
    },
  },
  { path: "/:pathMatch(.*)", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.name?.toString() + " - Conceptual RPA Bot Modeler";
  next();
});

export default router;
