<template>
  <div
    class="relative m-6 rounded-lg h-20 w-44 shadow-md border-solid border-2 border-sky-700 cursor-pointer"
  >
    {{ botModel.name }}
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import BotModel from "../interfaces/BotModel";
export default defineComponent({
  name: "bot-operation-sidebar",
  props: {
    botModel: {
      type: Object as PropType<BotModel>,
      required: true,
    },
  },
});
</script>
