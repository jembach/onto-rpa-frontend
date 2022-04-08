<template>
  <div class="bg-sky-700 text-center text-slate-200 py-12">
    <h1 class="text-4xl font-bold">Semantic RPA Bot Modeler</h1>
  </div>
  <hr />
  <BotModeler></BotModeler>
</template>

<script lang="ts">
export default defineComponent({
  name: "modeler",
  mounted() {
    console.log(rpaOperations);
  },
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
import BotModeler from "../components/BotModeler.vue";
import { rpaOperations, rpaSoftware, rpaData } from "../utils/ontologyParser";
</script>
