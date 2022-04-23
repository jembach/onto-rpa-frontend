<template>
  <div
    class="mx-auto mt-4 rounded-lg h-24 w-56 hover:shadow-lg bg-white hover:bg-slate-50 border-solid border-2 border-primary cursor-pointer"
  >
    <div class="flex flex-col justify-between h-full">
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
