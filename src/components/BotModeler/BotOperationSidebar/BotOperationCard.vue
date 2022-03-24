<template>
  <div
    class="relative mx-auto my-6 rounded-lg h-20 w-44 shadow-md border-solid border-2 border-blue-500 cursor-pointer"
  >
    <div class="absolute top-1/2 -mt-3 w-full text-center">
      {{ operation.name }}
    </div>
    <div class="flex justify-between text-xs">
      <div class="operation-card">
        {{ operation.automates }}
      </div>
      <div class="operation-card">
        {{ operation.accesses }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaOperation } from "../../../interfaces/RpaOperation";
export default defineComponent({
  name: "bot-operation-sidebar",
  props: {
    operation: {
      type: Object as PropType<RpaOperation>,
      required: true,
    },
  },
});
</script>

<style>
.operation-card {
  @apply rounded-full bg-slate-500 text-white;
}
</style>
