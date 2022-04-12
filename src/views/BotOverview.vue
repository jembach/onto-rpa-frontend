<template>
  <div class="bg-sky-700 text-center text-slate-200 py-12">
    <h1 class="text-4xl font-bold">Conceptual RPA Bot Modeler</h1>
  </div>
  <div>
    <div class="flex justify-center">
      <router-link :to="{ name: 'Modeler' }">
        <BotOverviewCard></BotOverviewCard>
      </router-link>
      <router-link
        v-for="botModel in botModels"
        :to="{ name: 'Modeler', params: { modelId: botModel._id } }"
        ><BotOverviewCard :botModel="botModel"> </BotOverviewCard
      ></router-link>
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "overview",
  data() {
    return {
      botModels: [] as BotModel[],
    };
  },
  async mounted(): Promise<void> {
    this.botModels = await botModelApi.getBotModels();
  },
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
import botModelApi from "../api/botModelApi";
import BotModel from "../interfaces/BotModel";
import BotOverviewCard from "../components/BotOverviewCard.vue";
</script>
