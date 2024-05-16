<template>
  <div class="relative">
    <div class="p-2 mt-1 text-center">
      <div class="text-center text-xl">Semantic Abstraction</div>
    </div>

    <div class="w-full mt-2 px-4">
      <label class="form-control">
        <div class="label">
          <span class="label-text">Reduce Coverage</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value="0"
          class="range range-sm"
          v-model="eliminationLevel"
        />
      </label>
      <label class="form-control">
        <div class="label">
          <span class="label-text">Reduce Granularity</span>
        </div>
        <input
          type="range"
          min="0"
          :max="maxAggregationValue"
          value="0"
          class="range range-sm"
          v-model="aggregationLevel"
        />
      </label>
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
  watch: {
    eliminationLevel: function (newLevel) {
      this.$emit("elimination-change", newLevel);
    },
    aggregationLevel: function (newLevel) {
      this.$emit("abstraction-change", newLevel);
    },
  },
});
</script>
