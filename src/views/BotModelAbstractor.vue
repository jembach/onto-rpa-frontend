<template>
  <div class="h-screen max-h-screen flex flex-col">
    <div
      class="bg-sky-700 text-center text-slate-100 py-12 flex-initial flex justify-around"
    >
      <div class="flex-1">
        <router-link :to="{ name: 'Overview' }" title="Back to Overview">
          <FontAwesomeIcon
            class="cursor-pointer"
            :icon="faChevronLeft"
            size="2xl"
          />
        </router-link>
      </div>

      <div
        class="text-white bg-transparent text-4xl border-0 border-b-2 w-4/5 shadow-none"
      >
        {{ botModel.name }}
      </div>
      <div class="flex-1">
        <FontAwesomeIcon
          class="ml-4 cursor-pointer"
          :icon="faCamera"
          size="2xl"
          @click="takeScreenshot"
        />
      </div>
    </div>
    <div class="flex-auto grid grid-cols-6">
      <AbstractionSettingsSidebar
        class="col-span-1 drop-shadow-lg bg-white"
        :maxAggregationValue="maxAggregationValue"
        @elimination-change="eliminationThresholdChanged"
        @abstraction-change="abstractionThresholdChanged"
      ></AbstractionSettingsSidebar>
      <BotModelerCanvas
        v-if="botModel.model"
        :diagram="botModel.model"
        :key="modelerKey"
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
      maxAggregationValue: 0 as Number,
      modelOperations: {} as AbstractionModelOperations,
      modelerKey: 0,
      modelAbstractor: {} as BotModelAbstractor,
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
    this.modelAbstractor = new BotModelAbstractor(this.botModel.processTree);
    this.maxAggregationValue = this.modelAbstractor.maxAggregationValue + 1;
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
      this.updateAbstractedModel();
    },

    takeScreenshot: async function () {
      this.$oruga.notification.open({
        message: "Not supported.",
        variant: "warning",
      });
    },

    eliminationThresholdChanged(e) {
      this.currentEliminationThreshold = e;
      this.modelerKey += 1;

      // this.updateAbstractedModel();
    },
    abstractionThresholdChanged(e) {
      this.currentAbstractionThreshold = e;
      this.modelerKey += 1;

      // this.updateAbstractedModel();
    },
    updateAbstractedModel() {
      const abstractionPlan =
        this.modelAbstractor.getAbstractionPlanForBotModel(
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
import BotModel from "../interfaces/BotModel";
import botModelApi from "../api/botModelApi";
import YAML from "yaml";
import abstractionPlanToModelOperations from "../utils/abstractionPlanToModelOperations";
import { AbstractionModelOperations } from "../interfaces/BotModelAbstraction";
import BotModelAbstractor from "../utils/BotModelAbstractor";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
</script>

<style>
.djs-palette {
  display: none;
}
</style>
