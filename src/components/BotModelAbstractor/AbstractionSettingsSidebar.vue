<template>
  <o-field label="Granularity Level">
    <o-slider rounded v-model="granularityLevel"></o-slider>
  </o-field>
  <o-field label="Semantic Abstraction">
    <o-slider rounded v-model="semanticLevel"></o-slider>
  </o-field>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "abstraction-settings-sidebar",
  emits: ["drag-operation", "click-operation"],
  data() {
    return {
      granularityLevel: 100,
      semanticLevel: 100,
    };
  },
  methods: {
    resetAbstraction() {
      this.granularityLevel = 100;
      this.semanticLevel = 100;
    },
  },
});
</script>
