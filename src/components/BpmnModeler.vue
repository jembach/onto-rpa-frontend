<template>
  <div class="grid grid-cols-5">
    <BpmnModelerCanvas
      :diagram="diagramXML"
      @modeler-shown="modelerLoaded"
      @modeler-selection-changed="selectionChanged"
      @modeler-element-changed="elementChanged"
      @modeler-doubleclick="$emit('modeler-doubleclick', $event)"
      class="col-span-4 h-132"
    ></BpmnModelerCanvas>
    <BpmnModelerPropertiesPanel
      class="col-span-1"
      v-if="modelerShown"
      :modeler="modeler"
      :element="element"
    ></BpmnModelerPropertiesPanel>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "modeler",
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
      this.saveDiagram();

      if (!this.element) {
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
  },
});
</script>

<script setup lang="ts">
import { defineComponent } from "vue";
import BpmnModelerCanvas from "./BpmnModelerCanvas.vue";
import BpmnModelerPropertiesPanel from "./BpmnModelerPropertiesPanel.vue";
import {
  ModelerElement,
  ModelerEvent,
  ModelerSelectionChange,
} from "../interfaces/ModelerEvents";
import defaultDiagram from "../resources/defaultDiagram";
</script>
