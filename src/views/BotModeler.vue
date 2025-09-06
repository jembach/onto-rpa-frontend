<template>
  <div class="h-screen max-h-screen flex flex-col">
    <div class="bg-sky-700 py-10">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav class="hidden sm:flex" aria-label="Breadcrumb">
            <ol role="list" class="flex items-center space-x-4">
              <li>
                <div class="flex">
                  <router-link
                    :to="{ name: 'Overview' }"
                    title="Back to Overview"
                    class="text-sm font-medium text-white hover:text-gray-300"
                  >
                    Home
                  </router-link>
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <FontAwesomeIcon
                    :icon="faChevronRight"
                    class="size-3 shrink-0 text-white"
                    aria-hidden="true"
                  />
                  <span class="ml-4 text-sm font-medium text-white">
                    {{ BotModelTypeLng[botType] }} Modelling
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <div class="mt-2 md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
              <input
                class="text-2xl/7 font-bold sm:truncate sm:text-3xl sm:tracking-tight text-white text-left bg-transparent border-0 border-b-2 w-full shadow-none"
                :placeholder="`Name your new ${BotModelTypeLng[botType]}`"
                v-model="botModel.name"
              />
            </div>
            <div class="mt-4 flex shrink-0 md:ml-4 md:mt-0">
              <FontAwesomeIcon
                class="ml-4 cursor-pointer text-white hover:text-gray-300"
                role="button"
                :icon="faSave"
                size="2xl"
                @click="saveBot"
              />
              <FontAwesomeIcon
                class="ml-8 cursor-pointer text-white hover:text-gray-300"
                role="button"
                :icon="faTrash"
                size="2xl"
                @click="deleteBot"
              />
            </div>
          </div>
        </div>
      </header>
    </div>
    <div class="flex-auto grid grid-cols-6">
      <BotOperationSidebar
        @drag-operation="dragOperation"
        @click-operation="clickOperation"
        class="col-span-1 drop-shadow-lg bg-white"
      >
      </BotOperationSidebar>
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
          :element="element!"
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
import { computed, onMounted, ref } from "vue";
import BotModelerCanvas from "../components/BotModeler/BotModelerCanvas.vue";
import BotModelerPropertiesPanel from "../components/BotModeler/BotModelerPropertiesPanel.vue";
import {
  ModelerElement,
  ModelerEvent,
  ModelerSelectionChange,
} from "../interfaces/ModelerEvents";
import BotOperationSidebar from "../components/BotModeler/BotOperationSidebar.vue";
import { bpmnMapping } from "../utils/bpmnMapping";
import { BpmoConcept } from "../interfaces/BpmoConcepts";
import BpmnModdleParser from "../utils/BpmnModdleParser";
import BotModel, {
  BotModelType,
  createDefaultBotModel,
} from "../interfaces/BotModel";
import botModelApi from "../api/botModelApi";
import YAML from "yaml";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { BotModelTypeLng } from "../utils/rpaTypeMapping";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const modelerShown = ref(false);
const modeler = ref({} as any);
const selectedElements = ref([] as ModelerElement[]);
const element = ref({} as ModelerElement | null);
const botModel = ref({} as BotModel);

const botType = computed(() => {
  return route.params.type as BotModelType;
});

onMounted(async () => {
  if (route.params.modelId as string) {
    try {
      botModel.value = await botModelApi.getBotModel(
        route.params.modelId as string
      );
    } catch (e) {
      toast.error("Could not load the requested bot model.");
    }
  } else {
    botModel.value = createDefaultBotModel();
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

function modelerLoaded(loadedModeler: any): void {
  modeler.value = loadedModeler;
  modelerShown.value = true;
}

async function saveBot() {
  if (!botModel.value.name) {
    toast.warning("Please name your new bot before saving.");
    return;
  }
  try {
    const diagramXML = await modeler.value.saveXML();
    botModel.value.model = diagramXML.xml;

    const bpmnModdleParser = new BpmnModdleParser();

    botModel.value.processTree = bpmnModdleParser.parseBpmnModdle(
      modeler.value._definitions
    );

    if (botModel.value._id) {
      await botModelApi.updateBotModel(botModel.value);
    } else {
      const newBotModel = await botModelApi.addBotModel(botModel.value);
      botModel.value = newBotModel;
      router.replace({
        name: "Modeler",
        params: { modelId: newBotModel._id },
      });
    }
    toast.success("Model successfully saved.");
  } catch (e) {
    toast.error("Bot could not be saved.\n" + e);
  }
}

async function deleteBot() {
  if (!botModel.value._id) {
    botModel.value = createDefaultBotModel();
  } else {
    try {
      await botModelApi.deleteBotModel(botModel.value._id);
    } catch (e) {
      toast.error("Bot could not be deleted.\n" + e);
      return;
    }
  }
  toast.success("Bot deleted");
  router.push({ name: "Overview" });
}

function newOperationShape(e: any) {
  const bpmnFactory = modeler.value.get("bpmnFactory");
  const elementFactory = modeler.value.get("elementFactory");
  const operation = e.target.dataset["operation"];
  let bpmnType = bpmnMapping[e.target.dataset["nodetype"] as BpmoConcept];

  const shapeOptions: any = {
    type: bpmnType,
  };

  if (bpmnType.includes("EventDefinition")) {
    shapeOptions["eventDefinitionType"] = bpmnType;
    shapeOptions["type"] = "bpmn:IntermediateCatchEvent";
    bpmnType = "bpmn:IntermediateCatchEvent";
  }
  if (bpmnType.includes("SubProcess")) {
    shapeOptions["isExpanded"] = true;
  }

  shapeOptions["businessObject"] = bpmnFactory.create(bpmnType, {
    name: operation,
    "rpa:operation": operation,
  });

  const shape = elementFactory.createShape(shapeOptions);

  if (bpmnType.includes("SubProcess")) {
    const startEvent = elementFactory.createShape({
      type: "bpmn:StartEvent",
      x: 40,
      y: 82,
      parent: shape,
    });
    return [shape, startEvent];
  }

  return shape;
}

function clickOperation(e: any) {
  return;
}

function dragOperation(e: any) {
  // console.log(modeler.value);
  e.dataTransfer.effectAllowed = "move";

  e.preventDefault();

  const create = modeler.value.get("create");
  const shape = newOperationShape(e);
  create.start(e, shape);
}

const stringifiedProcessTree = computed(() => {
  if (!botModel.value.processTree || !botModel.value.processTree.tree) {
    return "";
  }
  return YAML.stringify(botModel.value.processTree.tree);
});
</script>
