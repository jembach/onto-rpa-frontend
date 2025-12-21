<template>
  <div v-for="proxy in filteredRpaProxies" :key="proxy.id">
    <ReuseOperationProxyCard
      :proxy="proxy"
      :data-operation="proxy.id"
      :data-operationname="proxy.label"
      data-nodetype="Proxy"
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
import ReuseOperationProxyCard from "./ReuseOperationProxyCard.vue";
import { RpaReuseProxy } from "../../../../interfaces/RpaOperation";
import { getRpaReuseProxies } from "../../../../utils/ontologyParser";

export default defineComponent({
  name: "bot-proxy-tree",
  emits: ["drag-operation", "click-operation", "tag-clicked"],
  props: {
    searchTerm: String,
  },
  data() {
    return {
      rpaProxies: [] as RpaReuseProxy[],
    };
  },
  computed: {
    filteredRpaProxies(): RpaReuseProxy[] {
      if (!this.searchTerm || this.searchTerm.trim() === "") {
        return this.rpaProxies;
      }
      const lowerSearch = this.searchTerm.toLowerCase();

      return this.rpaProxies.filter(
        (proxy) =>
          (proxy.label && proxy.label.toLowerCase().includes(lowerSearch)) ||
          (proxy.comment && proxy.comment.toLowerCase().includes(lowerSearch))
      );
    },
  },
  async mounted() {
    this.rpaProxies = Object.values(
      await getRpaReuseProxies()
    ) as RpaReuseProxy[];
  },
  components: { BotOperationTreePart, ReuseOperationProxyCard },
});
</script>
