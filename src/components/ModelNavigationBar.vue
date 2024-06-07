<template>
  <div
    class="bg-sky-500 text-center text-slate-100 h-8 flex-initial flex justify-around shadow-md z-40"
  >
    <div v-if="botModelId">
      <div role="tablist" class="tabs h-full">
        <router-link
          role="tab"
          class="tab"
          :class="{
            'tab-active': $route.name === 'Modeler',
          }"
          :to="{ name: 'Modeler', params: { modelId: botModelId } }"
        >
          <FontAwesomeIcon :icon="faPencil" class="mr-2" /> Modeler
        </router-link>
        <router-link
          role="tab"
          class="tab"
          :class="{
            'tab-active': $route.name === 'ModelAbstractor',
          }"
          :to="{
            name: 'ModelAbstractor',
            params: { modelId: botModelId },
          }"
        >
          <FontAwesomeIcon :icon="faBinoculars" class="mr-2" /> Abstraction
        </router-link>
        <router-link
          role="tab"
          class="tab"
          :class="{
            'tab-active': $route.name === 'ModelMetrics',
          }"
          :to="{
            name: 'ModelMetrics',
            params: { modelId: botModelId },
          }"
        >
          <FontAwesomeIcon :icon="faRuler" class="mr-2" /> Metrics
        </router-link>
      </div>
    </div>
    <div v-else>
      <i>Please save the model to use the other functionalities.</i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faBinoculars } from "@fortawesome/free-solid-svg-icons";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { faRuler } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ botModelId?: string }>();
</script>

<style scoped>
.tab {
  @apply text-slate-100 w-48 hover:bg-sky-400;
}
.tab-active {
  @apply bg-sky-300 text-slate-700;
}
</style>
