<template>
  <div
    v-if="subtypesOfRoot.length > 0"
    v-for="treeNode in subtypesOfRoot"
    class="ml-2"
  >
    <o-collapse v-if="nodeVisibility[treeNode.id]" :open="false">
      <template #trigger="props">
        <div>
          <o-icon v-if="props.open" icon="caret-down"> </o-icon>
          <o-icon v-else icon="caret-right"> </o-icon>
          <span class="ml-1">{{ treeNode.label || treeNode.id }}</span>
        </div>
      </template>
      <div class="card-content">
        <div class="content">
          <div v-if="nodeVisibility[treeNode.id]">
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
      </div>
    </o-collapse>
  </div>
  <div
    v-if="operationsOfRoot.length > 0"
    v-for="operation in operationsOfRoot"
    class="ml-2"
  >
    <BotOperationCard
      :operation="operation"
      :data-operation="operation.id"
      :data-nodetype="operation.bpmoConcept"
      draggable="true"
      @dragstart="$emit('drag-operation', $event)"
      @click="$emit('click-operation', $event)"
    />
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
      subtypesOfRoot: [] as RpaBaseElement[],
      operationsOfRoot: [] as RpaOperation[],
    };
  },
  mounted() {
    this.subtypesOfRoot = this.getRootNodeTypes();
    this.subtypesOfRoot = this.subtypesOfRoot.concat(
      this.getRootNodeConcepts()
    );
    console.log(this.rootNode);
    console.log(this.subtypesOfRoot);
    this.operationsOfRoot = this.getOperationsOfConcept(this.rootNode);
    if (
      this.subtypesOfRoot.length === 0 &&
      this.operationsOfRoot.length === 0
    ) {
      console.log("no elements for " + this.rootNode);
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
          this.nodeVisibility[currentRpaElement.id] = true;
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
