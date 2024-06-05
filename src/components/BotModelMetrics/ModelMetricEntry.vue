<template>
  <div>
    {{ props.modelMetric.name }}:
    <span v-if="roundedValue">
      <div class="tooltip tooltip-right" :data-tip="props.modelMetric.value">
        ~{{ roundedValue }}
      </div>
    </span>

    <span v-else> {{ props.modelMetric.value }}</span>

    <span v-if="props.modelMetric.percentage">%</span>
    <div
      class="tooltip tooltip-right"
      :data-tip="props.modelMetric.description"
    >
      <FontAwesomeIcon
        class="cursor-pointer ml-1 text-gray-400"
        :icon="faCircleInfo"
        size="xs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BotModelMetric } from "../../interfaces/BotModelMetrics";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { computed } from "vue";

const props = defineProps<{ modelMetric: BotModelMetric }>();

const roundedValue = computed(() => {
  const currentValue = props.modelMetric.value;
  if (Number.isInteger(currentValue)) {
    return undefined;
  }
  if (
    Math.floor(currentValue) === currentValue ||
    currentValue.toString().split(".")[1].length <= 2
  ) {
    return undefined;
  }

  // return Math.round(props.modelMetric.value);
  return currentValue.toFixed(2);
});
</script>
