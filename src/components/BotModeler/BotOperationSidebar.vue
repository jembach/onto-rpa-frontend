<template>
  <div class="flex flex-col h-full overflow-scroll">
    <div class="p-2 mt-1 text-center">
      <div class="text-center text-xl">Semantic Operation Selector</div>
      <input
        type="text"
        class="input input-bordered text-center mt-2 mb-2 w-11/12 mx-auto"
        v-model="searchTerm"
        placeholder="Search operation, concept, application, ..."
      />
      <fieldset
        class="fieldset border-base-300 rounded-box text border p-4 mb-2 mx-auto"
      >
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showOperationTree"
            class="checkbox checkbox-sm"
          />
          <span>Operations</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showDataTree"
            class="checkbox checkbox-sm"
          />
          <span>Data</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showContextContainers"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">Context Containers</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showRpaModule"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">RPA Module</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showRpaTemplate"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">RPA Template</span>
        </label>
      </fieldset>
    </div>
    <div class="overflow-y-auto flex-1 w-full mt-2 px-2 flex-shrink">
      <div role="tablist" class="tabs tabs-bordered">
        <BotOperationTree
          v-if="showOperationTree"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></BotOperationTree>
        <BotDataTree
          v-if="showDataTree"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></BotDataTree>
        <BotContextContainerCard
          v-if="showContextContainers"
          v-for="container in contextContainers"
          :key="container.id"
          :container="container"
          :data-operation="container.id"
          data-nodetype="CompoundActivity"
          draggable="true"
          @dragstart="$emit('drag-operation', $event)"
          @click="$emit('click-operation', $event)"
        />
        <BotModuleTree
          v-if="showRpaModule"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></BotModuleTree>
        <BotTemplateTree
          v-if="showRpaTemplate"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></BotTemplateTree>
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
import BotModuleTree from "./BotOperationSidebar/BotModuleTree.vue";
import BotTemplateTree from "./BotOperationSidebar/BotTemplateTree.vue";

export default defineComponent({
  name: "bot-operation-sidebar",
  emits: ["drag-operation", "click-operation"],
  data() {
    return {
      searchTerm: "",
      activeTab: "0",
      contextContainers: Object.values(rpaContextContainers),
      showOperationTree: true,
      showDataTree: true,
      showContextContainers: true,
      showRpaModule: true,
      showRpaTemplate: true,
    };
  },
  methods: {
    clearSearchTerm() {
      this.searchTerm = "";
    },
    filterForTag(event: string) {
      this.searchTerm += " " + event;
    },
  },
  components: {
    BotOperationTree,
    BotDataTree,
    BotContextContainerCard,
    BotModuleTree,
    BotTemplateTree,
  },
});
</script>
