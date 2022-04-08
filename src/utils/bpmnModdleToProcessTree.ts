import {
  Definitions,
  FlowElement,
  FlowNode,
  Process,
  SequenceFlow,
  SubProcess,
} from "bpmn-moddle";

import YAML from "yaml";

/**
 * Parses a bpmn-js model to a BPMN-independent process tree as a nested list.
 *
 * @param bpmnModdle - Definitions object of a bpmn-js modeler
 */
export function bpmnModdleToProcessTree(bpmnModdle: Definitions) {
  const process: Process = bpmnModdle.rootElements[0] as Process;
  console.log(parseProcess(process)[0]);
  console.log(YAML.stringify(parseProcess(process)[0]));
}

/**
 * Parses a BPMN-moddle process object to a process tree.
 *
 * @param process
 *
 * @returns [ProcessTree, last element in flow]
 */
function parseProcess(
  process: Process | SubProcess
): [any[], FlowNode | undefined] {
  const sequenceFlows: SequenceFlow[] = process.flowElements.filter(
    (flowElement) => flowElement.$type === "bpmn:SequenceFlow"
  );

  const startFlow = getStartFlow(sequenceFlows);
  if (!startFlow || !startFlow.targetRef) {
    throw new Error("Startevent is not connected to flow!");
  }

  const [treePart, lastElement] = parseProcessFlowUntilElement(
    startFlow.targetRef,
    "bpmn:EndEvent"
  );

  return [{ Process: treePart }, lastElement];
}

/**
 * Parses a process flow until a certain modeling element is observed.
 *
 * @param startElement - The modeling element in which the flow to parse starts
 * @param TerminationElementType - The modeling element where to stop parsing
 * @returns [ProcessTree, last element in flow]
 */
function parseProcessFlowUntilElement(
  startElement: FlowNode,
  TerminationElementType: String
): [any[], FlowNode | undefined] {
  // console.log("Parsing flow starting in " + elementToString(startElement));

  const parsedProcess = [];
  let nextElementInFlow: FlowNode | undefined = startElement;
  while (
    nextElementInFlow &&
    nextElementInFlow.$type !== TerminationElementType
  ) {
    const [treePart, lastElement] = parseProcessSegment(nextElementInFlow);
    parsedProcess.push(treePart);

    if (lastElement && lastElement.outgoing) {
      nextElementInFlow = lastElement.outgoing[0].targetRef;
    } else {
      nextElementInFlow = undefined;
    }
  }

  if (parsedProcess.length === 1) {
    return [parsedProcess, nextElementInFlow];
  }
  return [{ Flow: parsedProcess }, nextElementInFlow];
}

/**
 * Parses an element, such as an activity, or a segment of process, like a parallel block, or a sub-process.
 *
 * @param currentElement - The modeling element to parse or where the segment starts
 * @returns [ProcessTree or single element, last element in flow]
 */
function parseProcessSegment(
  currentElement: FlowNode
): [string | any, FlowNode | undefined] {
  // console.log("Parsing " + elementToString(currentElement));
  switch (currentElement.$type) {
    case "bpmn:Task":
      return [currentElement.name || currentElement.id, currentElement];
    case "bpmn:ParallelGateway":
    case "bpmn:ExclusiveGateway":
      return parseSplittedControlflow(currentElement);
    case "bpmn:SubProcess":
      return parseProcess(currentElement as SubProcess);
    default:
      return ["", undefined];
  }
}

/**
 * Parses a block from a splitting gateway to its join.
 *
 * @param gatewayElement The gateway where the block starts
 * @returns [ProcessTree, last element in flow]
 */
function parseSplittedControlflow(
  gatewayElement: FlowNode
): [any, FlowNode | undefined] {
  // console.log(
  //   "Start analyzing splitted control flow for gateway " +
  //     elementToString(gatewayElement)
  // );
  const splittetControlflowBranches = [];
  const lastElementsOfBranches: FlowElement[] = [];

  gatewayElement.outgoing.forEach((branch) => {
    const [parsedFlowBranch, lastElement] = parseProcessFlowUntilElement(
      branch.targetRef,
      gatewayElement.$type
    );

    if (parsedFlowBranch.length === 1) {
      splittetControlflowBranches.push(parsedFlowBranch[0]);
    } else {
      splittetControlflowBranches.push(parsedFlowBranch);
    }

    if (lastElement) {
      lastElementsOfBranches.push(lastElement);
    }
  });

  // Ensure that really every branch ended with the same gateway (should be always true)
  if (
    !lastElementsOfBranches.every(
      (element) => element.id === lastElementsOfBranches[0].id
    )
  ) {
    throw new Error("Something is wrong with the structure of your diagram!");
  }

  return [{ Split: splittetControlflowBranches }, lastElementsOfBranches[0]];
}

/**
 * Find the sequence flow that originates from a start event.
 *
 * @param sequenceFlows - Set of sequence flows to analyze
 * @returns The sequence flow originating in start event
 */
function getStartFlow(sequenceFlows: SequenceFlow[]): SequenceFlow | undefined {
  return sequenceFlows.find(
    (sequenceFlow) => sequenceFlow.sourceRef.$type === "bpmn:StartEvent"
  );
}

function elementToString(element: FlowNode): string {
  return element.name || element.id + " (" + element.$type + ")";
}
