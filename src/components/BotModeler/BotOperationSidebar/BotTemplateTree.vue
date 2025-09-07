<template>
  <div v-for="template in filteredBotTemplates" :key="template._id">
    <BotTemplateCard
      :template="template"
      :data-operation="template.name"
      data-nodetype="Template"
      draggable="true"
      @dragstart="$emit('drag-operation', $event)"
      @click="$emit('click-operation', $event)"
      @tag-clicked="$emit('tag-clicked', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BotOperationTreePart from "./BotOperationTreePart.vue";
import botModelApi from "../../../api/botModelApi";
import BotModel, { BotModelType } from "../../../interfaces/BotModel";
import BotTemplateCard from "./BotTemplateCard.vue";

export default defineComponent({
  name: "bot-template-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {
    treeCriteria: {
      type: String,
      default: "operations",
    },
    searchTerm: String,
  },
  data() {
    return {
      botTemplates: [] as BotModel[],
    };
  },
  computed: {
    filteredBotTemplates(): BotModel[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.botTemplates;
      }
      const lowerSearch = this.searchTerm.toLowerCase();
      return this.botTemplates.filter(
        (template) =>
          template.name.toLowerCase().includes(lowerSearch) ||
          (template.description &&
            template.description.toLowerCase().includes(lowerSearch))
      );
    },
  },
  async mounted(): Promise<void> {
    this.botTemplates = await botModelApi.getBotModels(BotModelType.TEMPLATE);
  },
  components: { BotOperationTreePart, BotTemplateCard },
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
