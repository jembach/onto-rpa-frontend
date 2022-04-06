import {
  Definitions,
  FlowElement,
  FlowNode,
  Process,
  SequenceFlow,
  SubProcess,
  Task,
} from "bpmn-moddle";

import YAML from "yaml";

export function bpmnModdleToProcessTree(bpmnModdle: Definitions) {
  const process: Process = bpmnModdle.rootElements[0] as Process;
  //   console.log(parseProcess(process)[0]);
  console.log(YAML.stringify(parseProcess(process)[0]));
}

function parseProcess(
  process: Process | SubProcess
): [any[], FlowNode | undefined] {
  console.log(process);
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

function parseProcessFlowUntilElement(
  currentElement: FlowNode,
  TerminationElementType: String
): [any[], FlowNode | undefined] {
  console.log("Parsing flow starting in " + elementToString(currentElement));

  const parsedProcess = [];
  let nextElementInFlow: FlowNode | undefined = currentElement;
  while (
    nextElementInFlow &&
    nextElementInFlow.$type !== TerminationElementType
  ) {
    const [treePart, lastElement] = parseProcessSegment(nextElementInFlow);
    parsedProcess.push(treePart);
    console.log(treePart);
    console.log(lastElement);
    if (lastElement && lastElement.outgoing) {
      nextElementInFlow = lastElement.outgoing[0].targetRef;
    } else {
      nextElementInFlow = undefined;
    }
  }
  if (parsedProcess.length === 1) {
    return [parsedProcess[0], nextElementInFlow];
  }
  return [{ Flow: parsedProcess }, nextElementInFlow];
}

function parseProcessSegment(
  currentElement: FlowNode
): [string | any, FlowNode | undefined] {
  console.log("Parsing " + elementToString(currentElement));
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
      break;
  }
}

function parseSplittedControlflow(
  currentElement: FlowNode
): [string | any, FlowNode | undefined] {
  console.log(
    "Start analyzing splitted control flow for gateway " +
      elementToString(currentElement)
  );
  const splittetControlflowBranches = [];
  const lastElementsOfBranches: FlowElement[] = [];
  currentElement.outgoing.forEach((branch) => {
    console.log(branch);
    const [parsedFlowBranch, lastElement] = parseProcessFlowUntilElement(
      branch.targetRef,
      currentElement.$type
    );

    splittetControlflowBranches.push(parsedFlowBranch);
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
  console.log(splittetControlflowBranches);
  return [{ Split: splittetControlflowBranches }, lastElementsOfBranches[0]];
}

function parseSubprocess(
  currentElement: FlowNode
): [string | any, FlowNode | undefined] {}

function getStartFlow(sequenceFlows: SequenceFlow[]): SequenceFlow | undefined {
  return sequenceFlows.find(
    (sequenceFlow) => sequenceFlow.sourceRef.$type === "bpmn:StartEvent"
  );
}

function elementToString(element: FlowNode): string {
  return element.name || element.id + " (" + element.$type + ")";
}
