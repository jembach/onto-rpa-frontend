import { BpmoConcept } from "../interfaces/BpmoConcepts";

export const bpmnMapping: Record<BpmoConcept, string> = {
  AtomicActivity: "bpmn:Task",
  CompoundActivity: "bpmn:SubProcess",
  Module: "bpmn:CallActivity",
  Template: "bpmn:SubProcess",
  TemplatePlaceholder: "bpmn:CallActivity",
  ExclusiveGateway: "bpmn:ExclusiveGateway",
  ParallelGateway: "bpmn:ParallelGateway",
  MessageEvent: "bpmn:MessageEventDefinition",
  TimerEvent: "bpmn:TimerEventDefinition",
  SignalEvent: "bpmn:SignalEventDefinition",
  DataStore: "bpmn:DataStoreReference",
  DataObject: "bpmn:DataObjectReference",
};
