<template>
  <div
    class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow"
  >
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-base font-semibold text-gray-900">Projects</h3>
    </div>
    <div class="px-4 sm:px-6">
      <ul role="list" class="divide-y divide-gray-100">
        <li
          v-for="bot in bots"
          :key="bot._id"
          class="relative flex items-center space-x-4 py-5"
        >
          <div class="min-w-0 flex-auto">
            <div class="flex items-center gap-x-3">
              <h2 class="min-w-0 text-sm/6 font-semibold text-gray-900">
                <router-link
                  :to="{
                    name: 'ModelerWithType',
                    params: { modelId: bot._id, type: bot.type },
                  }"
                  class="flex gap-x-2"
                >
                  <span class="whitespace-nowrap">{{ bot.name }}</span>
                </router-link>
              </h2>
              <span
                v-if="bot.type === BotModelType.FACADE"
                class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
              >
                Reuse Facade
              </span>
              <span
                v-else-if="bot.type === BotModelType.DECORATOR"
                class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10"
              >
                Reuse Decorator
              </span>
              <span
                v-else-if="bot.type === BotModelType.PROXY"
                class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
              >
                Reuse Proxy
              </span>
              <span
                v-else-if="bot.type === BotModelType.CHAIN_OF_RESPONSIBILITY"
                class="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10"
              >
                Reuse Chain of Responsibility
              </span>
              <span
                v-else-if="bot.type === BotModelType.TEMPLATE_METHOD"
                class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10"
              >
                Reuse Template Method
              </span>
              <span
                v-else
                class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              >
                RPA Bot
              </span>
            </div>
            <div
              class="mt-3 flex items-center gap-x-2.5 text-xs/5 text-gray-500"
            >
              <div class="flex gap-2">
                <button
                  class="btn btn-xs"
                  @click="downloadBot(bot, 'robotframework')"
                >
                  Download RobotFramework
                </button>
                <button class="btn btn-xs" @click="downloadBot(bot, 'taskt')">
                  Download taskt
                </button>
                <router-link
                  :to="{
                    name: 'ModelAbstractor',
                    params: { modelId: bot._id },
                  }"
                  class="btn btn-xs"
                >
                  Explore abstraction
                </router-link>
                <router-link
                  :to="{ name: 'ModelMetrics', params: { modelId: bot._id } }"
                  class="btn btn-xs"
                >
                  Inspect Metrics
                </router-link>
              </div>
            </div>
          </div>
          <router-link
            :to="{
              name: 'ModelerWithType',
              params: { modelId: bot._id, type: bot.type },
            }"
            class="flex-none"
          >
            <FontAwesomeIcon
              :icon="faPen"
              class="size-5 text-gray-400"
              aria-hidden="true"
          /></router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import botModelApi from "../../api/botModelApi";
import BotModel, { BotModelType } from "../../interfaces/BotModel";
import { getFilenameForBot } from "../../utils/utils";
import { useToast } from "vue-toastification";

defineProps<{ bots: BotModel[] }>();

const toast = useToast();

async function downloadBot(bot: BotModel, targetRpaTool: string) {
  if (!bot || !bot._id) {
    return;
  }
  try {
    const botFileBlob = await botModelApi.getLinkedBotModel(
      bot._id,
      targetRpaTool
    );
    const url = window.URL.createObjectURL(botFileBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getFilenameForBot(bot, targetRpaTool);
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (e) {
    toast.error("Bot could not be linked to " + targetRpaTool + ".\n" + e);
  }
}
</script>
