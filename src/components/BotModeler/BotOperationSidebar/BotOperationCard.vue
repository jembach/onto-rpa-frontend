<template>
  <div
    class="ml-2 my-2 rounded-lg h-20 w-44 shadow-md border-solid border-2 border-blue-500 cursor-pointer"
  >
    <div class="flex flex-col justify-between">
      <div class="operation-tagline">
        <RpaElementExplainer
          :position="explanationPosition"
          :rpa-element="operation.concept"
        ></RpaElementExplainer>
      </div>
      <div class="w-full text-center">
        <RpaElementExplainer
          :rpa-element="operation"
          :position="explanationPosition"
        ></RpaElementExplainer>
      </div>
      <div class="operation-tagline">
        <RpaElementExplainer
          v-if="operation.automates"
          :rpa-element="operation.automates"
          :position="explanationPosition"
        ></RpaElementExplainer>
        <RpaElementExplainer
          v-if="operation.accesses"
          :rpa-element="operation.accesses"
          :position="explanationPosition"
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
  name: "bot-operation-sidebar",
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
.operation-tagline > span {
  @apply rounded-full bg-slate-500 text-white px-1;
}
</style>
