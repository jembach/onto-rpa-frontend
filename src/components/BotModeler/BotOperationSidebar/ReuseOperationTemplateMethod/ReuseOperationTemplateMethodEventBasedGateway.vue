<template>
  <div
    class="mx-auto mt-4 rounded-lg h-24 w-56 hover:shadow-lg bg-white hover:bg-slate-50 border-solid border-2 border-primary cursor-pointer"
  >
    <div class="flex flex-col justify-center h-full">
      <div class="w-full text-center">
        Event Based Gateway: {{ templateMethod.label || templateMethod.id }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaReuseTemplateMethod } from "../../../../interfaces/RpaOperation";

export default defineComponent({
  name: "bot-template-method-container-event-based-gateway-card",
  props: {
    templateMethod: {
      type: Object as PropType<RpaReuseTemplateMethod>,
      required: true,
    },
  },
  components: {},
});
</script>
