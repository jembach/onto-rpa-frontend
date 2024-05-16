<template>
  <span
    v-if="$slots.default"
    class="rpa-element-name"
    :onclick="`explain_modal_${$.uid}.showModal()`"
    ><slot></slot
  ></span>
  <span
    v-else
    class="rpa-element-name"
    :onclick="`explain_modal_${$.uid}.showModal()`"
    >{{ rpaElement.label || rpaElement.id }}</span
  >

  <dialog :id="`explain_modal_${$.uid}`" class="modal">
    <div class="modal-box">
      <div class="mb-1 text-base">{{ rpaElement.label || rpaElement.id }}</div>
      <hr class="mb-1" />
      <div class="text-left">
        <!-- <div class="element-id">ID: {{ rpaElement.id }}</div> -->
        <div v-if="rpaElement.comment" class="element-comment">
          {{ rpaElement.comment }}
        </div>
        <div v-if="rpaElement.concept">
          Is a(n) {{ rpaElement.concept.label || rpaElement.concept.id }}
          <div v-if="rpaElement.concept.comment" class="inline">
            - {{ rpaElement.concept.comment }}
          </div>
        </div>
        <div v-if="rpaElement.type">
          Is a(n) {{ rpaElement.type.label || rpaElement.type.id }}
          <div v-if="rpaElement.type.comment" class="inline">
            - {{ rpaElement.type.comment }}
          </div>
        </div>
        <div
          class="mt-2 text-xs font-mono font-extralight text-slate-300 break-all"
        >
          {{ rpaElement.iri }}
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
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
      type: Number,
      default: 1000,
    },
  },
});
</script>

<style>
.explainer-tooltip {
  max-width: 200px !important;
}
</style>
