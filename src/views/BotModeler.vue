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
        <FontAwesomeIcon
          class="ml-8 cursor-pointer"
          :icon="faSave"
          size="2xl"
          @click="saveBot"
        />
      </div>

      <input
        class="text-center text-white bg-transparent text-4xl border-0 border-b-2 w-4/5 shadow-none"
        placeholder="Name your new Bot"
        v-model="botModel.name"
      />
      <div class="flex-1">
        <FontAwesomeIcon
          class="ml-4 cursor-pointer"
          :icon="faTrash"
          size="2xl"
          @click="deleteBot"
        />
      </div>
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
  name: "bot-modeler",
  data() {
    return {
      modelerShown: false,
      modeler: undefined,
      selectedElements: [] as ModelerElement[],
      element: {} as ModelerElement,
      botModel: {} as BotModel,
    };
  },
  async mounted() {
    if (this.$route.params.modelId as string) {
      try {
        this.botModel = await botModelApi.getBotModel(
          this.$route.params.modelId as string
        );
      } catch (e) {
        this.$oruga.notification.open({
          message: "Could not load the requested bot model.",
          variant: "error",
        });
      }
    } else {
      this.botModel = createDefaultBotModel();
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

    saveBot: async function () {
      if (!this.botModel.name) {
        this.$oruga.notification.open({
          message: "Please name your new bot before saving.",
          variant: "warning",
        });
        return;
      }
      const diagramXML = await this.modeler.saveXML();
      this.botModel.model = diagramXML.xml;

      const bpmnModdleParser = new BpmnModdleParser();

      try {
        this.botModel.processTree = bpmnModdleParser.parseBpmnModdle(
          this.modeler._definitions
        );

        if (this.botModel._id) {
          await botModelApi.updateBotModel(this.botModel);
        } else {
          const newBotModel = await botModelApi.addBotModel(this.botModel);
          this.botModel = newBotModel;
          this.$router.replace({
            name: "Modeler",
            params: { modelId: newBotModel._id },
          });
        }
      } catch (e) {
        this.$oruga.notification.open({
          message: "Bot could not be saved. " + e,
          variant: "danger",
        });
      }
    },
    deleteBot: async function () {
      if (!this.botModel._id) {
        this.botModel = createDefaultBotModel();
      } else {
        try {
          await botModelApi.deleteBotModel(this.botModel._id);
        } catch (e) {
          this.$oruga.notification.open({
            message: "Bot could not be deleted. " + e,
            variant: "danger",
          });
          return;
        }
      }
      this.$oruga.notification.open({
        message: "Bot deleted",
        variant: "success",
      });
      this.$router.push({ name: "Overview" });
    },
    newOperationShape(e) {
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const elementFactory = this.modeler.get("elementFactory");
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
    },
    clickOperation(e) {
      return;
      console.log(e);
      const elementRegistry = this.modeler.get("elementRegistry");
      const modeling = this.modeler.get("modeling");
      const process = elementRegistry.get("Process_1");
      const shape = this.newOperationShape(e);
      modeling.createShape(shape, { x: 400, y: 100 }, process);
    },
    dragOperation(e) {
      e.dataTransfer.effectAllowed = "move";

      e.preventDefault();

      const create = this.modeler.get("create");
      const shape = this.newOperationShape(e);
      create.start(e, shape);
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
import BotOperationSidebar from "../components/BotModeler/BotOperationSidebar.vue";
import { bpmnMapping } from "../utils/bpmnMapping";
import { BpmoConcept } from "../interfaces/bpmoConcepts";
import BpmnModdleParser from "../utils/BpmnModdleParser";
import BotModel, { createDefaultBotModel } from "../interfaces/BotModel";
import botModelApi from "../api/botModelApi";
import YAML from "yaml";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons";
</script>
