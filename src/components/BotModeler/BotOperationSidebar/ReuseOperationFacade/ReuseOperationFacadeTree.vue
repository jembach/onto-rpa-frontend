<template>
  <div v-for="facade in filteredRpaReuseFacades" :key="facade.id">
    <BotFacadeCard
      :facade="facade"
      :data-operation="facade.id"
      :data-operationname="facade.label"
      data-nodetype="Facade"
      draggable="true"
      @dragstart="$emit('drag-operation', $event)"
      @click="$emit('click-operation', $event)"
      @tag-clicked="$emit('tag-clicked', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BotOperationTreePart from "./../BotOperationTreePart.vue";
import BotFacadeCard from "./ReuseOperationFacadeCard.vue";
import { RpaReuseFacade } from "../../../../interfaces/RpaOperation";
import { getRpaReuseFacades } from "../../../../utils/ontologyParser";

export default defineComponent({
  name: "bot-facade-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {
    searchTerm: String,
  },
  data() {
    return {
      rpaFacades: [] as RpaReuseFacade[],
    };
  },
  computed: {
    filteredRpaReuseFacades(): RpaReuseFacade[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.rpaFacades;
      }
      const lowerSearch = this.searchTerm.toLowerCase();
      return this.rpaFacades.filter(
        (facade) =>
          (facade.label && facade.label.toLowerCase().includes(lowerSearch)) ||
          (facade.comment && facade.comment.toLowerCase().includes(lowerSearch))
      );
    },
  },
  async mounted() {
    this.rpaFacades = Object.values(
      await getRpaReuseFacades()
    ) as RpaReuseFacade[];
  },
  components: { BotOperationTreePart, BotFacadeCard },
});
</script>
