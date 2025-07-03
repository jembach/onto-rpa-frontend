import {
  Activity,
  Definitions,
  FlowElement,
  FlowNode,
  ItemAwareElement,
  Process,
  SequenceFlow,
  SubProcess,
} from "bpmn-moddle";
import {
  ProcessTreeNodeInfo,
  ProcessTree,
  ProcessTreeStructure,
} from "../interfaces/BotModel";
import YAML from "yaml";

class BpmnModdleParser {
  processTreeNodes: Record<string, ProcessTreeNodeInfo> = {};
  dataResourceInfo: Record<string, ProcessTreeNodeInfo> = {};
  transientDataInfo: Record<string, ProcessTreeNodeInfo> = {};

  /**
   * Parses a bpmn-js model to a BPMN-independent process tree as a nested list.
   *
   * @param bpmnModdle - Definitions object of a bpmn-js modeler
   */
  parseBpmnModdle(bpmnModdle: Definitions): ProcessTree {
    const process: Process = bpmnModdle.rootElements[0] as Process;
    const parsedProcess = this.parseProcess(process)[0];

    console.log(this.processTreeNodes);
    //console.log(JSON.stringify(parsedProcess));
    console.log(YAML.stringify(parsedProcess));

    const generatedProcessTree: ProcessTree = {
      tree: parsedProcess,
      nodeInfo: this.processTreeNodes,
      dataResourceInfo: this.dataResourceInfo,
      transientDataInfo: this.transientDataInfo,
    };

    // console.log(generatedProcessTree);

    return generatedProcessTree;
  }

  /**
   * Parses a BPMN-moddle process object to a process tree.
   *
   * @param process
   *
   * @returns [ProcessTree, last element in flow]
   */
  private parseProcess(
    process: Process | SubProcess
  ): [ProcessTreeStructure, FlowNode | undefined] {
    const startFlow = BpmnModdleParser.getStartFlowOfProcess(process);
    const processTree: ProcessTreeStructure = {};

    if (!startFlow || !startFlow.targetRef) {
      throw new Error("Startevent is not connected to flow!");
    }

    const [treePart, lastElement] = this.parseProcessFlowUntilElement(
      startFlow.targetRef,
      "bpmn:EndEvent"
    );

    if (process.$attrs && "rpa:operation" in process.$attrs) {
      // @ts-expect-error untyped
      processTree[process.id] = treePart;
      // @ts-expect-error untyped
      this.addProcessNodeInfo(process);
    } else {
      // @ts-expect-error untyped
      processTree["Process"] = treePart;
    }
    // last node can not be the end-event! Otherwise, sub-processes would terminate
    // the parsing as their end events have no outgoing flow to the subsequent parts, but the sub-process itself.

    // @ts-expect-error untyped
    return [processTree, process];
  }

  /**
   * Parses a process flow until a certain modeling element is observed.
   *
   * @param startElement - The modeling element in which the flow to parse starts
   * @param TerminationElementType - The modeling element where to stop parsing
   * @returns [ProcessTree, last element in flow]
   */
  private parseProcessFlowUntilElement(
    startElement: FlowNode,
    TerminationElementType: String
  ): [
    ProcessTreeStructure | ProcessTreeStructure[] | string[],
    FlowNode | undefined
  ] {
    // console.log("Parsing flow starting in " + elementToString(startElement));

    const parsedProcess: (string | ProcessTreeStructure)[] = [];
    let nextElementInFlow: FlowNode | undefined = startElement;

    while (
      nextElementInFlow &&
      nextElementInFlow.$type !== TerminationElementType
    ) {
      const [treePart, lastElement] =
        this.parseProcessSegment(nextElementInFlow);
      parsedProcess.push(treePart);

      if (lastElement && lastElement.outgoing) {
        nextElementInFlow = lastElement.outgoing[0].targetRef;
      } else {
        nextElementInFlow = undefined;
      }
    }

    if (parsedProcess.length === 1) {
      // @ts-expect-error untyped
      return [parsedProcess, nextElementInFlow];
    }
    return [[{ Flow: parsedProcess }], nextElementInFlow];
  }

  /**
   * Parses an element, such as an activity, or a segment of process, like a parallel block, or a sub-process.
   *
   * @param currentElement - The modeling element to parse or where the segment starts
   * @returns [ProcessTree or single element, last element in flow]
   */
  private parseProcessSegment(
    currentElement: FlowNode
  ): [string | ProcessTreeStructure, FlowNode | undefined] {
    // console.log("Parsing " + elementToString(currentElement));
    switch (currentElement.$type) {
      case "bpmn:Task":
        this.addProcessNodeInfo(currentElement);
        return [currentElement.id, currentElement];
      case "bpmn:ParallelGateway":
      case "bpmn:ExclusiveGateway":
        return this.parseSplittedControlflow(currentElement);
      case "bpmn:SubProcess":
        return this.parseProcess(currentElement as SubProcess);
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
  private parseSplittedControlflow(
    gatewayElement: FlowNode
  ): [ProcessTreeStructure, FlowNode | undefined] {
    // console.log(
    //   "Start analyzing splitted control flow for gateway " +
    //     elementToString(gatewayElement)
    // );
    const splittetControlflowBranches: (string | ProcessTreeStructure)[] = [];
    const lastElementsOfBranches: FlowElement[] = [];

    gatewayElement.outgoing.forEach((branch) => {
      const [parsedFlowBranch, lastElement] = this.parseProcessFlowUntilElement(
        branch.targetRef,
        gatewayElement.$type
      );

      if (parsedFlowBranch.length === 1) {
        // @ts-expect-error untyped
        splittetControlflowBranches.push(parsedFlowBranch[0]);
      } else {
        // @ts-expect-error untyped
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

    const gatewayId = gatewayElement.id;

    this.addProcessNodeInfo(gatewayElement);
    const gatewayProcessTree: ProcessTreeStructure = {};
    gatewayProcessTree[gatewayElement.id] = splittetControlflowBranches;

    // @ts-expect-error untyped
    return [gatewayProcessTree, lastElementsOfBranches[0]];
  }

  private addProcessNodeInfo(element: FlowNode): void {
    if (!element.$attrs || !("rpa:operation" in element.$attrs)) {
      throw new Error(
        "Not all elements are correctly configured with an RPA operation."
      );
    }

    const nodeInfo: ProcessTreeNodeInfo = {
      label: element.name || element.id,
      concept: element.$attrs["rpa:operation"],
    };

    // Look for data associations
    if (element.$type === "bpmn:Task") {
      const resourceInput: string[] = [];
      const resourceOutput: string[] = [];
      const variableInput: string[] = [];
      const variableOutput: string[] = [];

      // @ts-expect-error untyped
      if (element.dataInputAssociations) {
        // @ts-expect-error untyped
        element.dataInputAssociations.forEach((association) => {
          const dataInformationObject = association.sourceRef[0];
          if (dataInformationObject.$type === "bpmn:DataStoreReference") {
            resourceInput.push(dataInformationObject.id);
          } else {
            variableInput.push(dataInformationObject.id);
          }
          this.addDataInfo(dataInformationObject);
        });
      }
      // @ts-expect-error untyped
      if (element.dataOutputAssociations) {
        // @ts-expect-error untyped
        element.dataOutputAssociations.forEach((association) => {
          const dataInformationObject = association.targetRef;
          if (dataInformationObject.$type === "bpmn:DataStoreReference") {
            resourceOutput.push(dataInformationObject.id);
          } else {
            variableOutput.push(dataInformationObject.id);
          }
          this.addDataInfo(dataInformationObject);
        });
      }
      if (resourceInput.length > 0) {
        nodeInfo.dataResourceInput = resourceInput;
      }
      if (variableInput.length > 0) {
        nodeInfo.variableInput = variableInput;
      }
      if (resourceOutput.length > 0) {
        nodeInfo.dataResourceOutput = resourceOutput;
      }
      if (variableOutput.length > 0) {
        nodeInfo.variableOutput = variableOutput;
      }
    }

    // Get basic information about the element
    this.processTreeNodes[element.id] = nodeInfo;
  }

  private addDataInfo(dataNode: ItemAwareElement): void {
    const nodeInfo: ProcessTreeNodeInfo = {
      // @ts-expect-error untyped
      label: dataNode.name || dataNode.id,
      // @ts-expect-error untyped
      concept: dataNode.$attrs["rpa:operation"],
    };

    if (dataNode.$type === "bpmn:DataStoreReference") {
      this.dataResourceInfo[dataNode.id] = nodeInfo;
    } else if (dataNode.$type === "bpmn:DataObjectReference") {
      this.transientDataInfo[dataNode.id] = nodeInfo;
    } else {
      throw new Error("Data node is neither a data store nor a data object.");
    }
  }

  /**
   * Find the sequence flow that originates from a start event.
   *
   * @param sequenceFlows - Set of sequence flows to analyze
   * @returns The sequence flow originating in start event
   */
  private static getStartFlowOfProcess(
    process: Process | SubProcess
  ): SequenceFlow | undefined {
    const sequenceFlows: SequenceFlow[] = process.flowElements.filter(
      (flowElement) => flowElement.$type === "bpmn:SequenceFlow"
    ) as SequenceFlow[];

    return sequenceFlows.find(
      (sequenceFlow) => sequenceFlow.sourceRef.$type === "bpmn:StartEvent"
    );
  }

  private static elementToString(element: FlowNode): string {
    return element.name || element.id + " (" + element.$type + ")";
  }
}

export default BpmnModdleParser;
