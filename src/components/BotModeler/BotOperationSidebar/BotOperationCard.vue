<template>
  <div
    class="ml-2 my-2 rounded-lg h-20 w-44 hover:shadow-lg bg-white hover:bg-slate-50 border-solid border-2 border-primary cursor-pointer"
  >
    <div class="flex flex-col justify-between">
      <div class="operation-tagline">
        <RpaElementExplainer
          v-if="operation.automates"
          :rpa-element="operation.automates"
          :position="explanationPosition"
          @click="$emit('tag-clicked', operation.automates?.id)"
        ></RpaElementExplainer>
        <div v-else class="text-white">d</div>
      </div>
      <div class="w-full text-center break-all">
        <RpaElementExplainer
          :rpa-element="operation"
          :position="explanationPosition"
        ></RpaElementExplainer>
      </div>
      <div class="operation-tagline">
        <RpaElementExplainer
          v-if="operation.accesses"
          :rpa-element="operation.accesses"
          :position="explanationPosition"
          @click="$emit('tag-clicked', operation.accesses?.id)"
        ></RpaElementExplainer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaOperation } from "../../../interfaces/RpaOperation";
import RpaElementExplainer from "../../RpaElementExplainer.vue";
export default defineComponent({
  name: "bot-operation-card",
  emits: ["tag-clicked"],
  data() {
    return {
      explanationPosition: "bottom",
    };
  },
  props: {
    operation: {
      type: Object as PropType<RpaOperation>,
      required: true,
    },
  },
  components: { RpaElementExplainer },
});
</script>

<style>
.operation-tagline {
  @apply flex justify-between text-xs m-1;
}
.operation-tagline span {
  @apply rounded bg-slate-100 text-slate-500 px-1;
}
</style>
