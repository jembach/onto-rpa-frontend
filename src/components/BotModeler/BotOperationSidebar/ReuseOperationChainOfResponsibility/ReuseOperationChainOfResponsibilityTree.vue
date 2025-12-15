<template>
  <div
    v-for="chainOfResponsibility in filteredRpaChainOfResponsibilities"
    :key="chainOfResponsibility.id"
  >
    <div class="collapse">
      <input type="checkbox" class="min-h-0" checked />
      <div class="collapse-title text-md p-0 pt-1 min-h-0">
        <span class="rpa-element-name">{{
          chainOfResponsibility.label || chainOfResponsibility.id
        }}</span>
      </div>
      <div class="collapse-content pb-0">
        <div class="card-content">
          <div class="content">
            <div>
              <ReuseOperationChainOfResponsibilityCard
                :chain-of-responsibility="chainOfResponsibility"
                :data-operation="chainOfResponsibility.id"
                :data-operationname="chainOfResponsibility.label"
                data-nodetype="ChainOfResponsibility"
                draggable="true"
                @dragstart="$emit('drag-operation', $event)"
                @click="$emit('click-operation', $event)"
                @tag-clicked="$emit('tag-clicked', $event)"
              />
              <template
                v-for="injectionPoint in chainOfResponsibility.injectionPoints"
              >
                <ReuseOperationChainOfResponsibilityStartEvent
                  :chain-of-responsibility="chainOfResponsibility"
                  :injection-point="injectionPoint"
                  :data-operation="
                    chainOfResponsibility.id +
                    '#' +
                    injectionPoint.id +
                    '#start'
                  "
                  :data-operationname="
                    'Start ' + (injectionPoint.label || injectionPoint.id)
                  "
                  data-nodetype="StartEvent"
                  draggable="true"
                  @dragstart="$emit('drag-operation', $event)"
                  @click="$emit('click-operation', $event)"
                  @tag-clicked="$emit('tag-clicked', $event)"
                />
                <ReuseOperationChainOfResponsibilityEndEvent
                  :chain-of-responsibility="chainOfResponsibility"
                  :injection-point="injectionPoint"
                  :data-operation="
                    chainOfResponsibility.id + '#' + injectionPoint.id + '#end'
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
import ReuseOperationChainOfResponsibilityCard from "./ReuseOperationChainOfResponsibilityCard.vue";
import { RpaReuseChainOfResponsibility } from "../../../../interfaces/RpaOperation";
import { getRpaReuseChainOfResponsibilities } from "../../../../utils/ontologyParser";
import ReuseOperationChainOfResponsibilityStartEvent from "./ReuseOperationChainOfResponsibilityStartEvent.vue";
import ReuseOperationChainOfResponsibilityEndEvent from "./ReuseOperationChainOfResponsibilityEndEvent.vue";

export default defineComponent({
  name: "bot-chain-of-responsibility-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {
    searchTerm: String,
  },
  data() {
    return {
      rpaChainOfResponsibilities: [] as RpaReuseChainOfResponsibility[],
    };
  },
  computed: {
    filteredRpaChainOfResponsibilities(): RpaReuseChainOfResponsibility[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.rpaChainOfResponsibilities;
      }
      const lowerSearch = this.searchTerm.toLowerCase();
      return this.rpaChainOfResponsibilities.filter(
        (chainOfResponsibility) =>
          (chainOfResponsibility.label &&
            chainOfResponsibility.label.toLowerCase().includes(lowerSearch)) ||
          (chainOfResponsibility.comment &&
            chainOfResponsibility.comment.toLowerCase().includes(lowerSearch))
      );
    },
  },
  async mounted() {
    this.rpaChainOfResponsibilities = Object.values(
      await getRpaReuseChainOfResponsibilities()
    ) as RpaReuseChainOfResponsibility[];
  },
  components: {
    BotOperationTreePart,
    ReuseOperationChainOfResponsibilityCard,
    ReuseOperationChainOfResponsibilityStartEvent,
    ReuseOperationChainOfResponsibilityEndEvent,
  },
});
</script>
