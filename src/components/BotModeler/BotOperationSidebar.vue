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
            v-model="showRpaReuseFacade"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">Reuse Facade</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showRpaReuseProxy"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">Reuse Proxy</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showReuseDecorator"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">Reuse Decorator</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showReuseChainOfResponsibility"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">Reuse Chain of Responsibility</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showReuseTemplateMethod"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">Reuse Template Method</span>
        </label>
        <label class="label cursor-pointer justify-start gap-1">
          <input
            type="checkbox"
            v-model="showReuseArtefacts"
            class="checkbox checkbox-sm"
          />
          <span class="truncate">Reuse Artefacts</span>
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
        <ReuseOperationFacadeTree
          v-if="showRpaReuseFacade"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></ReuseOperationFacadeTree>
        <ReuseOperationProxyTree
          v-if="showRpaReuseProxy"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></ReuseOperationProxyTree>
        <ReuseOperationDecoratorTree
          v-if="showReuseDecorator"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></ReuseOperationDecoratorTree>
        <ReuseOperationChainOfResponsibilityTree
          v-if="showReuseChainOfResponsibility"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></ReuseOperationChainOfResponsibilityTree>
        <ReuseOperationTemplateMethodTree
          v-if="showReuseTemplateMethod"
          :searchTerm="searchTerm"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></ReuseOperationTemplateMethodTree>
        <ReuseArtefactsTree
          v-if="showReuseArtefacts"
          @drag-operation="$emit('drag-operation', $event)"
          @click-operation="$emit('click-operation', $event)"
          @tag-clicked="filterForTag"
        ></ReuseArtefactsTree>
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
import ReuseOperationFacadeTree from "./BotOperationSidebar/ReuseOperationFacade/ReuseOperationFacadeTree.vue";
import ReuseOperationProxyTree from "./BotOperationSidebar/ReuseOperationProxy/ReuseOperationProxyTree.vue";
import ReuseOperationDecoratorTree from "./BotOperationSidebar/ReuseOperationDecorator/ReuseOperationDecoratorTree.vue";
import ReuseOperationChainOfResponsibilityTree from "./BotOperationSidebar/ReuseOperationChainOfResponsibility/ReuseOperationChainOfResponsibilityTree.vue";
import ReuseOperationTemplateMethodTree from "./BotOperationSidebar/ReuseOperationTemplateMethod/ReuseOperationTemplateMethodTree.vue";
import ReuseArtefactsTree from "./BotOperationSidebar/ReuseArtefacts/ReuseArtefactsTree.vue";

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
      showRpaReuseFacade: true,
      showRpaReuseProxy: true,
      showReuseDecorator: true,
      showReuseChainOfResponsibility: true,
      showReuseTemplateMethod: true,
      showReuseArtefacts: true,
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
    ReuseOperationFacadeTree,
    ReuseOperationProxyTree,
    ReuseOperationDecoratorTree,
    ReuseOperationChainOfResponsibilityTree,
    ReuseOperationTemplateMethodTree,
    ReuseArtefactsTree,
  },
});
</script>
