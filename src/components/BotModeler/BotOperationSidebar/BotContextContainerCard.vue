<template>
  <div
    class="ml-2 my-2 rounded-lg h-20 w-44 shadow-md border-solid border-2 border-blue-500 cursor-pointer"
  >
    <div class="flex flex-col justify-between">
      <div class="operation-tagline">
        <RpaElementExplainer
          v-for="step in container.setupSteps"
          :rpa-element="step"
          :position="explanationPosition"
        ></RpaElementExplainer>
      </div>
      <div class="w-full text-center">
        {{ container.label || container.id }}
      </div>
      <div class="operation-tagline">
        <RpaElementExplainer
          v-for="step in container.cleanupSteps"
          :rpa-element="step"
          :position="explanationPosition"
        ></RpaElementExplainer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaContextContainer } from "../../../interfaces/RpaOperation";
import RpaElementExplainer from "../../RpaElementExplainer.vue";
export default defineComponent({
  name: "bot-context-container-card",
  props: {
    container: {
      type: Object as PropType<RpaContextContainer>,
      required: true,
    },
  },
  data() {
    return {
      explanationPosition: "bottom",
    };
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
