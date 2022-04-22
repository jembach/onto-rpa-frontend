<template>
  <div>
    <div class="p-3 h-28">
      <div class="text-center text-xl">Semantic Operation Selector</div>
      <o-field>
        <o-input
          v-model="searchTerm"
          placeholder="omni search"
          inputClass="text-center"
          icon-right="xmark"
          icon-right-clickable
          @icon-right-click="clearSearchTerm"
        ></o-input>
      </o-field>
    </div>
    <div class="overflow-auto max-h-104">
      <o-tabs v-model="activeTab">
        <o-tab-item value="0" label="Operations">
          <BotOperationTree
            :searchTerm="searchTerm"
            @drag-operation="$emit('drag-operation', $event)"
            @click-operation="$emit('click-operation', $event)"
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
  },
  components: { BotOperationTree, BotContextContainerCard },
});
</script>
