import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import Oruga from "@oruga-ui/oruga-next";
import orugaConfig from "./oruga-config";
import "@oruga-ui/theme-oruga/dist/oruga-full.css";
import "@fortawesome/fontawesome-free/js/all.js";

createApp(App).use(router).use(Oruga, orugaConfig).mount("#app");
