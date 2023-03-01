<template>
  <div class="relative">
    <div class="p-2 mt-1 text-center">
      <div class="text-center text-xl">Semantic Abstraction</div>
    </div>

    <div class="w-full mt-2 px-4">
      <o-field label="Granularity Level">
        <o-slider
          rounded
          v-model="granularityLevel"
          @change="$emit('elimination-change', $event)"
        ></o-slider>
      </o-field>
      <o-field label="Semantic Abstraction">
        <o-slider
          rounded
          v-model="semanticLevel"
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
  data() {
    return {
      granularityLevel: 0,
      semanticLevel: 0,
    };
  },
  methods: {
    resetAbstraction() {
      this.granularityLevel = 0;
      this.semanticLevel = 0;
    },
  },
});
</script>
