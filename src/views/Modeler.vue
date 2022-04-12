<template>
  <div class="bg-sky-700 text-center text-slate-200 py-12">
    <input
      class="text-center text-white bg-transparent text-4xl border-0 border-b-2 w-4/5 shadow-none"
      placeholder="Name your new Bot"
      v-model="botName"
    />
  </div>
  <hr />
  <BotModeler :botModelName="botName" :botModelId="modelId"></BotModeler>
</template>

<script lang="ts">
export default defineComponent({
  name: "modeler",
  data() {
    return {
      botName: "",
      modelId: this.$route.params.modelId as string,
    };
  },
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
import BotModeler from "../components/BotModeler.vue";
</script>
