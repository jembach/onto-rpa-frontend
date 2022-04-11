<template>
  <div
    v-if="rootNodeTypes.length > 0"
    v-for="treeNode in rootNodeTypes"
    class="ml-2"
  >
    {{ treeNode.label || treeNode.id }}
    <BotOperationTreePart :rpa-tree="rpaTree" :rootNode="treeNode.id">
    </BotOperationTreePart>
  </div>
  <div
    v-for="treeNode in rootNodeConcepts"
    v-if="rootNodeConcepts.length > 0"
    class="ml-2"
  >
    {{ getOperationsOfConcept(treeNode.id).length }}
    <div v-if="getOperationsOfConcept(treeNode.id).length > 0">
      {{ treeNode.label || treeNode.id }}
      <BotOperationCard
        v-for="operation in getOperationsOfConcept(treeNode.id)"
        :operation="operation"
        :data-operation="operation.id"
        :data-nodetype="operation.bpmoConcept"
        draggable="true"
        @dragstart="$emit('drag-operation', $event)"
        @click="$emit('click-operation', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import RpaElementExplainer from "../../RpaElementExplainer.vue";
import {
  RpaBaseElement,
  RpaOperation,
  RpaTaxonomy,
} from "../../../interfaces/RpaOperation";
import BotOperationCard from "./BotOperationCard.vue";
import {
  rpaOperations,
  rpaSoftware,
  rpaData,
} from "../../../utils/ontologyParser";

export default defineComponent({
  name: "bot-operation-tree-part",
  props: {
    rpaTree: {
      type: Object as PropType<RpaTaxonomy>,
      required: true,
    },
    rootNode: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      activeTree: rpaOperations,
    };
  },
  methods: {
    getOperationsOfConcept(conceptId: string): RpaOperation[] {
      const operations: RpaOperation[] = [];
      for (const operation in this.rpaTree.individuals) {
        const currentOperation = this.rpaTree.individuals[operation];
        if (currentOperation.concept.id === conceptId) {
          operations.push(currentOperation);
        }
      }
      return operations;
    },
  },
  computed: {
    rootNodeTypes(): RpaBaseElement[] {
      const elements = [];
      for (const element in this.rpaTree.types) {
        const currentRpaElement = this.rpaTree.types[element];
        if (currentRpaElement.type?.id === this.rootNode) {
          elements.push(currentRpaElement);
        }
      }
      return elements;
    },
    rootNodeConcepts(): RpaBaseElement[] {
      const elements = [];
      for (const element in this.rpaTree.concepts) {
        const currentRpaElement = this.rpaTree.concepts[element];
        if (currentRpaElement.type.id === this.rootNode) {
          elements.push(currentRpaElement);
        }
      }
      return elements;
    },
  },
  components: { RpaElementExplainer, BotOperationCard },
});
</script>
