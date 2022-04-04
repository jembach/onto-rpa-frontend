import { BpmoConcept } from "../interfaces/bpmoConcepts";

export const bpmnMapping: Record<BpmoConcept, string> = {
  AtomicActivity: "bpmn:Task",
  CompoundActivity: "bpmn:Subprocess",
  ExclusiveGateway: "bpmn:ExclusiveGateway",
  ParallelGateway: "bpmn:ParallelGateway",
  MessageEvent: "bpmn:MessageEventDefinition",
  TimerEvent: "bpmn:TimerEventDefinition",
  SignalEvent: "bpmn:SignalEventDefinition",
};
