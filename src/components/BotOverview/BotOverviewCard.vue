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
      <div v-if="cardHovered || hoverLock" class="absolute bottom-0 w-full">
        <o-tooltip
          variant="primary"
          position="bottom"
          :triggers="['click']"
          :auto-close="['outside', 'escape']"
          @open="hoverLock = true"
          @close="hoverLock = false"
        >
          <template v-slot:content>
            <div class="flex flex-col gap-2 my-1">
              <o-button variant="primary" @click="downloadBot('robotframework')"
                >RobotFramework</o-button
              >
              <o-button variant="primary" @click="downloadBot('taskt')"
                >taskt</o-button
              >
            </div>
          </template>
          <o-icon icon="download" :clickable="true"></o-icon>
        </o-tooltip>
      </div>
    </div>
    <div v-else><o-icon icon="plus"></o-icon></div>
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
