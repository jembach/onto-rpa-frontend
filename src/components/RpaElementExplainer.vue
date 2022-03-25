<template>
  <o-tooltip position="top" multiline>
    <span v-if="$slots.default" class="italic"><slot></slot></span>
    <span v-else class="italic">{{ rpaElement.label || rpaElement.id }}</span>
    <template v-slot:content>
      Profile {{ rpaElement.label || rpaElement.id }} <br />
      ID: {{ rpaElement.id }} <br />
      Comment: {{ rpaElement.comment }} <br />
      IRI: {{ rpaElement.iri }}
    </template>
  </o-tooltip>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RpaBaseElement } from "../interfaces/RpaOperation";
export default defineComponent({
  name: "rpa-element-explainer",
  props: {
    rpaElement: {
      type: Object as PropType<RpaBaseElement>,
      required: true,
    },
  },
});
</script>
