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
      <div
        v-for="operation in filteredOperations"
        class="relative mx-auto my-6 rounded-lg h-20 w-44 shadow-md border-solid border-2 border-blue-500 cursor-pointer"
      >
        <div class="absolute top-1/2 -mt-3 w-full text-center">
          {{ operation.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RpaOperation } from "../interfaces/RpaOperation";
import { rpaOperations } from "../utils/ontologyParser";
export default defineComponent({
  name: "bot-operation-sidebar",
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
      const searchTerms = this.searchTerm.split(" ");
      return Object.values(this.operations).filter((operation) =>
        searchTerms.every((term) => operation.name.includes(term))
      );
    },
  },
});
</script>
