<template>
  <div class="bg-sky-700 text-center text-slate-200 py-12">
    <h1 class="text-4xl font-bold">Semantic RPA Bot Modeler</h1>
  </div>
  <hr />
  <div class="min-h-screen">
    <hr />
    <BpmnModeler></BpmnModeler>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "modeler",
});
</script>

<script setup lang="ts">
import { defineComponent, PropType } from "vue";
import BpmnModeler from "../components/BpmnModeler.vue";
</script>
