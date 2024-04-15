<template>
  <div
    class="relative m-6 rounded-lg h-20 w-44 shadow-md text-center flex flex-col justify-center"
    :class="[
      botModel
        ? 'border-sky-700 bg-primary text-white text-lg hover:bg-sky-700/70'
        : 'border-solid border-2 border-action hover:bg-action hover:text-white',
    ]"
    @mouseover="cardHovered = true"
    @mouseleave="cardHovered = false"
  >
    <div v-if="botModel">
      <div>
        <router-link
          :to="{ name: 'Modeler', params: { modelId: botModel._id } }"
          >{{ botModel.name }}</router-link
        >
      </div>
      <div
        v-if="cardHovered || hoverLock"
        class="absolute bottom-0 w-full h-8 flex justify-center gap-2"
      >
        <div class="tooltip tooltip-bottom" data-tip="Explore abstraction">
          <router-link
            :to="{
              name: 'ModelAbstractor',
              params: { modelId: botModel._id },
            }"
          >
            <div class="m-1">
              <FontAwesomeIcon :icon="faBinoculars" />
            </div>
          </router-link>
        </div>

        <div class="tooltip tooltip-bottom" data-tip="Export script">
          <div class="dropdown">
            <div tabindex="0" role="button" class="m-1">
              <FontAwesomeIcon :icon="faDownload" />
            </div>
            <div
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <div class="join join-vertical">
                <button
                  class="btn join-item"
                  @click="downloadBot('robotframework')"
                >
                  RobotFramework
                </button>
                <button class="btn join-item" @click="downloadBot('taskt')">
                  taskt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <FontAwesomeIcon :icon="faPlus" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import botModelApi from "../../api/botModelApi";
import BotModel from "../../interfaces/BotModel";
import { getFilenameForBot } from "../../utils/utils";

export default defineComponent({
  name: "bot-overview-card",
  props: {
    botModel: Object as PropType<BotModel>,
  },
  data() {
    return {
      cardHovered: false,
      hoverLock: false,
    };
  },
  methods: {
    async downloadBot(targetRpaTool: string) {
      if (!this.botModel || !this.botModel._id) {
        return;
      }
      try {
        const botFileBlob = await botModelApi.getLinkedBotModel(
          this.botModel?._id,
          targetRpaTool
        );
        const url = window.URL.createObjectURL(botFileBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = getFilenameForBot(this.botModel, targetRpaTool);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (e) {
        this.$oruga.notification.open({
          message: "Bot could not be linked to " + targetRpaTool + ". " + e,
          variant: "danger",
        });
      }
    },
  },
});
</script>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faBinoculars } from "@fortawesome/free-solid-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
</script>
