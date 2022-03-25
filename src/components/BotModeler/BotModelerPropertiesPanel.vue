<template>
  <div class="m-3">
    <div v-if="element && element.businessObject">
      <div class="text-center">
        {{ element.businessObject.$type }}
        - {{ element.businessObject.id }}
      </div>
      <hr />
      <o-field label="Label">
        <o-input v-model="currentLabel" placeholder="Label" />
      </o-field>
      <div v-if="element.businessObject.$type === 'bpmn:Task'">
        <o-field label="RPA Operation">
          <o-select
            placeholder="Select an operation"
            v-model="currentOperation"
          >
            <option v-for="operation in operations" :value="operation.name">
              {{ operation.name }}
            </option>
          </o-select>
        </o-field>
      </div>
      <hr />
      <div v-if="currentOperation">
        The operation
        <span class="italic">{{ operations[currentOperation].name }}</span>
        realizes the concept of
        <span class="italic">{{ operations[currentOperation].concept }}</span
        >. It automates the application
        <span class="italic">{{ operations[currentOperation].automates }}</span>
        and accesses
        <span class="italic">{{ operations[currentOperation].accesses }}</span
        >.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, PropType, toRaw } from "vue";
import { ModelerElement } from "../../interfaces/ModelerEvents";
import {
  rpaOperations,
  rpaSoftware,
  rpaData,
} from "../../utils/ontologyParser";

export default defineComponent({
  name: "bot-modeler-properties-panel",
  props: {
    modeler: {
      type: Object,
      required: true,
    },
    element: {
      type: Object as PropType<ModelerElement>,
      required: false,
    },
  },
  data() {
    return {
      operations: rpaOperations.individuals,
      currentOperation: "" as string | undefined,
      currentLabel: "" as string | undefined,
    };
  },
  methods: {
    getLabel(): string | undefined {
      if (!this.element || !this.element.id) {
        return;
      }
      const elementRegistry = this.modeler.get("elementRegistry");
      return elementRegistry.get(this.element.id).businessObject.name;
    },
    setLabel(newLabel: string): void {
      const modeling = this.modeler.get("modeling");
      modeling.updateLabel(toRaw(this.element), newLabel);
    },
    getRPAOperation(): string | undefined {
      if (!this.element || !this.element.id) {
        return;
      }
      const elementRegistry = this.modeler.get("elementRegistry");
      const elementBO = elementRegistry.get(this.element.id).businessObject;
      if ("rpa:operation" in elementBO.$attrs) {
        return elementBO.$attrs["rpa:operation"];
      }
    },
    setRPAOperation(newOperation: string) {
      const modeling = this.modeler.get("modeling");

      modeling.updateProperties(toRaw(this.element), {
        "rpa:operation": newOperation,
      });
    },
  },
  watch: {
    element: function () {
      this.currentOperation = this.getRPAOperation();
      this.currentLabel = this.getLabel();
    },
    currentOperation: function (newOperation, oldOperation) {
      if (newOperation === this.getRPAOperation()) {
        return;
      }
      this.setRPAOperation(newOperation);
      console.log(this.currentLabel);
      if (this.currentLabel === oldOperation || !this.currentLabel) {
        this.currentLabel = newOperation;
      }
    },
    currentLabel: function (newLabel, oldLabel) {
      if (newLabel === this.getLabel()) {
        return;
      }
      this.setLabel(newLabel);
    },
  },
});
</script>
