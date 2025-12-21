<script setup lang="ts">
import { BotModelType } from "../../../../interfaces/BotModel";
</script>

<template>
  <ReuseArtefactSequenceInjectionPointCard
    v-if="
      botType === BotModelType.TEMPLATE_METHOD ||
      botType === BotModelType.CHAIN_OF_RESPONSIBILITY ||
      botType === BotModelType.DECORATOR
    "
    data-operation="SequenceInjectionPoint"
    data-nodetype="SequenceInjectionPoint"
    draggable="true"
    @dragstart="$emit('drag-operation', $event)"
    @click="$emit('click-operation', $event)"
    @tag-clicked="$emit('tag-clicked', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BotOperationTreePart from "./../BotOperationTreePart.vue";
import ReuseArtefactSequenceInjectionPointCard from "./ReuseArtefactSequenceInjectionPointCard.vue";

export default defineComponent({
  name: "bot-reuse-artefacts-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {},
  computed: {
    botType(): BotModelType {
      return this.$route.params.type as BotModelType;
    },
  },
  components: {
    BotOperationTreePart,
    ReuseArtefactSequenceInjectionPointCard,
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
