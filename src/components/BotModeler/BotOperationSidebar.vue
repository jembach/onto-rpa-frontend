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
      <BotOperationTree
        :searchTerm="searchTerm"
        @drag-operation="$emit('drag-operation', $event)"
        @click-operation="$emit('click-operation', $event)"
      ></BotOperationTree>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BotOperationTree from "./BotOperationSidebar/BotOperationTree.vue";

export default defineComponent({
  name: "bot-operation-sidebar",
  emits: ["drag-operation", "click-operation"],
  data() {
    return {
      searchTerm: "",
    };
  },
  methods: {
    clearSearchTerm() {
      this.searchTerm = "";
    },
  },
  components: { BotOperationTree },
});
</script>
