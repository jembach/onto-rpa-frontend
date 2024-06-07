<template>
  <BotDataTreePart
    :rpa-tree="activeTree"
    :root-node="treeRootNode"
    :search-term="searchTerm"
    @drag-operation="$emit('drag-operation', $event)"
    @click-operation="$emit('click-operation', $event)"
    @tag-clicked="$emit('tag-clicked', $event)"
    @hover-operation="$emit('hover-operation', $event)"
  ></BotDataTreePart>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaTaxonomy } from "../../../interfaces/RpaOperation";
import { rpaData } from "../../../utils/ontologyParser";
import BotDataTreePart from "./BotDataTreePart.vue";

export default defineComponent({
  name: "bot-data-tree",
  emits: [
    "drag-operation",
    "click-operation",
    "tag-clicked",
    "hover-operation",
  ],
  props: {
    treeCriteria: {
      type: String,
      default: "operations",
    },
    searchTerm: String,
  },
  data() {
    return {
      activeTree: rpaData as RpaTaxonomy,
      treeRootNode: "data",
    };
  },
  mounted() {
    console.log(rpaData);
  },
  components: { BotDataTreePart },
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
