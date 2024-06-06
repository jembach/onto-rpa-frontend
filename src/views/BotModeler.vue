<template>
  <div class="h-screen max-h-screen flex flex-col">
    <ModelTopBar :model-name-editable="true" v-model="botModel.name">
      <template #left>
        <FontAwesomeIcon
          class="ml-8 cursor-pointer"
          :icon="faSave"
          size="2xl"
          @click="saveBot"
        />
      </template>
      <template #right>
        <FontAwesomeIcon
          class="ml-4 cursor-pointer"
          :icon="faTrash"
          size="2xl"
          @click="deleteBot"
        />
      </template>
    </ModelTopBar>

    <ModelNavigationBar :botModelId="botModel.id"></ModelNavigationBar>
    <div class="flex-auto grid grid-cols-6">
      <BotOperationSidebar
        @drag-operation="dragOperation"
        @click-operation="clickOperation"
        class="col-span-1 shadow-lg bg-white"
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
import { computed, onMounted, reactive, ref } from "vue";
import BotModelerCanvas from "../components/BotModeler/BotModelerCanvas.vue";
import BotModelerPropertiesPanel from "../components/BotModeler/BotModelerPropertiesPanel.vue";
import {
  ModelerElement,
  ModelerEvent,
  ModelerSelectionChange,
} from "../interfaces/ModelerEvents";
import BotOperationSidebar from "../components/BotModeler/BotOperationSidebar.vue";
import ModelNavigationBar from "../components/ModelNavigationBar.vue";
import ModelTopBar from "../components/ModelTopBar.vue";
import { bpmnMapping } from "../utils/bpmnMapping";
import { BpmoConcept } from "../interfaces/bpmoConcepts";
import BpmnModdleParser from "../utils/BpmnModdleParser";
import botModelApi from "../api/botModelApi";
import YAML from "yaml";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import BotModel from "../utils/BotModel";

const toast = useToast();
const router = useRouter();
const route = useRoute();

const modelerShown = ref(false);
const modeler = ref({} as any);
const selectedElements = ref([] as ModelerElement[]);
const element = ref({} as ModelerElement | null);
const botModel = ref({} as BotModel);

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
    botModel.value = new BotModel();
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

    botModel.value.tree = bpmnModdleParser.parseBpmnModdle(
      modeler.value._definitions
    );

    if (botModel.value.id) {
      await botModelApi.updateBotModel(botModel.value);
    } else {
      const newBotModel = await botModelApi.addBotModel(botModel.value);
      botModel.value = newBotModel;
      router.replace({
        name: "Modeler",
        params: { modelId: newBotModel.id },
      });
    }
    toast.success("Model successfully saved.");
  } catch (e) {
    toast.error("Bot could not be saved.\n" + e);
  }
}

async function deleteBot() {
  if (!botModel.value.id) {
    botModel.value = new BotModel();
  } else {
    try {
      await botModelApi.deleteBotModel(botModel.value.id);
    } catch (e) {
      toast.error("Bot could not be deleted.\n" + e);
      return;
    }
  }
  toast.success("Bot deleted");
  router.push({ name: "Overview" });
}

function newOperationShape(e) {
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

function clickOperation(e) {
  return;
  console.log(e);
  const elementRegistry = modeler.value.get("elementRegistry");
  const modeling = modeler.value.get("modeling");
  const process = elementRegistry.get("Process_1");
  const shape = newOperationShape(e);
  modeling.createShape(shape, { x: 400, y: 100 }, process);
}

function dragOperation(e) {
  // console.log(modeler.value);
  e.dataTransfer.effectAllowed = "move";

  e.preventDefault();

  const create = modeler.value.get("create");
  const shape = newOperationShape(e);
  create.start(e, shape);
}

const stringifiedProcessTree = computed(() => {
  if (!botModel.value.tree || !botModel.value.tree.tree) {
    return "";
  }
  return YAML.stringify(botModel.value.tree.tree);
});
</script>
