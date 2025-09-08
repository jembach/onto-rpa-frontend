<script setup lang="ts">
import { BotModelType } from "../../../interfaces/BotModel";
</script>

<template>
  <div v-for="template in filteredRpaTemplates" :key="template.id">
    <BotTemplateCard
      :template="template"
      :data-operation="template.label"
      data-nodetype="Template"
      draggable="true"
      @dragstart="$emit('drag-operation', $event)"
      @click="$emit('click-operation', $event)"
      @tag-clicked="$emit('tag-clicked', $event)"
    />
  </div>
  <BotTemplatePlaceholderCard
    v-if="botType === BotModelType.TEMPLATE"
    data-operation="TemplatePlaceholder"
    data-nodetype="TemplatePlaceholder"
    draggable="true"
    @dragstart="$emit('drag-operation', $event)"
    @click="$emit('click-operation', $event)"
    @tag-clicked="$emit('tag-clicked', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BotOperationTreePart from "./BotOperationTreePart.vue";
import BotTemplateCard from "./BotTemplateCard.vue";
import BotTemplatePlaceholderCard from "./BotTemplatePlaceholderCard.vue";
import { RpaTemplate } from "../../../interfaces/RpaOperation";
import { getRpaTemplates } from "../../../utils/ontologyParser";

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
      rpaTemplates: [] as RpaTemplate[],
    };
  },
  computed: {
    botType(): BotModelType {
      return this.$route.params.type as BotModelType;
    },
    filteredRpaTemplates(): RpaTemplate[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.rpaTemplates;
      }
      const lowerSearch = this.searchTerm.toLowerCase();
      return this.rpaTemplates.filter(
        (template) =>
          (template.label &&
            template.label.toLowerCase().includes(lowerSearch)) ||
          (template.comment &&
            template.comment.toLowerCase().includes(lowerSearch))
      );
    },
  },
  async mounted() {
    this.rpaTemplates = Object.values(await getRpaTemplates()) as RpaTemplate[];
  },
  components: {
    BotOperationTreePart,
    BotTemplateCard,
    BotTemplatePlaceholderCard,
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
