<template>
  <div class="bg-sky-700 text-center text-slate-200 py-12">
    <h1 class="text-4xl font-bold">Semantic RPA Bot Modeler</h1>
  </div>
  <div>
    <o-button tag="router-link" to="modeler" class="m-4">
      Open Modeler
    </o-button>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "overview",
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
</script>
