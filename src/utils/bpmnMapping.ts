import { BpmoConcept } from "../interfaces/BpmoConcepts";

export const bpmnMapping: Record<BpmoConcept, string> = {
  Proxy: "bpmn:CallActivity",
  Decorator: "bpmn:SubProcess",
  ChainOfResponsibility: "bpmn:AdHocSubProcess",
  SequenceInjectionPoint: "bpmn:Task",
  AtomicActivity: "bpmn:Task",
  CompoundActivity: "bpmn:SubProcess",
  Facade: "bpmn:CallActivity",
  TemplateMethod: "bpmn:SubProcess",
  ExclusiveGateway: "bpmn:ExclusiveGateway",
  ParallelGateway: "bpmn:ParallelGateway",
  MessageEvent: "bpmn:MessageEventDefinition",
  TimerEvent: "bpmn:TimerEventDefinition",
  SignalEvent: "bpmn:SignalEventDefinition",
  DataStore: "bpmn:DataStoreReference",
  DataObject: "bpmn:DataObjectReference",
  EventBasedGateway: "bpmn:EventBasedGateway",
  IntermediateSignalCatchEvent: "bpmn:SignalEventDefinition",
  StartEvent: "bpmn:StartEvent",
  EndEvent: "bpmn:EndEvent",
};
