<template>
  <o-tooltip :position="position" multiline :delay="delay">
    <span v-if="$slots.default" class="rpa-element-name"><slot></slot></span>
    <span v-else class="rpa-element-name">{{
      rpaElement.label || rpaElement.id
    }}</span>
    <template v-slot:content>
      <div class="mb-1 text-base">{{ rpaElement.label || rpaElement.id }}</div>
      <hr class="mb-1" />
      <div class="element-id">ID: {{ rpaElement.id }}</div>
      <div v-if="rpaElement.comment" class="element-comment">
        {{ rpaElement.comment }}
      </div>
      <div class="mt-2 text-xs font-mono font-extralight text-slate-300">
        {{ rpaElement.iri }}
      </div>
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
    position: {
      type: String,
      default: "top",
    },
    delay: {
      type: String,
      default: "1000",
    },
  },
});
</script>
