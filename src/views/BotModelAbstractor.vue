<template>
  <div class="h-screen max-h-screen flex flex-col">
    <div
      class="bg-sky-700 text-center text-slate-100 py-12 flex-initial flex justify-around"
    >
      <div class="flex-1">
        <router-link :to="{ name: 'Overview' }" title="Back to Overview">
          <o-icon
            class="cursor-pointer"
            icon="chevron-left"
            size="large"
          ></o-icon>
        </router-link>
      </div>

      <div
        class="text-white bg-transparent text-4xl border-0 border-b-2 w-4/5 shadow-none"
      >
        {{ botModel.name }}
      </div>
      <div class="flex-1">
        <o-icon
          class="ml-4 cursor-pointer"
          icon="camera"
          size="large"
          @click="takeScreenshot"
        ></o-icon>
      </div>
    </div>
    <div class="flex-auto grid grid-cols-6">
      <AbstractionSettingsSidebar
        class="col-span-1 drop-shadow-lg bg-white"
        @elimination-change="eliminationThresholdChanged"
        @abstraction-change="abstractionThresholdChanged"
      ></AbstractionSettingsSidebar>
      <BotModelerCanvas
        v-if="botModel.model"
        :diagram="botModel.model"
        @modeler-shown="modelerLoaded"
        @modeler-selection-changed="selectionChanged"
        @modeler-element-changed="elementChanged"
        class="col-span-4"
      ></BotModelerCanvas>
      <div class="col-span-1 drop-shadow-lg bg-white">
        <BotModelerPropertiesPanel
          v-if="modelerShown"
          :modeler="modeler"
          :element="element"
          class="h-128"
        ></BotModelerPropertiesPanel>
        <div class="m-4 text-left">
          <pre>{{ stringifiedProcessTree }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "bot-model-abstractor",
  data() {
    return {
      modelerShown: false,
      modeler: undefined,
      selectedElements: [] as ModelerElement[],
      element: {} as ModelerElement,
      botModel: {} as BotModel,
      currentEliminationThreshold: 0,
      currentAbstractionThreshold: 0,
      modelOperations: {} as AbstractionModelOperations,
    };
  },
  async mounted() {
    if (!this.$route.params.modelId) {
      this.$oruga.notification.open({
        message: "Invalid URL, you must provide a bot model id.",
        variant: "error",
      });
      this.$router.push({ name: "Overview" });
    }
    try {
      this.botModel = await botModelApi.getBotModel(
        this.$route.params.modelId as string
      );
    } catch (e) {
      this.$oruga.notification.open({
        message: "Could not load the requested bot model.",
        variant: "error",
      });
      this.$router.push({ name: "Overview" });
    }
  },
  methods: {
    selectionChanged(e: ModelerSelectionChange) {
      this.selectedElements = e.newSelection;
      if (e.newSelection.length > 0) {
        this.element = e.newSelection[0];
      } else {
        this.element = null;
      }
    },
    elementChanged(e: ModelerEvent) {
      // this.saveDiagram();
      if (!this.element || !this.element.businessObject) {
        return;
      }
      if (this.element.businessObject.id === e.element.businessObject.id) {
        this.element = e.element;
      }
    },
    modelerLoaded(modeler): void {
      this.modeler = modeler;
      this.modelerShown = true;
    },

    takeScreenshot: async function () {
      this.$oruga.notification.open({
        message: "Not supported.",
        variant: "warning",
      });
    },

    eliminationThresholdChanged(e) {
      this.currentEliminationThreshold = e;
      this.updateAbstractedModel();
    },
    abstractionThresholdChanged(e) {
      this.currentAbstractionThreshold = e;
      this.updateAbstractedModel();
    },
    updateAbstractedModel() {
      const abstractionPlan = getAbstractionPlanForBotModel(
        this.botModel.processTree,
        this.currentEliminationThreshold,
        this.currentAbstractionThreshold
      );

      const modelInstructions =
        abstractionPlanToModelOperations(abstractionPlan);

      console.log(modelInstructions);

      const elementRegistry = this.modeler.get("elementRegistry");
      const modeling = this.modeler.get("modeling");
      const process = elementRegistry.get("Process_1");

      modelInstructions.elementsToDelete.forEach((elementToDelete: string) => {
        const element = elementRegistry.get(elementToDelete);
        modeling.removeElements([element]);
      });
      modelInstructions.elementsToRename.forEach(
        (elementToRename: [string, string]) => {
          const element = elementRegistry.get(elementToRename[0]);
          modeling.updateProperties(element, { name: elementToRename[1] });
        }
      );
    },
  },
  computed: {
    stringifiedProcessTree() {
      if (!this.botModel.processTree || !this.botModel.processTree.tree) {
        return "";
      }
      return YAML.stringify(this.botModel.processTree.tree);
    },
  },
  components: { AbstractionSettingsSidebar },
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
import BotModelerCanvas from "../components/BotModeler/BotModelerCanvas.vue";
import BotModelerPropertiesPanel from "../components/BotModeler/BotModelerPropertiesPanel.vue";
import {
  ModelerElement,
  ModelerEvent,
  ModelerSelectionChange,
} from "../interfaces/ModelerEvents";
import AbstractionSettingsSidebar from "../components/BotModelAbstractor/AbstractionSettingsSidebar.vue";
import { bpmnMapping } from "../utils/bpmnMapping";
import { BpmoConcept } from "../interfaces/bpmoConcepts";
import BpmnModdleParser from "../utils/BpmnModdleParser";
import BotModel, { createDefaultBotModel } from "../interfaces/BotModel";
import botModelApi from "../api/botModelApi";
import YAML from "yaml";
import getAbstractionPlanForBotModel from "../utils/abstractBotModel";
import abstractionPlanToModelOperations from "../utils/abstractionPlanToModelOperations";
import { AbstractionModelOperations } from "../interfaces/BotModelAbstraction";
</script>
