<template>
  <div
    class="relative m-6 rounded-lg h-20 w-44 shadow-md border-solid border-2 border-action cursor-pointer text-center flex flex-col justify-center"
    :class="[botModel ? 'border-sky-700' : 'border-action']"
  >
    <div v-if="botModel">
      {{ botModel.name }}
    </div>
    <div v-else><o-icon icon="plus"></o-icon></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import BotModel from "../../interfaces/BotModel";
export default defineComponent({
  name: "bot-operation-sidebar",
  props: {
    botModel: Object as PropType<BotModel>,
  },
});
</script>
