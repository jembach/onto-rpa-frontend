<template>
  <BotOperationTreePart
    :rpa-tree="activeTree"
    :root-node="treeRootNode"
    :search-term="searchTerm"
    @drag-operation="$emit('drag-operation', $event)"
    @click-operation="$emit('click-operation', $event)"
    @tag-clicked="$emit('tag-clicked', $event)"
  ></BotOperationTreePart>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaTaxonomy } from "../../../interfaces/RpaOperation";
import { rpaOperations } from "../../../utils/ontologyParser";
import BotOperationTreePart from "./BotOperationTreePart.vue";

export default defineComponent({
  name: "bot-operation-tree",
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
      activeTree: rpaOperations as RpaTaxonomy,
      treeRootNode: "rpa-operation",
    };
  },
  components: { BotOperationTreePart },
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
