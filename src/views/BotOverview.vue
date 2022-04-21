<template>
  <div class="bg-sky-700 text-center text-slate-200 py-12">
    <h1 class="text-4xl font-bold">Conceptual RPA Bot Modeler</h1>
  </div>
  <o-collapse :open="false" animation="slide">
    <template #trigger="props">
      <div class="bg-sky-600 text-center text-slate-100 p-1">
        <o-icon v-if="props.open" icon="caret-up"> </o-icon>
        <o-icon v-else icon="magnifying-glass"> </o-icon>
      </div>
    </template>
    <div class="bg-sky-600">
      <div class="content">
        <div class="p-4 text-center">
          <o-field>
            <o-input
              v-model="searchTerm"
              placeholder="Bot Analyzer Search"
              inputClass="text-center"
              icon-right="xmark"
              icon-right-clickable
              @icon-right-click="clearSearchTerm"
            ></o-input>
          </o-field>
        </div>
      </div>
    </div>
  </o-collapse>

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
          for (const node in botModel.processTree.nodeInfo) {
            if (
              botModel.processTree.nodeInfo[node].concept
                .toLowerCase()
                .includes(term)
            ) {
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
import BotModel from "../interfaces/BotModel";
import BotOverviewCard from "../components/BotOverview/BotOverviewCard.vue";
</script>
