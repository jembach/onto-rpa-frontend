<template>
  <div
    class="mx-auto mt-4 rounded-lg h-24 w-56 hover:shadow-lg bg-white hover:bg-slate-50 border-solid border-2 border-primary cursor-pointer"
  >
    <div class="flex flex-col justify-center h-full">
      <div class="w-full text-center">Placeholder</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "bot-template-placeholder-card",
  data() {
    return {
      explanationPosition: "bottom",
    };
  },
  components: {},
});
</script>
