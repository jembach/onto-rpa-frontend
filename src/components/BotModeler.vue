<template>
  <div class="grid grid-cols-6">
    <BotOperationSidebar
      @drag-operation="dragOperation"
      @click-operation="clickOperation"
      class="col-span-1"
    >
    </BotOperationSidebar>
    <BotModelerCanvas
      :diagram="diagramXML"
      @modeler-shown="modelerLoaded"
      @modeler-selection-changed="selectionChanged"
      @modeler-element-changed="elementChanged"
      @modeler-doubleclick="$emit('modeler-doubleclick', $event)"
      class="col-span-4 h-132"
    ></BotModelerCanvas>
    <BotModelerPropertiesPanel
      class="col-span-1"
      v-if="modelerShown"
      :modeler="modeler"
      :element="element"
    ></BotModelerPropertiesPanel>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "bot-modeler",
  emits: ["modeler-doubleclick"],
  data() {
    return {
      modelerShown: false,
      modeler: undefined,
      selectedElements: [] as ModelerElement[],
      element: {} as ModelerElement,
      diagramXML: defaultDiagram as string,
    };
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
      const diagramXML = await this.modeler.saveXML();
    },

    clickOperation() {
      const elementFactory = this.modeler.get("elementFactory");
      const elementRegistry = this.modeler.get("elementRegistry");
      const modeling = this.modeler.get("modeling");

      const process = elementRegistry.get("Process_1");

      const task = elementFactory.createShape({ type: "bpmn:Task" });

      modeling.createShape(task, { x: 400, y: 100 }, process);

      modeling.updateLabel(task, "test");
    },
    dragOperation(e) {
      console.log(e);
      const definition = '{"type": "bpmn:Task"}';
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/json", definition);

      const bpmnDefinition = JSON.parse(definition);

      e.preventDefault();

      const elementFactory = this.modeler.get("elementFactory");
      const create = this.modeler.get("create");
      const modeling = this.modeler.get("modeling");

      const shape = elementFactory.createShape(bpmnDefinition);
      modeling.updateLabel(shape, "test");
      create.start(e, shape);
    },
  },
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
import BotModelerCanvas from "./BotModeler/BotModelerCanvas.vue";
import BotModelerPropertiesPanel from "./BotModeler/BotModelerPropertiesPanel.vue";
import {
  ModelerElement,
  ModelerEvent,
  ModelerSelectionChange,
} from "../interfaces/ModelerEvents";
import defaultDiagram from "../resources/defaultDiagram";
import BotOperationSidebar from "./BotModeler/BotOperationSidebar.vue";
</script>
