<template>
  <div
    v-if="childTypesOfRoot.length > 0"
    v-for="treeNode in childTypesOfRoot"
    class="ml-2"
  >
    <div v-if="nodeVisibility[treeNode.id]">
      {{ treeNode.label || treeNode.id }}
      <BotOperationTreePart
        :rpa-tree="rpaTree"
        :rootNode="treeNode.id"
        @drag-operation="$emit('drag-operation', $event)"
        @click-operation="$emit('click-operation', $event)"
        @no-operations="hideNode"
      >
      </BotOperationTreePart>
    </div>
  </div>
  <div
    v-for="treeNode in childConceptsOfRoot"
    v-if="childConceptsOfRoot.length > 0"
    class="ml-2"
  >
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
  emits: ["drag-operation", "click-operation", "no-operations"],
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
      nodeVisibility: {} as Record<string, boolean>,
      childTypesOfRoot: [] as RpaBaseElement[],
      childConceptsOfRoot: [] as RpaBaseElement[],
    };
  },
  mounted() {
    this.childTypesOfRoot = this.getRootNodeTypes();
    this.childConceptsOfRoot = this.getRootNodeConcepts();
    if (
      this.childTypesOfRoot.length === 0 &&
      this.childConceptsOfRoot.length === 0
    ) {
      this.$emit("no-operations", this.rootNode);
    }
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
    getRootNodeTypes(): RpaBaseElement[] {
      const elements = [];
      for (const element in this.rpaTree.types) {
        const currentRpaElement = this.rpaTree.types[element];
        if (currentRpaElement.type?.id === this.rootNode) {
          elements.push(currentRpaElement);
          this.nodeVisibility[currentRpaElement.id] = true;
        }
      }
      return elements;
    },
    getRootNodeConcepts(): RpaBaseElement[] {
      const elements = [];
      for (const element in this.rpaTree.concepts) {
        const currentRpaElement = this.rpaTree.concepts[element];
        if (currentRpaElement.type.id === this.rootNode) {
          elements.push(currentRpaElement);
        }
      }
      return elements;
    },
    hideNode(e) {
      this.nodeVisibility[e] = false;
      this.checkChildVisibility();
    },
    checkChildVisibility() {
      for (const element in this.nodeVisibility) {
        if (this.nodeVisibility[element]) {
          return;
        }
      }
      this.$emit("no-operations", this.rootNode);
    },
  },

  components: { RpaElementExplainer, BotOperationCard },
});
</script>
