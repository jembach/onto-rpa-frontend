<template>
  <div>
    <div class="p-3 h-20">
      <div class="text-center text-xl">Semantic Operation Selector</div>

      <o-field>
        <o-input
          v-model="searchTerm"
          placeholder="omni search"
          inputClass="text-center"
        ></o-input>
      </o-field>
    </div>
    <div class="overflow-y-auto max-h-128">
      <BotOperationCard
        v-for="operation in filteredOperations"
        :operation="operation"
        :data-operation="operation.id"
        :data-bpmntype="getBpmnType(operation)"
        draggable="true"
        @dragstart="$emit('drag-operation', $event)"
        @click="$emit('click-operation', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RpaOperation } from "../../interfaces/RpaOperation";
import { rpaOperations } from "../../utils/ontologyParser";
import BotOperationCard from "./BotOperationSidebar/BotOperationCard.vue";
import { bpmnMapping } from "../../utils/bpmnMapping";

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
    getBpmnType(operation: RpaOperation): string {
      return bpmnMapping[operation.bpmoConcept];
    },
  },
  computed: {
    filteredOperations(): RpaOperation[] {
      const searchTerms = this.searchTerm.toLowerCase().split(" ");
      return Object.values(this.operations).filter((operation) =>
        searchTerms.every(
          (term) =>
            operation.id.toLowerCase().includes(term) ||
            operation.accesses?.toLowerCase().includes(term) ||
            operation.automates?.toLowerCase().includes(term)
        )
      );
    },
  },
  components: { BotOperationCard },
});
</script>
