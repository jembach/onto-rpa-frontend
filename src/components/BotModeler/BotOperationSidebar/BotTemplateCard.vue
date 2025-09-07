<template>
  <div
    class="mx-auto mt-4 rounded-lg h-24 w-56 hover:shadow-lg bg-white hover:bg-slate-50 border-solid border-2 border-primary cursor-pointer"
  >
    <div class="flex flex-col justify-center h-full">
      <div class="w-full text-center">
        {{ template.name || template._id }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import BotModel from "../../../interfaces/BotModel";
export default defineComponent({
  name: "bot-template-container-card",
  props: {
    template: {
      type: Object as PropType<BotModel>,
      required: true,
    },
  },
  data() {
    return {
      explanationPosition: "bottom",
    };
  },
  components: {},
});
</script>
