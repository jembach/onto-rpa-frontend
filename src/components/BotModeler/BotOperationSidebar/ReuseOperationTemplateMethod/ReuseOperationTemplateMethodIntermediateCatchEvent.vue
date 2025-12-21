<template>
  <div
    class="mx-auto mt-4 rounded-lg h-24 w-56 hover:shadow-lg bg-white hover:bg-slate-50 border-solid border-2 border-primary cursor-pointer"
  >
    <div class="flex flex-col justify-center h-full">
      <div class="w-full text-center">
        Start
        {{ injectionPoint.label || injectionPoint.id }} -
        {{ templateMethod.label || templateMethod.id }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaReuseTemplateMethod } from "../../../../interfaces/RpaOperation";
import { ReuseArtefactSequenceInjectionPoint } from "../../../../interfaces/BotModel";

export default defineComponent({
  name: "bot-template-method-container-intermediate-catch-event-card",
  props: {
    templateMethod: {
      type: Object as PropType<RpaReuseTemplateMethod>,
      required: true,
    },
    injectionPoint: {
      type: Object as PropType<ReuseArtefactSequenceInjectionPoint>,
      required: true,
    },
  },
  components: {},
});
</script>
