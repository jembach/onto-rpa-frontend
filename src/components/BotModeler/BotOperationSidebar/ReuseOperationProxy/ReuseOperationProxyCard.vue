<template>
  <div
    class="mx-auto mt-4 rounded-lg h-24 w-56 hover:shadow-lg bg-white hover:bg-slate-50 border-solid border-2 border-primary cursor-pointer"
  >
    <div class="flex flex-col justify-center h-full">
      <div class="w-full text-center">
        {{ proxy.label || proxy.id }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaReuseProxy } from "../../../../interfaces/RpaOperation";

export default defineComponent({
  name: "bot-proxy-container-card",
  props: {
    proxy: {
      type: Object as PropType<RpaReuseProxy>,
      required: true,
    },
  },
  components: {},
});
</script>
