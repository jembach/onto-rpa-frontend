<template>
  <div
    class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800/50 dark:shadow-none dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10"
  >
    <div class="px-4 py-5 sm:p-6">
      <ul
        role="list"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 dark:border-white/10"
      >
        <li v-for="(item, itemIdx) in items" :key="itemIdx" class="flow-root">
          <router-link
            :to="{
              name: 'ModelerWithType',
              params: { type: item.type },
            }"
            class="relative -m-2 flex items-center space-x-4 rounded-xl p-2 focus-within:outline focus-within:outline-2 focus-within:outline-indigo-600 hover:bg-gray-50 dark:focus-within:outline-indigo-500 dark:hover:bg-white/5"
            ><div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                <span>{{ item.title }}</span>
                <span aria-hidden="true"> &rarr;</span>
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
const items = [
  {
    title: "Create an RPA Bot",
    type: "bot",
    description: "Start building a new Robotic Process Automation bot.",
  },
  {
    title: "Create an RPA Module",
    type: "module",
    description: "Develop a reusable module for your RPA workflows.",
  },
  {
    title: "Create an RPA Template",
    type: "template",
    description:
      "A specialized RPA module that allows you to place custom RPA actions inside it.",
  },
];
</script>
