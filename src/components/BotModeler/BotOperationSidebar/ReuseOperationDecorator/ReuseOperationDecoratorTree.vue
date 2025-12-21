<template>
  <div v-for="decorator in filteredRpaReuseDecorators" :key="decorator.id">
    <div class="collapse">
      <input type="checkbox" class="min-h-0" checked />
      <div class="collapse-title text-md p-0 pt-1 min-h-0">
        <span class="rpa-element-name">{{
          decorator.label || decorator.id
        }}</span>
      </div>
      <div class="collapse-content pb-0">
        <div class="card-content">
          <div class="content">
            <div>
              <ReuseOperationDecoratorCard
                :decorator="decorator"
                :data-operation="decorator.id"
                :data-operationname="decorator.label"
                data-nodetype="Decorator"
                draggable="true"
                @dragstart="$emit('drag-operation', $event)"
                @click="$emit('click-operation', $event)"
                @tag-clicked="$emit('tag-clicked', $event)"
              />
              <template v-for="injectionPoint in decorator.injectionPoints">
                <ReuseOperationDecoratorStartEvent
                  :decorator="decorator"
                  :injection-point="injectionPoint"
                  :data-operation="
                    decorator.id + '#' + injectionPoint.id + '#start'
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
                <ReuseOperationDecoratorEndEvent
                  :decorator="decorator"
                  :injection-point="injectionPoint"
                  :data-operation="
                    decorator.id + '#' + injectionPoint.id + '#end'
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
import ReuseOperationDecoratorCard from "./ReuseOperationDecoratorCard.vue";
import { RpaReuseDecorator } from "../../../../interfaces/RpaOperation";
import { getRpaReuseDecorators } from "../../../../utils/ontologyParser";
import ReuseOperationDecoratorEndEvent from "./ReuseOperationDecoratorEndEvent.vue";
import ReuseOperationDecoratorStartEvent from "./ReuseOperationDecoratorStartEvent.vue";

export default defineComponent({
  name: "bot-decorator-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {
    searchTerm: String,
  },
  data() {
    return {
      rpaDecorators: [] as RpaReuseDecorator[],
    };
  },
  computed: {
    filteredRpaReuseDecorators(): RpaReuseDecorator[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.rpaDecorators;
      }
      const lowerSearch = this.searchTerm.toLowerCase();
      return this.rpaDecorators.filter(
        (decorator) =>
          (decorator.label &&
            decorator.label.toLowerCase().includes(lowerSearch)) ||
          (decorator.comment &&
            decorator.comment.toLowerCase().includes(lowerSearch))
      );
    },
  },
  async mounted() {
    this.rpaDecorators = Object.values(
      await getRpaReuseDecorators()
    ) as RpaReuseDecorator[];
  },
  components: {
    BotOperationTreePart,
    ReuseOperationDecoratorCard,
    ReuseOperationDecoratorEndEvent,
    ReuseOperationDecoratorStartEvent,
  },
});
</script>
