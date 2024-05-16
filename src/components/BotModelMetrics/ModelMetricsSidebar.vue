<template>
  <div class="relative">
    <div class="p-2 mt-1 text-center">
      <div class="text-center text-xl">Model Metrics</div>
    </div>

    <div class="w-full mt-2 px-4">
      <ModelMetricEntry
        v-for="modelMetric in props.modelMetrics"
        :key="modelMetric.name"
        :modelMetric="modelMetric"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BotModelMetrics } from "../../interfaces/BotModelMetrics";
import ModelMetricEntry from "./ModelMetricEntry.vue";

const props = defineProps<{ modelMetrics: BotModelMetrics }>();
</script>
