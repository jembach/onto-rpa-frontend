<template>
  <div class="relative">
    <div class="p-2 h-20 mt-1 text-center">
      <div class="text-center text-xl">Semantic Operation Selector</div>
      <o-field>
        <o-input
          v-model="searchTerm"
          placeholder="Search operation, concept, application, ..."
          inputClass="text-center"
          rootClass="mt-2 mb-2 w-11/12 mx-auto"
        ></o-input>
      </o-field>
    </div>
    <div class="overflow-y-scroll absolute w-full bottom-0 top-24 mt-2 px-2">
      <o-tabs
        v-model="activeTab"
        class="w-full"
        tabItemWrapperClass="grow"
        navTabsClass="sticky top-0 z-50 bg-white relative"
        variant="primary"
      >
        <o-tab-item value="0" label="Operations">
          <BotOperationTree
            :searchTerm="searchTerm"
            @drag-operation="$emit('drag-operation', $event)"
            @click-operation="$emit('click-operation', $event)"
            @tag-clicked="filterForTag"
          ></BotOperationTree>
        </o-tab-item>

        <o-tab-item value="1" label="Containers">
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
        </o-tab-item>
      </o-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { rpaContextContainers } from "../../utils/ontologyParser";
import BotOperationTree from "./BotOperationSidebar/BotOperationTree.vue";
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
  components: { BotOperationTree, BotContextContainerCard },
});
</script>
