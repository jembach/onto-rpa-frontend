<template>
  <div
    class="relative mx-auto my-6 rounded-lg h-20 w-44 shadow-md border-solid border-2 border-blue-500 cursor-pointer"
  >
    <div class="flex flex-col justify-between">
      <div class="operation-tagline">
        <span>{{ operation.concept }}</span>
      </div>
      <div class="w-full text-center">
        {{ operation.id }}
      </div>
      <div class="operation-tagline">
        <span>{{ operation.automates }}</span>
        <span>{{ operation.accesses }}</span>
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
.operation-tagline {
  @apply flex justify-between text-xs m-1;
}
.operation-tagline > span {
  @apply rounded-full bg-slate-500 text-white px-1;
}
</style>
