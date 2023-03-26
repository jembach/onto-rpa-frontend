<template>
  <div class="relative">
    <div class="p-2 mt-1 text-center">
      <div class="text-center text-xl">Semantic Abstraction</div>
    </div>

    <div class="w-full mt-2 px-4">
      <o-field label="Reduce Coverage">
        <o-slider
          rounded
          v-model="eliminationLevel"
          @change="$emit('elimination-change', $event)"
        ></o-slider>
      </o-field>
      <o-field label="Reduce Granularity">
        <o-slider
          rounded
          v-model="aggregationLevel"
          :max="maxAggregationValue"
          @change="$emit('abstraction-change', $event)"
        ></o-slider>
      </o-field>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "abstraction-settings-sidebar",
  emits: ["elimination-change", "abstraction-change"],
  props: {
    maxAggregationValue: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      eliminationLevel: 0,
      aggregationLevel: 0,
    };
  },
  methods: {
    resetAbstraction() {
      this.eliminationLevel = 0;
      this.aggregationLevel = 0;
    },
  },
});
</script>
