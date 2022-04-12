<template>
  <div>
    <div class="p-3 h-28">
      <div class="text-center text-xl">Semantic Operation Selector</div>
      <o-field>
        <o-input
          v-model="searchTerm"
          placeholder="omni search"
          inputClass="text-center"
        ></o-input>
      </o-field>
    </div>
    <div class="overflow-auto max-h-104">
      <BotOperationTree
        @drag-operation="$emit('drag-operation', $event)"
        @click-operation="$emit('click-operation', $event)"
      ></BotOperationTree>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RpaOperation } from "../../interfaces/RpaOperation";
import { rpaOperations } from "../../utils/ontologyParser";
import BotOperationCard from "./BotOperationSidebar/BotOperationCard.vue";
import BotOperationTree from "./BotOperationSidebar/BotOperationTree.vue";

export default defineComponent({
  name: "bot-operation-sidebar",
  emits: ["drag-operation", "click-operation"],
  data() {
    return {
      operations: rpaOperations.individuals,
      searchTerm: "",
    };
  },
  methods: {
    filterOperations: function () {},
  },
  computed: {
    filteredOperations(): RpaOperation[] {
      const searchTerms = this.searchTerm.toLowerCase().split(" ");
      return Object.values(this.operations).filter((operation) =>
        searchTerms.every(
          (term) =>
            operation.id.toLowerCase().includes(term) ||
            operation.accesses?.id.toLowerCase().includes(term) ||
            operation.automates?.id.toLowerCase().includes(term) ||
            operation.concept.id.toLowerCase().includes(term)
        )
      );
    },
  },
  components: { BotOperationCard, BotOperationTree },
});
</script>
