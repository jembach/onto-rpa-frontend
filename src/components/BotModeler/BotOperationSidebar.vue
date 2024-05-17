<template>
  <div class="relative">
    <div class="p-2 h-20 mt-1 text-center">
      <div class="text-center text-xl">Semantic Operation Selector</div>

      <input
        type="text"
        class="input input-bordered text-center mt-2 mb-2 w-11/12 mx-auto"
        v-model="searchTerm"
        placeholder="Search operation, concept, application, ..."
      />
    </div>
    <div class="overflow-y-scroll absolute w-full bottom-0 top-24 mt-2 px-2">
      <div role="tablist" class="tabs tabs-bordered">
        <input
          type="radio"
          name="operation_tabs"
          role="tab"
          class="tab"
          aria-label="Operations"
          checked
        />
        <div role="tabpanel" class="tab-content">
          <BotOperationTree
            :searchTerm="searchTerm"
            @drag-operation="$emit('drag-operation', $event)"
            @click-operation="$emit('click-operation', $event)"
            @tag-clicked="filterForTag"
          ></BotOperationTree>
        </div>

        <input
          type="radio"
          name="operation_tabs"
          role="tab"
          class="tab"
          aria-label="Data"
          checked
        />
        <div role="tabpanel" class="tab-content">
          <BotDataTree
            :searchTerm="searchTerm"
            @drag-operation="$emit('drag-operation', $event)"
            @click-operation="$emit('click-operation', $event)"
            @tag-clicked="filterForTag"
          ></BotDataTree>
        </div>

        <input
          type="radio"
          name="operation_tabs"
          role="tab"
          class="tab"
          aria-label="Containers"
        />
        <div role="tabpanel" class="tab-content">
          <BotContextContainerCard
            v-for="container in contextContainers"
            :container="container"
            :data-operation="container.id"
            data-nodetype="CompoundActivity"
            draggable="true"
            @dragstart="$emit('drag-operation', $event)"
            @click="$emit('click-operation', $event)"
          >
          </BotContextContainerCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { rpaContextContainers } from "../../utils/ontologyParser";
import BotOperationTree from "./BotOperationSidebar/BotOperationTree.vue";
import BotDataTree from "./BotOperationSidebar/BotDataTree.vue";
import BotContextContainerCard from "./BotOperationSidebar/BotContextContainerCard.vue";

export default defineComponent({
  name: "bot-operation-sidebar",
  emits: ["drag-operation", "click-operation"],
  data() {
    return {
      searchTerm: "",
      activeTab: "0",
      contextContainers: Object.values(rpaContextContainers),
    };
  },
  methods: {
    clearSearchTerm() {
      this.searchTerm = "";
    },
    filterForTag(event) {
      this.searchTerm += " " + event;
    },
  },
  components: { BotOperationTree, BotDataTree, BotContextContainerCard },
});
</script>
