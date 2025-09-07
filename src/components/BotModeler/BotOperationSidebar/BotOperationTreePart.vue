<template>
  <div v-for="treeNode in subtypesOfRoot">
    <div
      class="collapse"
      v-bind:class="{ hidden: !nodeVisibility[treeNode.id] }"
    >
      <input type="checkbox" class="min-h-0" checked />
      <div class="collapse-title text-md p-0 pt-1 min-h-0">
        <RpaElementExplainer
          :rpa-element="treeNode"
          position="bottom"
        ></RpaElementExplainer>
      </div>
      <div class="collapse-content pb-0">
        <div class="card-content">
          <div class="content">
            <div v-bind:class="{ hidden: !nodeVisibility[treeNode.id] }">
              <BotOperationTreePart
                :rpa-tree="rpaTree"
                :rootNode="treeNode.id"
                :search-term="searchTerm"
                @drag-operation="$emit('drag-operation', $event)"
                @click-operation="$emit('click-operation', $event)"
                @node-visibility="setNodeVisibility"
                @tag-clicked="$emit('tag-clicked', $event)"
              >
              </BotOperationTreePart>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="operationsOfRoot.length > 0"
    v-for="operation in filteredOperations"
    class="ml-2"
  >
    <BotOperationCard
      :operation="operation"
      :data-operation="operation.id"
      :data-nodetype="operation.bpmoConcept"
      draggable="true"
      @dragstart="$emit('drag-operation', $event)"
      @click="$emit('click-operation', $event)"
      @tag-clicked="$emit('tag-clicked', $event)"
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

export default defineComponent({
  name: "bot-operation-tree-part",
  emits: [
    "drag-operation",
    "click-operation",
    "node-visibility",
    "tag-clicked",
  ],
  props: {
    rpaTree: {
      type: Object as PropType<RpaTaxonomy>,
      required: true,
    },
    rootNode: {
      type: String,
      required: true,
    },
    searchTerm: String,
  },
  data() {
    return {
      activeTree: this.rpaTree,
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
    this.operationsOfRoot = this.getOperationsOfConcept(this.rootNode);
    if (
      this.subtypesOfRoot.length === 0 &&
      this.operationsOfRoot.length === 0
    ) {
      this.emitNodeVisibility(false);
    }
  },
  methods: {
    getOperationsOfConcept(conceptId: string): RpaOperation[] {
      const operations: RpaOperation[] = [];
      for (const operation in this.rpaTree.individuals) {
        const currentOperation = this.rpaTree.individuals[operation];
        if (currentOperation.concept.id === conceptId) {
          operations.push(currentOperation as RpaOperation);
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
    setNodeVisibility(e: any) {
      const [node, visibility] = e;
      this.nodeVisibility[node] = visibility;
    },
    emitNodeVisibility(visible: boolean) {
      this.$emit("node-visibility", [this.rootNode, visible]);
    },
  },
  computed: {
    filteredOperations(): RpaOperation[] {
      if (!this.searchTerm) {
        return this.operationsOfRoot;
      }

      const searchTerms = this.searchTerm.toLowerCase().split(" ");
      const filteredOperations = Object.values(this.operationsOfRoot).filter(
        (operation) =>
          searchTerms.every(
            (term) =>
              operation.id.toLowerCase().includes(term) ||
              operation.accessedData.some((dataRelation) =>
                dataRelation.data.id.toLowerCase().includes(term)
              ) ||
              operation.automates?.id.toLowerCase().includes(term) ||
              operation.concept.id.toLowerCase().includes(term)
          )
      );
      this.emitNodeVisibility(filteredOperations.length > 0);
      return filteredOperations;
    },
  },
  watch: {
    nodeVisibility: {
      handler(newVisibility, oldVisibility) {
        const currentVisibilities = Object.values(newVisibility);
        this.emitNodeVisibility(
          currentVisibilities.some((visibility) => visibility)
        );
      },
      deep: true,
    },
  },
  components: { RpaElementExplainer, BotOperationCard },
});
</script>
<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons";
</script>
