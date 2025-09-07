<template>
  <div class="m-3">
    <div v-if="element && element.businessObject">
      <div class="mb-6">
        <div class="text-center">
          {{ element.businessObject.$type }}
          - {{ element.businessObject.id }}
        </div>
        <hr />
        <label class="form-control w-full max-w-xs">
          <div class="label">
            <span class="label-text">Label</span>
          </div>
          <input
            type="text"
            class="input input-bordered w-full max-w-xs"
            v-model="currentLabel"
            placeholder="Label"
          />
        </label>
        <label class="form-control w-full max-w-xs">
          <div class="label">
            <span class="label-text">RPA Operation</span>
          </div>
          <select
            class="select select-bordered w-full max-w-xs"
            v-model="currentOperation"
          >
            <option disabled selected>Select an operation</option>
            <option
              v-for="operation in operationsAvailableForShape"
              :value="operation.id"
            >
              {{ operation.id }}
            </option>
          </select>
        </label>
        <div class="form-control w-full max-w-xs">
          <div class="label">
            <span class="label-text">Accessed Data</span>
          </div>
          <div
            v-if="accessedData.length > 0"
            class="border border-slate-200 rounded p-2"
          >
            <ul class="list-disc list-inside">
              <li v-for="dataRelation in accessedData">
                <span class="italic">
                  {{ dataRelation.type }} - {{ dataRelation.data.label }} ({{
                    dataRelation.data.concept.label
                  }})
                </span>
              </li>
            </ul>
          </div>
          <div v-else class="italic text-slate-400">No data accessed</div>
        </div>
      </div>
      <div
        v-if="currentOperation && currentOperation in operations"
        class="operation-description drop-shadow-md bg-slate-100 flex items-start p-2"
      >
        <FontAwesomeIcon :icon="faInfo" class="flex-initial mt-1 mr-2 ml-1" />

        <div class="flex-auto">
          <RpaElementExplainer
            :rpa-element="operations[currentOperation]"
            :position="explanationPosition"
          ></RpaElementExplainer>
          realizes the concept of
          <RpaElementExplainer
            :rpa-element="operations[currentOperation].concept"
            :position="explanationPosition"
          ></RpaElementExplainer>
          .<br />
          <span v-if="operations[currentOperation].automates">
            It automates the application
            <RpaElementExplainer
              :rpa-element="operations[currentOperation].automates"
              :position="explanationPosition"
            ></RpaElementExplainer>
            <span v-if="operations[currentOperation].accessedData.length > 0">
              and accesses
              <span
                v-for="(dataRelation, index) in operations[currentOperation]
                  .accessedData"
                :key="dataRelation.data.id"
              >
                <RpaElementExplainer
                  :rpa-element="dataRelation.data"
                  :position="explanationPosition"
                />
                <span
                  v-if="
                    index < operations[currentOperation].accessedData.length - 1
                  "
                  >,
                </span>
              </span>
            </span>
            .
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, PropType, toRaw } from "vue";
import { ModelerElement } from "../../interfaces/ModelerEvents";
import RpaElementExplainer from "../RpaElementExplainer.vue";
import {
  rpaOperations,
  rpaSoftware,
  rpaData,
  rpaContextContainers,
  rpaModules,
} from "../../utils/ontologyParser";
import { bpmnMapping } from "../../utils/bpmnMapping";
import {
  RpaContextContainer,
  RpaDataRelation,
  RpaOperation,
} from "../../interfaces/RpaOperation";
import { BpmoConcept } from "../../interfaces/BpmoConcepts";

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
      modules: rpaModules,
      currentOperation: "" as string | undefined,
      currentLabel: "" as string | undefined,
      explanationPosition: "left",
      accessedData: [] as RpaDataRelation[],
    };
  },
  methods: {
    getLabel(): string | undefined {
      const elementBO = this.getCurrentBusinessObject();
      if (!elementBO) {
        return;
      }
      return elementBO.name;
    },
    setLabel(newLabel: string): void {
      const modeling = this.modeler.get("modeling");
      modeling.updateLabel(toRaw(this.element), newLabel);
    },
    getRPAOperation(): string | undefined {
      const elementBO = this.getCurrentBusinessObject();
      if (elementBO && "rpa:operation" in elementBO.$attrs) {
        return elementBO.$attrs["rpa:operation"];
      }
    },
    setRPAOperation(newOperation: string) {
      const modeling = this.modeler.get("modeling");
      modeling.updateProperties(toRaw(this.element), {
        "rpa:operation": newOperation,
      });
    },
    getRPAAccessedData(): RpaDataRelation[] {
      const elementBO = this.getCurrentBusinessObject();
      if (
        elementBO &&
        "rpa:operation" in elementBO.$attrs &&
        this.operations[elementBO.$attrs["rpa:operation"]]
      ) {
        const rpaOperation = this.operations[elementBO.$attrs["rpa:operation"]];
        return rpaOperation.accessedData;
      } else if (
        elementBO &&
        "rpa:operation" in elementBO.$attrs &&
        this.modules[elementBO.$attrs["rpa:operation"]]
      ) {
        const module = this.modules[elementBO.$attrs["rpa:operation"]];
        return module.accessedData;
      }
      return [];
    },
    getCurrentBusinessObject() {
      if (!this.element || !this.element.id) {
        return;
      }
      const elementRegistry = this.modeler.get("elementRegistry");
      return elementRegistry.get(this.element.id).businessObject;
    },
  },
  watch: {
    element: function () {
      this.currentOperation = this.getRPAOperation();
      this.currentLabel = this.getLabel();
      this.accessedData = this.getRPAAccessedData();
    },
    currentOperation: function (newOperation, oldOperation) {
      if (newOperation === this.getRPAOperation()) {
        return;
      }
      this.setRPAOperation(newOperation);
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
  computed: {
    operationsAvailableForShape(): RpaOperation[] | RpaContextContainer[] {
      let bpmoConceptForCurrentShape: BpmoConcept | undefined = undefined;
      const currentBO = this.getCurrentBusinessObject();

      const currentBOType =
        currentBO.eventDefinitions?.length > 0
          ? currentBO.eventDefinitions[0]["$type"]
          : currentBO["$type"];

      for (const bpmoConcept in bpmnMapping) {
        if (bpmnMapping[bpmoConcept as BpmoConcept] === currentBOType) {
          bpmoConceptForCurrentShape = bpmoConcept as BpmoConcept;
        }
      }
      if (!bpmoConceptForCurrentShape) {
        return [];
      } else if (bpmoConceptForCurrentShape === BpmoConcept.CompoundActivity) {
        return Object.values(rpaContextContainers);
      } else {
        return Object.values(this.operations).filter(
          (operation) => operation.bpmoConcept === bpmoConceptForCurrentShape
        );
      }
    },
  },
  components: { RpaElementExplainer },
});
</script>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
</script>

<style scoped>
.operation-description:deep() .rpa-element-name {
  @apply italic;
}
hr {
  @apply my-2;
}
</style>
