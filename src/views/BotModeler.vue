<template>
  <div class="bg-sky-700 text-center text-slate-200 py-12">
    <router-link
      :to="{ name: 'Overview' }"
      class="absolute left-4"
      title="Back to Overview"
    >
      <o-icon icon="circle-arrow-left" size="large"></o-icon>
    </router-link>

    <input
      class="text-center text-white bg-transparent text-4xl border-0 border-b-2 w-4/5 shadow-none"
      placeholder="Name your new Bot"
      v-model="botModel.name"
    />
  </div>
  <hr />
  <div class="grid grid-cols-6 h-132">
    <BotOperationSidebar
      @drag-operation="dragOperation"
      @click-operation="clickOperation"
      class="col-span-1 h-132"
    >
    </BotOperationSidebar>
    <BotModelerCanvas
      v-if="botModel.model"
      :diagram="botModel.model"
      @modeler-shown="modelerLoaded"
      @modeler-selection-changed="selectionChanged"
      @modeler-element-changed="elementChanged"
      class="col-span-4 h-132"
    ></BotModelerCanvas>
    <BotModelerPropertiesPanel
      class="col-span-1"
      v-if="modelerShown"
      :modeler="modeler"
      :element="element"
    ></BotModelerPropertiesPanel>
  </div>
  <div class="m-4">
    <o-button @click="saveDiagram" variant="primary" icon-left="save"
      >Save Bot</o-button
    >
  </div>
  <div class="m-4">
    {{ botModel.processTree }}
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

    saveDiagram: async function () {
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
          await botModelApi.addBotModel(this.botModel);
        }
      } catch (e) {
        this.$oruga.notification.open({
          message: "Bot could not be saved. " + e,
          variant: "danger",
        });
      }
    },
    newOperationShape(e) {
      const operation = e.target.dataset["operation"];
      let bpmnType = bpmnMapping[e.target.dataset["nodetype"] as BpmoConcept];
      let bpmnEventDefinition = undefined;

      if (bpmnType.includes("EventDefinition")) {
        bpmnEventDefinition = bpmnType;
        bpmnType = "bpmn:IntermediateCatchEvent";
      }

      const bpmnFactory = this.modeler.get("bpmnFactory");
      const elementFactory = this.modeler.get("elementFactory");

      const newBO = bpmnFactory.create(bpmnType, {
        name: operation,
        "rpa:operation": operation,
      });
      const shapeOptions = {
        type: bpmnType,
        businessObject: newBO,
      };
      if (bpmnEventDefinition) {
        shapeOptions["eventDefinitionType"] = bpmnEventDefinition;
      }
      const shape = elementFactory.createShape(shapeOptions);

      return shape;
    },
    clickOperation(e) {
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
</script>
