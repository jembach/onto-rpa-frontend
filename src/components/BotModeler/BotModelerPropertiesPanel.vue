<template>
  <div class="m-3">
    <div v-if="element && element.businessObject">
      <div class="mb-6">
        <div class="text-center">
          {{ element.businessObject.$attrs?.["rpa:concept"] ?? "" }}
          {{ element.businessObject.$attrs?.["rpa:concept"] ? "-" : "" }}
          {{ element.businessObject.$type }}
          - {{ element.businessObject.id }}
        </div>
        <router-link
          v-if="isReuseConcept"
          :to="{
            name: 'ModelerWithType',
            params: { type: concept, modelId: rpaOperation },
          }"
          target="_blank"
          class="btn btn-sm w-full my-2"
          >Inspect Reuse Concept
        </router-link>
        <hr />
        <label
          class="form-control w-full max-w-xs"
          v-if="
            element.businessObject.$type !== 'bpmn:DataInputAssociation' &&
            element.businessObject.$type !== 'bpmn:DataOutputAssociation' &&
            element.businessObject.$type !== 'bpmn:SequenceFlow'
          "
        >
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
        <label
          class="form-control w-full max-w-xs"
          v-if="
            element.businessObject &&
            element.businessObject.$attrs?.['rpa:concept'] !==
              'SequenceInjectionPoint' &&
            element.businessObject.$type !== 'bpmn:DataInputAssociation' &&
            element.businessObject.$type !== 'bpmn:DataOutputAssociation' &&
            element.businessObject.$type !== 'bpmn:DataObjectReference' &&
            element.businessObject.$type !== 'bpmn:DataStoreReference' &&
            element.businessObject.$type !== 'bpmn:SequenceFlow'
          "
        >
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
              {{ operation.label }}
            </option>
          </select>
        </label>
        <label
          class="form-control w-full max-w-xs"
          v-if="
            element.businessObject.$type === 'bpmn:DataObjectReference' ||
            element.businessObject.$type === 'bpmn:DataStoreReference'
          "
        >
          <div class="label">
            <span class="label-text">Data Type</span>
          </div>
          <select
            class="select select-bordered w-full max-w-xs"
            v-model="currentDataType"
          >
            <option disabled selected>Select a data type</option>
            <option v-for="data in dataTypesAvailableForShape" :value="data.id">
              {{ data.id }}
            </option>
          </select>
        </label>
        <label
          class="form-control w-full max-w-xs"
          v-if="
            element.businessObject.$type === 'bpmn:DataInputAssociation' ||
            element.businessObject.$type === 'bpmn:DataOutputAssociation'
          "
        >
          <div class="label">
            <span class="label-text">Data Relation</span>
          </div>
          <select
            class="select select-bordered w-full max-w-xs"
            v-model="currentDataRelation"
          >
            <option disabled selected>Select a relation</option>
            <option
              v-for="relation in dataRelationsAvailableForShape"
              :value="relation"
            >
              {{ relation }}
            </option>
          </select>
        </label>
        <div
          class="form-control w-full max-w-xs"
          v-if="
            element.businessObject &&
            element.businessObject.$type !== 'bpmn:DataInputAssociation' &&
            element.businessObject.$type !== 'bpmn:DataOutputAssociation' &&
            element.businessObject.$type !== 'bpmn:DataObjectReference' &&
            element.businessObject.$type !== 'bpmn:DataStoreReference' &&
            element.businessObject.$type !== 'bpmn:SequenceFlow'
          "
        >
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
              :rpa-element="operations[currentOperation].automates!"
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
import { defineComponent, PropType, toRaw } from "vue";
import intersection from "lodash/intersection";
import { ModelerElement } from "../../interfaces/ModelerEvents";
import RpaElementExplainer from "../RpaElementExplainer.vue";
import {
  rpaOperations,
  rpaContextContainers,
  getRpaReuseFacades,
  getRpaReuseProxies,
  getRpaReuseDecorators,
  getRpaReuseChainOfResponsibilities,
  getRpaReuseTemplateMethods,
  rpaData,
  rpaTransientData,
  rpaDataResource,
} from "../../utils/ontologyParser";
import { bpmnMapping } from "../../utils/bpmnMapping";
import {
  RpaContextContainer,
  RpaDataRelation,
  RpaReuseFacade,
  RpaReuseProxy,
  RpaReuseDecorator,
  RpaReuseChainOfResponsibility,
  RpaReuseTemplateMethod,
  RpaDataResourceAccessType,
  RpaTransientDataAccessType,
  RpaData,
} from "../../interfaces/RpaOperation";
import { BpmoConcept } from "../../interfaces/BpmoConcepts";
import { BotModelType } from "../../interfaces/BotModel";

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
    botType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      operations: rpaOperations.individuals,
      transientData: rpaTransientData.individuals,
      dataResource: rpaDataResource.individuals,
      data: rpaData.individuals,
      facades: [] as RpaReuseFacade[],
      proxies: [] as RpaReuseProxy[],
      decorators: [] as RpaReuseDecorator[],
      chainOfResponsibilities: [] as RpaReuseChainOfResponsibility[],
      templateMethods: [] as RpaReuseTemplateMethod[],
      currentOperation: "" as string | undefined,
      currentDataType: "" as string | undefined,
      currentDataRelation: "" as string | undefined,
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
    getRPAAccessedData(businessObject: any): RpaDataRelation[] {
      if (!businessObject) {
        return [];
      }

      const elementBO = this.getBussinessObject(businessObject?.id);
      const [rpaOperation, injectionPoint, direction] = (
        elementBO.$attrs["rpa:operation"] ?? ""
      ).split("#");

      const filterDirection = (accessedData: RpaDataRelation) => {
        if (!direction) {
          return true;
        }
        if (direction === "start") {
          return (
            accessedData.type === RpaTransientDataAccessType.YIELDS ||
            accessedData.type === RpaTransientDataAccessType.TRANSFORMS_TO ||
            accessedData.type === RpaDataResourceAccessType.PROVIDES
          );
        } else if (direction === "end") {
          return (
            accessedData.type === RpaTransientDataAccessType.REQUIRES ||
            accessedData.type === RpaTransientDataAccessType.TRANSFORMS_FROM ||
            accessedData.type === RpaDataResourceAccessType.TAKES
          );
        }
        return true;
      };

      if (!rpaOperation) {
        return [];
      }

      const operation = this.operations[rpaOperation];
      if (operation) {
        return operation.accessedData;
      }

      const facade = this.facades.find((f) => f.id === rpaOperation);
      if (facade) {
        return facade.accessedData;
      }

      const proxy = this.proxies.find((p) => p.id === rpaOperation);
      if (proxy) {
        return proxy.accessedData;
      }

      const decorator = this.decorators.find((d) => d.id === rpaOperation);
      if (decorator) {
        if (injectionPoint) {
          const injectionPointData = decorator.injectionPoints.find(
            (ip) => ip.id === injectionPoint
          );
          return injectionPointData
            ? injectionPointData.accessedData.filter(filterDirection)
            : [];
        }

        return decorator.accessedData;
      }

      const chainOfResponsibility = this.chainOfResponsibilities.find(
        (c) => c.id === rpaOperation
      );
      if (chainOfResponsibility) {
        if (injectionPoint) {
          const injectionPointData = chainOfResponsibility.injectionPoints.find(
            (ip) => ip.id === injectionPoint
          );
          return injectionPointData
            ? injectionPointData.accessedData.filter(filterDirection)
            : [];
        }

        return chainOfResponsibility.accessedData;
      }

      const templateMethod = this.templateMethods.find(
        (t) => t.id === rpaOperation
      );
      if (templateMethod) {
        if (injectionPoint) {
          const injectionPointData = templateMethod.injectionPoints.find(
            (ip) => ip.id === injectionPoint
          );
          return injectionPointData
            ? injectionPointData.accessedData.filter(filterDirection)
            : [];
        }

        return templateMethod.accessedData;
      }

      return [];
    },
    getCurrentBusinessObject() {
      // @ts-ignore
      return this.getBussinessObject(this.element?.id);
    },
    getBussinessObject(id?: string) {
      if (!id) {
        return;
      }
      const elementRegistry = this.modeler.get("elementRegistry");
      return elementRegistry.get(id).businessObject;
    },
  },
  watch: {
    element: function () {
      this.currentOperation = this.getRPAOperation();
      this.currentDataType = this.getRPAOperation();
      this.currentDataRelation = this.getRPAOperation();
      this.currentLabel = this.getLabel();
      this.accessedData = this.getRPAAccessedData(
        this.getCurrentBusinessObject()
      );
    },
    currentOperation: function (newOperation, oldOperation) {
      const newOperationConfig = this.operationsAvailableForShape.find(
        (op) => op.id === newOperation
      );

      if (!newOperationConfig || newOperation === this.getRPAOperation()) {
        return;
      }

      this.setRPAOperation(newOperation);
      if (this.currentLabel === oldOperation || !this.currentLabel) {
        this.currentLabel = newOperationConfig.label;
      }
      this.accessedData = this.getRPAAccessedData(
        this.getCurrentBusinessObject()
      );
    },
    currentDataType: function (newOperation, oldOperation) {
      if (!newOperation || newOperation === this.getRPAOperation()) {
        return;
      }
      this.setRPAOperation(newOperation);

      if (this.currentLabel === oldOperation || !this.currentLabel) {
        this.currentLabel = newOperation;
      }
    },
    currentDataRelation: function (newOperation) {
      if (!newOperation || newOperation === this.getRPAOperation()) {
        return;
      }
      this.setRPAOperation(newOperation);
    },
    currentLabel: function (newLabel, oldLabel) {
      if (newLabel === this.getLabel()) {
        return;
      }
      this.setLabel(newLabel);
    },
  },
  computed: {
    rpaOperation() {
      const elementBO = this.getCurrentBusinessObject();
      if (!elementBO) {
        return;
      }

      const [rpaOperation] = (elementBO.$attrs["rpa:operation"] ?? "").split(
        "#"
      );

      return rpaOperation;
    },
    injectionPoint() {
      const elementBO = this.getCurrentBusinessObject();
      if (!elementBO) {
        return;
      }

      const [_rpaOperation, injectionPoint] = (
        elementBO.$attrs["rpa:operation"] ?? ""
      ).split("#");

      return injectionPoint;
    },
    direction() {
      const elementBO = this.getCurrentBusinessObject();
      if (!elementBO) {
        return;
      }

      const [_rpaOperation, _injectionPoint, direction] = (
        elementBO.$attrs["rpa:operation"] ?? ""
      ).split("#");

      return direction;
    },
    concept() {
      const elementBO = this.getCurrentBusinessObject();

      if (!elementBO) {
        return;
      }
      return elementBO.$attrs?.["rpa:concept"];
    },
    isReuseConcept(): boolean {
      const reuseConcepts = [
        BpmoConcept.Facade,
        BpmoConcept.Proxy,
        BpmoConcept.Decorator,
        BpmoConcept.ChainOfResponsibility,
        BpmoConcept.TemplateMethod,
      ];
      console.log(this.concept);
      return reuseConcepts.includes(this.concept);
    },

    operationsAvailableForShape(): { id: string; label?: string }[] {
      const currentBO = this.getCurrentBusinessObject();

      if (!currentBO) {
        return [];
      }

      const currentBOType =
        currentBO.eventDefinitions?.length > 0
          ? currentBO.eventDefinitions[0]["$type"]
          : currentBO["$type"];

      let bpmoConceptForCurrentShape: BpmoConcept | undefined;

      if (
        currentBO.$attrs["rpa:concept"] &&
        Object.values(BpmoConcept).includes(currentBO.$attrs["rpa:concept"])
      ) {
        bpmoConceptForCurrentShape = currentBO.$attrs["rpa:concept"];
      } else {
        for (const bpmoConcept in bpmnMapping) {
          if (bpmnMapping[bpmoConcept as BpmoConcept] === currentBOType) {
            bpmoConceptForCurrentShape = bpmoConcept as BpmoConcept;
          }
        }
      }

      if (!bpmoConceptForCurrentShape) {
        return [];
      } else if (bpmoConceptForCurrentShape === BpmoConcept.Facade) {
        return this.facades;
      } else if (bpmoConceptForCurrentShape === BpmoConcept.Proxy) {
        return this.proxies;
      } else if (bpmoConceptForCurrentShape === BpmoConcept.Decorator) {
        return this.decorators;
      } else if (
        bpmoConceptForCurrentShape === BpmoConcept.ChainOfResponsibility
      ) {
        return this.chainOfResponsibilities;
      } else if (bpmoConceptForCurrentShape === BpmoConcept.TemplateMethod) {
        return this.templateMethods;
      } else if (bpmoConceptForCurrentShape === BpmoConcept.CompoundActivity) {
        return Object.values(rpaContextContainers).map(
          (contextContainer: RpaContextContainer) => ({
            id: contextContainer.id,
            label: contextContainer.id,
          })
        );
      } else {
        return Object.values(this.operations)
          .filter(
            (operation) => operation.bpmoConcept === bpmoConceptForCurrentShape
          )
          .map((operation) => ({
            id: operation.id,
            label: operation.id,
          }));
      }
    },
    dataTypesAvailableForShape(): RpaData[] {
      const currentBO = this.getCurrentBusinessObject();

      const currentBOType =
        currentBO.eventDefinitions?.length > 0
          ? currentBO.eventDefinitions[0]["$type"]
          : currentBO["$type"];

      if (currentBOType === "bpmn:DataObjectReference") {
        return Object.values(this.transientData);
      } else if (currentBOType === "bpmn:DataStoreReference") {
        return Object.values(this.dataResource);
      } else {
        return [];
      }
    },
    dataRelationsAvailableForShape(): (
      | RpaDataResourceAccessType
      | RpaTransientDataAccessType
    )[] {
      const currentBO = this.getCurrentBusinessObject();

      if (!currentBO) {
        return [];
      }

      const targetBO = this.getBussinessObject(
        currentBO?.sourceRef ? currentBO.$parent.id : currentBO.targetRef?.id
      );
      const sourceBO = this.getBussinessObject(
        currentBO?.sourceRef ? currentBO.sourceRef[0].id : currentBO.$parent.id
      );

      if (!targetBO || !sourceBO) {
        return [];
      }

      const currentBOType =
        currentBO.eventDefinitions?.length > 0
          ? currentBO.eventDefinitions[0]["$type"]
          : currentBO["$type"];

      const targetBOType =
        targetBO.eventDefinitions?.length > 0
          ? targetBO.eventDefinitions[0]["$type"]
          : targetBO["$type"];
      const targetBORpaConcept = targetBO.$attrs["rpa:concept"];

      const sourceBOType =
        sourceBO.eventDefinitions?.length > 0
          ? sourceBO.eventDefinitions[0]["$type"]
          : sourceBO["$type"];
      const sourceBORpaConcept = sourceBO.$attrs["rpa:concept"];

      console.log(currentBOType, sourceBOType, targetBOType);

      if (currentBOType === "bpmn:DataOutputAssociation") {
        if (
          (sourceBOType === "bpmn:StartEvent" ||
            sourceBORpaConcept === "SequenceInjectionPoint") &&
          targetBOType === "bpmn:DataObjectReference"
        ) {
          return this.botType === BotModelType.PROXY
            ? [
                RpaTransientDataAccessType.TRANSFORMS_FROM,
                RpaTransientDataAccessType.YIELDS,
              ]
            : [RpaTransientDataAccessType.YIELDS];
        } else if (
          (sourceBOType === "bpmn:StartEvent" ||
            sourceBORpaConcept === "SequenceInjectionPoint") &&
          targetBOType === "bpmn:DataStoreReference"
        ) {
          return [RpaDataResourceAccessType.PROVIDES];
        }
        console.log(sourceBO, this.getRPAAccessedData(sourceBO));
        const sourceBODataAccessTypes = this.getRPAAccessedData(sourceBO).map(
          (dataRelation) => dataRelation.type
        ) satisfies (RpaDataResourceAccessType | RpaTransientDataAccessType)[];

        if (targetBOType === "bpmn:DataObjectReference") {
          return intersection(
            [
              RpaTransientDataAccessType.YIELDS,
              RpaTransientDataAccessType.TRANSFORMS_TO,
            ],
            sourceBODataAccessTypes
          );
        } else if (targetBOType === "bpmn:DataStoreReference") {
          return intersection(
            [
              RpaDataResourceAccessType.CLOSES,
              RpaDataResourceAccessType.DELETES,
              RpaDataResourceAccessType.CREATES,
              RpaDataResourceAccessType.DIRECTLYWRITES,
              RpaDataResourceAccessType.IMPLICITLYWRITES,
              RpaDataResourceAccessType.PERSISTS,
              RpaDataResourceAccessType.PROVIDES,
              RpaDataResourceAccessType.PROVISIONS,
              RpaDataResourceAccessType.PROVISIONSNEW,
            ],
            sourceBODataAccessTypes
          );
        }
      } else if (currentBOType === "bpmn:DataInputAssociation") {
        if (
          (targetBOType === "bpmn:EndEvent" ||
            targetBORpaConcept === "SequenceInjectionPoint") &&
          sourceBOType === "bpmn:DataObjectReference"
        ) {
          return this.botType === BotModelType.PROXY
            ? [
                RpaTransientDataAccessType.TRANSFORMS_TO,
                RpaTransientDataAccessType.REQUIRES,
              ]
            : [RpaTransientDataAccessType.REQUIRES];
        } else if (
          (targetBOType === "bpmn:EndEvent" ||
            targetBORpaConcept === "SequenceInjectionPoint") &&
          sourceBOType === "bpmn:DataStoreReference"
        ) {
          return [RpaDataResourceAccessType.TAKES];
        }

        const targetBODataAccessTypes = this.getRPAAccessedData(targetBO).map(
          (dataRelation) => dataRelation.type
        ) satisfies (RpaDataResourceAccessType | RpaTransientDataAccessType)[];

        if (sourceBOType === "bpmn:DataObjectReference") {
          return intersection(
            [
              RpaTransientDataAccessType.REQUIRES,
              RpaTransientDataAccessType.TRANSFORMS_FROM,
            ],
            targetBODataAccessTypes
          );
        } else if (sourceBOType === "bpmn:DataStoreReference") {
          return intersection(
            [
              RpaDataResourceAccessType.DIRECTLYREADS,
              RpaDataResourceAccessType.IMPLICITLYREADS,
              RpaDataResourceAccessType.TAKES,
            ],
            targetBODataAccessTypes
          );
        }
      }

      return [];
    },
  },
  async mounted() {
    this.facades = Object.values(
      await getRpaReuseFacades()
    ) as RpaReuseFacade[];
    this.proxies = Object.values(await getRpaReuseProxies()) as RpaReuseProxy[];
    this.decorators = Object.values(
      await getRpaReuseDecorators()
    ) as RpaReuseDecorator[];
    this.chainOfResponsibilities = Object.values(
      await getRpaReuseChainOfResponsibilities()
    ) as RpaReuseChainOfResponsibility[];
    this.templateMethods = Object.values(
      await getRpaReuseTemplateMethods()
    ) as RpaReuseTemplateMethod[];
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
