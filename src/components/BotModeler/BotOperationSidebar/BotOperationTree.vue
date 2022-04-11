<template>
  <BotOperationTreePart
    :rpa-tree="activeTree"
    :root-node="treeRootNode"
  ></BotOperationTreePart>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaOperation, RpaTaxonomy } from "../../../interfaces/RpaOperation";
import {
  rpaOperations,
  rpaSoftware,
  rpaData,
} from "../../../utils/ontologyParser";
import BotOperationTreePart from "./BotOperationTreePart.vue";

export default defineComponent({
  name: "bot-operation-tree",
  props: {
    treeCriteria: {
      type: String,
      default: "operations",
    },
  },
  data() {
    return {
      activeTree: rpaOperations as RpaTaxonomy,
      treeRootNode: "rpa-operation",
    };
  },
  mounted() {
    console.log(this.activeTree);
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
