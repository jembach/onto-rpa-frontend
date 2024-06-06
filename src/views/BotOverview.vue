<template>
  <div class="bg-sky-700 text-center text-slate-100 py-12">
    <h1 class="text-4xl font-bold">Conceptual RPA Bot Modeler</h1>
  </div>

  <div class="bg-sky-700/70 hover:bg-sky-700/60 text-center p-4">
    <label
      class="input input-bordered flex items-center gap-2 w-full max-w-xs text-center mx-auto"
    >
      <input
        type="text"
        placeholder="Search"
        class="grow"
        v-model="searchTerm"
      />
      <FontAwesomeIcon :icon="faMagnifyingGlass" />
    </label>
  </div>

  <div class="flex justify-center">
    <router-link :to="{ name: 'Modeler' }" v-if="!searchTerm">
      <BotOverviewCard></BotOverviewCard>
    </router-link>
    <BotOverviewCard
      v-for="botModel in filteredOperations"
      :botModel="botModel"
    >
    </BotOverviewCard>
    <div v-if="searchTerm && filteredOperations.length === 0" class="m-4">
      No Bots found.
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "overview",
  data() {
    return {
      botModels: [] as BotModel[],
      searchTerm: "",
    };
  },
  async mounted(): Promise<void> {
    this.botModels = await botModelApi.getBotModels();
  },
  methods: {
    clearSearchTerm() {
      this.searchTerm = "";
    },
  },
  computed: {
    filteredOperations() {
      if (!this.searchTerm) {
        return this.botModels;
      }

      const searchTerms = this.searchTerm.toLowerCase().split(" ");
      return this.botModels.filter((botModel) =>
        searchTerms.every((term) => {
          let foundTerm = false;
          for (const node in botModel.nodeInfo) {
            if (botModel.nodeInfo[node].concept.toLowerCase().includes(term)) {
              foundTerm = true;
            }
          }
          return foundTerm;
        })
      );
    },
  },
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
import botModelApi from "../api/botModelApi";
import BotOverviewCard from "../components/BotOverview/BotOverviewCard.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import BotModel from "../utils/BotModel";
</script>
