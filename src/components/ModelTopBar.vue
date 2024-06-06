<template>
  <div
    class="bg-sky-700 text-center text-slate-100 py-6 min-h-24 flex-initial flex justify-around shadow-md z-50"
  >
    <div class="flex-1">
      <router-link :to="{ name: 'Overview' }" title="Back to Overview">
        <FontAwesomeIcon class="cursor-pointer" :icon="faHouse" size="2xl" />
      </router-link>
      <slot name="left"></slot>
    </div>

    <input
      v-if="props.modelNameEditable"
      class="text-center text-white bg-transparent text-4xl border-0 border-b-2 w-4/5 shadow-none"
      placeholder="Name your new Bot"
      v-model="modelName"
    />
    <div
      v-else
      class="text-white bg-transparent text-4xl border-0 border-b-2 w-4/5 shadow-none"
    >
      {{ modelName }}
    </div>
    <div class="flex-1">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{
  modelNameEditable: boolean;
}>();

const modelName = defineModel<string>();
</script>
