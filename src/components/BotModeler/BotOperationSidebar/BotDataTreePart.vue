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
              <BotDataTreePart
                :rpa-tree="rpaTree"
                :rootNode="treeNode.id"
                :search-term="searchTerm"
                @drag-operation="$emit('drag-operation', $event)"
                @click-operation="$emit('click-operation', $event)"
                @node-visibility="setNodeVisibility"
                @tag-clicked="$emit('tag-clicked', $event)"
              >
              </BotDataTreePart>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="dataOfRoot.length > 0"
    v-for="operation in filteredData"
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
  RpaData,
  RpaOperation,
  RpaTaxonomy,
} from "../../../interfaces/RpaOperation";
import BotOperationCard from "./BotOperationCard.vue";

export default defineComponent({
  name: "bot-data-tree-part",
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
      dataOfRoot: [] as RpaData[],
    };
  },
  mounted() {
    this.subtypesOfRoot = this.getRootNodeTypes();
    this.subtypesOfRoot = this.subtypesOfRoot.concat(
      this.getRootNodeConcepts()
    );
    this.dataOfRoot = this.getDataOfConcept(this.rootNode);
    if (this.subtypesOfRoot.length === 0 && this.dataOfRoot.length === 0) {
      this.emitNodeVisibility(false);
    }
  },
  methods: {
    getDataOfConcept(conceptId: string): RpaData[] {
      const datas: RpaData[] = [];
      for (const data in this.rpaTree.individuals) {
        const currentData = this.rpaTree.individuals[data];
        if (currentData.concept.id === conceptId) {
          datas.push(currentData);
        }
      }
      return datas;
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
    filteredData(): RpaData[] {
      if (!this.searchTerm) {
        return this.dataOfRoot;
      }

      const searchTerms = this.searchTerm.toLowerCase().split(" ");
      const filteredData = Object.values(this.dataOfRoot).filter((data) =>
        searchTerms.every(
          (term) =>
            data.id.toLowerCase().includes(term) ||
            data.concept.id.toLowerCase().includes(term)
        )
      );
      this.emitNodeVisibility(filteredData.length > 0);
      return filteredData;
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
