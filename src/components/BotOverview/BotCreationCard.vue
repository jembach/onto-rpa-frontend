<template>
  <div class="overflow-hidden rounded-lg bg-white shadow">
    <div class="px-4 py-5 sm:p-6">
      <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <li v-for="(item, itemIdx) in items" :key="itemIdx" class="flow-root">
          <router-link
            :to="{
              name: 'ModelerWithType',
              params: { type: item.type },
            }"
            class="relative -m-2 flex items-center space-x-4 rounded-xl p-2 focus-within:outline focus-within:outline-2 focus-within:outline-indigo-600 hover:bg-gray-50"
            ><div>
              <h3 class="text-sm font-medium text-gray-900">
                <span>{{ item.title }}</span>
                <span aria-hidden="true"> &rarr;</span>
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ item.description }}
              </p>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { BotModelType } from "../../interfaces/BotModel";

const items = [
  {
    title: "Create an RPA Bot",
    type: BotModelType.BOT,
    description: "Start building a new Robotic Process Automation bot.",
  },
  {
    title: "Create an RPA Facade",
    type: BotModelType.FACADE,
    description: "Develop a reusable facade for your RPA workflows.",
  },
  {
    title: "Create an RPA Decorator",
    type: BotModelType.DECORATOR,
    description: "Develop a reusable decorator for your RPA workflows.",
  },
  {
    title: "Create an RPA Proxy",
    type: BotModelType.PROXY,
    description: "Develop a reusable proxy for your RPA workflows.",
  },
  {
    title: "Create an RPA Chain of Responsibility",
    type: BotModelType.CHAIN_OF_RESPONSIBILITY,
    description:
      "Develop a reusable chain of responsibility for your RPA workflows.",
  },
  {
    title: "Create an RPA Template Methode",
    type: BotModelType.TEMPLATE_METHOD,
    description: "Develop a reusable template method for your RPA workflows.",
  },
];
</script>
