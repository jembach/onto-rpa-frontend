import { BpmoConcept } from "../interfaces/BpmoConcepts";

export const bpmnMapping: Record<BpmoConcept, string> = {
  AtomicActivity: "bpmn:Task",
  CompoundActivity: "bpmn:SubProcess",
  ExclusiveGateway: "bpmn:ExclusiveGateway",
  ParallelGateway: "bpmn:ParallelGateway",
  MessageEvent: "bpmn:MessageEventDefinition",
  TimerEvent: "bpmn:TimerEventDefinition",
  SignalEvent: "bpmn:SignalEventDefinition",
  DataStore: "bpmn:DataStoreReference",
  DataObject: "bpmn:DataObjectReference",
};
