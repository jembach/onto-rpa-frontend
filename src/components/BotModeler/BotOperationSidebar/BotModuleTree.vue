<template>
  <div v-for="module in filteredRpaModules" :key="module.id">
    <BotModuleCard
      :module="module"
      :data-operation="module.label"
      data-nodetype="Module"
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
import BotModuleCard from "./BotModuleCard.vue";
import { RpaModule } from "../../../interfaces/RpaOperation";
import { rpaModules } from "../../../utils/ontologyParser";

export default defineComponent({
  name: "bot-module-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {
    searchTerm: String,
  },
  data() {
    return {
      rpaModules: Object.values(rpaModules) as RpaModule[],
    };
  },
  computed: {
    filteredRpaModules(): RpaModule[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.rpaModules;
      }
      const lowerSearch = this.searchTerm.toLowerCase();
      return this.rpaModules.filter(
        (module) =>
          (module.label && module.label.toLowerCase().includes(lowerSearch)) ||
          (module.comment && module.comment.toLowerCase().includes(lowerSearch))
      );
    },
  },
  components: { BotOperationTreePart, BotModuleCard },
});
</script>
