<script setup lang="ts">
import { BotModelType } from "../../../../interfaces/BotModel";
</script>

<template>
  <div
    v-for="templateMethod in filteredRpaReuseTemplateMethods"
    :key="templateMethod.id"
  >
    <div class="collapse">
      <input type="checkbox" class="min-h-0" checked />
      <div class="collapse-title text-md p-0 pt-1 min-h-0">
        <span class="rpa-element-name">{{
          templateMethod.label || templateMethod.id
        }}</span>
      </div>
      <div class="collapse-content pb-0">
        <div class="card-content">
          <div class="content">
            <div>
              <ReuseOperationTemplateMethodCard
                :templateMethod="templateMethod"
                :data-operation="templateMethod.id"
                :data-operationname="templateMethod.label"
                data-nodetype="TemplateMethod"
                draggable="true"
                @dragstart="$emit('drag-operation', $event)"
                @click="$emit('click-operation', $event)"
                @tag-clicked="$emit('tag-clicked', $event)"
              />
              <ReuseOperationTemplateMethodEventBasedGateway
                :templateMethod="templateMethod"
                :data-operation="templateMethod.id"
                data-operationname=" "
                data-nodetype="EventBasedGateway"
                draggable="true"
                @dragstart="$emit('drag-operation', $event)"
                @click="$emit('click-operation', $event)"
                @tag-clicked="$emit('tag-clicked', $event)"
              />
              <template
                v-for="injectionPoint in templateMethod.injectionPoints"
              >
                <ReuseOperationTemplateMethodIntermediateCatchEvent
                  :templateMethod="templateMethod"
                  :injection-point="injectionPoint"
                  :data-operation="
                    templateMethod.id + '#' + injectionPoint.id + '#start'
                  "
                  :data-operationname="
                    'Start ' + (injectionPoint.label || injectionPoint.id)
                  "
                  data-nodetype="IntermediateSignalCatchEvent"
                  draggable="true"
                  @dragstart="$emit('drag-operation', $event)"
                  @click="$emit('click-operation', $event)"
                  @tag-clicked="$emit('tag-clicked', $event)"
                />
                <ReuseOperationTemplateMethodEndEvent
                  :templateMethod="templateMethod"
                  :injection-point="injectionPoint"
                  :data-operation="
                    templateMethod.id + '#' + injectionPoint.id + '#end'
                  "
                  :data-operationname="
                    'End ' + (injectionPoint.label || injectionPoint.id)
                  "
                  data-nodetype="EndEvent"
                  draggable="true"
                  @dragstart="$emit('drag-operation', $event)"
                  @click="$emit('click-operation', $event)"
                  @tag-clicked="$emit('tag-clicked', $event)"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BotOperationTreePart from "./../BotOperationTreePart.vue";
import { RpaReuseTemplateMethod } from "../../../../interfaces/RpaOperation";
import { getRpaReuseTemplateMethods } from "../../../../utils/ontologyParser";
import ReuseOperationTemplateMethodCard from "./ReuseOperationTemplateMethodCard.vue";
import ReuseOperationTemplateMethodEventBasedGateway from "./ReuseOperationTemplateMethodEventBasedGateway.vue";
import ReuseOperationTemplateMethodIntermediateCatchEvent from "./ReuseOperationTemplateMethodIntermediateCatchEvent.vue";
import ReuseOperationTemplateMethodEndEvent from "./ReuseOperationTemplateMethodEndEvent.vue";

export default defineComponent({
  name: "bot-template-method-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {
    treeCriteria: {
      type: String,
      default: "operations",
    },
    searchTerm: String,
  },
  data() {
    return {
      rpaTemplateMethods: [] as RpaReuseTemplateMethod[],
      nodeVisibility: {} as Record<string, boolean>,
    };
  },
  computed: {
    botType(): BotModelType {
      return this.$route.params.type as BotModelType;
    },
    filteredRpaReuseTemplateMethods(): RpaReuseTemplateMethod[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.rpaTemplateMethods;
      }
      const lowerSearch = this.searchTerm.toLowerCase();
      return this.rpaTemplateMethods.filter(
        (template) =>
          (template.label &&
            template.label.toLowerCase().includes(lowerSearch)) ||
          (template.comment &&
            template.comment.toLowerCase().includes(lowerSearch))
      );
    },
  },
  watch: {},
  async mounted() {
    this.rpaTemplateMethods = Object.values(
      await getRpaReuseTemplateMethods()
    ) as RpaReuseTemplateMethod[];
  },
  components: {
    BotOperationTreePart,
    ReuseOperationTemplateMethodCard,
    ReuseOperationTemplateMethodEventBasedGateway,
    ReuseOperationTemplateMethodIntermediateCatchEvent,
    ReuseOperationTemplateMethodEndEvent,
  },
});
</script>

<style>
.operation-tagline {
  @apply flex justify-between text-xs m-1;
}
.operation-tagline > span {
  @apply rounded-full bg-slate-500 text-white px-1;
}
</style>
