<template>
  <div class="navbar bg-sky-700 text-slate-100 shadow-md z-50 h-20">
    <div class="navbar-start ml-4">
      <router-link :to="{ name: 'Overview' }" title="Back to Overview">
        <FontAwesomeIcon class="cursor-pointer" :icon="faHouse" size="2xl" />
      </router-link>
      <slot name="left"></slot>
    </div>

    <div class="navbar-center w-3/5 justify-center">
      <input
        v-if="props.modelNameEditable"
        class="text-center text-white bg-transparent text-4xl border-0 border-b-2 border-slate-400 w-3/5 shadow-none"
        placeholder="Name your new Bot"
        v-model="modelName"
      />
      <div
        v-else
        class="text-white bg-transparent text-4xl text-center border-0 w-4/5 shadow-none"
      >
        {{ modelName }}
      </div>
    </div>
    <div class="navbar-end mr-4">
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
