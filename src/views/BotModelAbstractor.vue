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

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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
import { useToast } from "vue-toastification";
import { useRouter, useRoute } from "vue-router";
import abstractionPlanToModelOperations from "../utils/abstractionPlanToModelOperations";
import { AbstractionModelOperations } from "../interfaces/BotModelAbstraction";
import BotModelAbstractor from "../utils/BotModelAbstractor";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

const modelerShown = ref(false);
const modeler = ref({} as any);
const selectedElements = ref([] as ModelerElement[]);
const element = ref({} as ModelerElement | null);
const botModel = ref({} as BotModel);
const currentEliminationThreshold = ref(0);
const currentAbstractionThreshold = ref(0);
const maxAggregationValue = ref(0);
const modelOperations = ref({} as AbstractionModelOperations);
const modelerKey = ref(0);
let modelAbstractor = {} as BotModelAbstractor;

const toast = useToast();
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  if (!route.params.modelId) {
    toast.error("Invalid URL, you must provide a bot model id.");
    router.push({ name: "Overview" });
  }
  try {
    botModel.value = await botModelApi.getBotModel(
      route.params.modelId as string
    );
  } catch (e) {
    toast.error("Could not load the requested bot model.");
    router.push({ name: "Overview" });
  }
  try {
    modelAbstractor = new BotModelAbstractor(botModel.value.processTree);
    // console.log(modelAbstractor);
    maxAggregationValue.value = modelAbstractor.maxAggregationValue + 1;
  } catch (e) {
    console.log(e);
  }
});

function selectionChanged(e: ModelerSelectionChange) {
  selectedElements.value = e.newSelection;
  if (e.newSelection.length > 0) {
    element.value = e.newSelection[0];
  } else {
    element.value = null;
  }
}

function elementChanged(e: ModelerEvent) {
  // this.saveDiagram();
  if (!element.value || !element.value.businessObject) {
    return;
  }
  if (element.value.businessObject.id === e.element.businessObject.id) {
    element.value = e.element;
  }
}

function modelerLoaded(loadedModeler): void {
  modeler.value = loadedModeler;
  modelerShown.value = true;
  updateAbstractedModel();
}

function takeScreenshot() {
  toast.warning("Not supported.");
}

function eliminationThresholdChanged(e) {
  currentEliminationThreshold.value = e;
  modelerKey.value += 1;

  // this.updateAbstractedModel();
}

function abstractionThresholdChanged(e) {
  currentAbstractionThreshold.value = e;
  modelerKey.value += 1;

  // this.updateAbstractedModel();
}

function updateAbstractedModel() {
  // console.log(modelAbstractor);
  const abstractionPlan = modelAbstractor.getAbstractionPlanForBotModel(
    currentEliminationThreshold.value,
    currentAbstractionThreshold.value
  );

  const modelInstructions = abstractionPlanToModelOperations(abstractionPlan);

  // console.log(modelInstructions);

  const elementRegistry = modeler.value.get("elementRegistry");
  const modeling = modeler.value.get("modeling");
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
}

const stringifiedProcessTree = computed(() => {
  if (!botModel.value.processTree || !botModel.value.processTree.tree) {
    return "";
  }
  return YAML.stringify(botModel.value.processTree.tree);
});
</script>

<style>
.djs-palette {
  display: none;
}
</style>
