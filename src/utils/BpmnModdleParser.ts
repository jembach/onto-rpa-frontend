import {
  DataInputAssociation,
  DataOutputAssociation,
  Definitions,
  EndEvent,
  FlowElement,
  FlowNode,
  ItemAwareElement,
  Process,
  SequenceFlow,
  StartEvent,
  SubProcess,
} from "bpmn-moddle";
import {
  ProcessTreeNodeInfo,
  ProcessTree,
  ProcessTreeStructure,
  ReuseArtefactSequenceInjectionPoint,
  ProcessTreeNodeDataInfo,
} from "../interfaces/BotModel";
import {
  RpaDataRelation,
  RpaDataResourceAccessType,
  RpaDataType,
  RpaTransientDataAccessType,
} from "../interfaces/RpaOperation";
import { rpaData } from "./ontologyParser";
import { BpmoConcept } from "../interfaces/BpmoConcepts";

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

    const generatedProcessTree: ProcessTree = {
      tree: parsedProcess,
      nodeInfo: this.processTreeNodes,
      dataResourceInfo: this.dataResourceInfo,
      transientDataInfo: this.transientDataInfo,
    };

    console.log("Generated Process Tree:", generatedProcessTree);

    return generatedProcessTree;
  }

  /**
   * Parses a bpmn-js model and returns from the start event the attached data objects and stores.
   *
   * @param bpmnModdle - Definitions object of a bpmn-js modeler
   *
   * @returns List of data objects and stores connected to the start event of type RpaDataRelation
   */
  parseBpmnModdleInterfaceData(bpmnModdle: Definitions): RpaDataRelation[] {
    const interfaceData: RpaDataRelation[] = [];

    const process: Process = bpmnModdle.rootElements[0] as Process;

    // Get Interface Data from Start Event
    const startFlow = BpmnModdleParser.getStartFlowOfProcess(process);

    if (!startFlow || !startFlow.targetRef) {
      throw new Error("Startevent is not connected to flow!");
    }

    const startEvent = startFlow.sourceRef as StartEvent;

    interfaceData.push(...this.parseFlowNodeInterfaceData(startEvent));

    // Get Interface Data from all End Event
    const endEvents: EndEvent[] = process.flowElements.filter(
      (flowElement) => flowElement.$type === "bpmn:EndEvent"
    ) as EndEvent[];

    for (const endEvent of endEvents) {
      interfaceData.push(...this.parseFlowNodeInterfaceData(endEvent));
    }

    return interfaceData;
  }

  /**
   * Parses a bpmn-js FlowNode and returns the attached data objects and stores.
   *
   * @param flowNode - FlowNode object of a bpmn-js modeler
   *
   * @returns List of data objects and stores connected to the start event of type RpaDataRelation
   */
  parseFlowNodeInterfaceData(flowNode: {
    dataInputAssociations?: DataInputAssociation[];
    dataOutputAssociations?: DataOutputAssociation[];
  }): RpaDataRelation[] {
    const interfaceData: RpaDataRelation[] = [];

    for (const dataOutputAssociation of flowNode.dataOutputAssociations ?? []) {
      const dataInformationObject = dataOutputAssociation.targetRef;
      const rpaDataRelation = dataOutputAssociation.$attrs?.["rpa:operation"];
      const rpaDataType = dataInformationObject.$attrs?.["rpa:operation"];

      const dataIndividual = rpaData.individuals[rpaDataType];

      const concept = this.determineDataIndividualConcept(rpaDataType);
      if (!dataIndividual || !concept) {
        throw new Error(
          `Data object ${rpaDataType} at start event is not correctly configured with an RPA data concept.`
        );
      }

      if (concept === "data-resource") {
        interfaceData.push({
          type:
            this.inverseDataRelationType(rpaDataRelation) ??
            RpaDataResourceAccessType.TAKES,
          data: dataIndividual,
        });
      } else if (concept === "transient-data") {
        interfaceData.push({
          type:
            this.inverseDataRelationType(rpaDataRelation) ??
            RpaTransientDataAccessType.REQUIRES,
          data: dataIndividual,
        });
      }
    }

    for (const dataInputAssociation of flowNode.dataInputAssociations ?? []) {
      // @ts-expect-error untyped
      const dataInformationObject = dataInputAssociation.sourceRef[0];
      const rpaDataRelation = dataInputAssociation.$attrs?.["rpa:operation"];
      const rpaDataType = dataInformationObject.$attrs?.["rpa:operation"];
      const dataIndividual = rpaData.individuals[rpaDataType];

      const concept = this.determineDataIndividualConcept(rpaDataType);
      if (!dataIndividual || !concept) {
        throw new Error(
          `Data object ${rpaDataType} at end event is not correctly configured with an RPA data concept.`
        );
      }

      if (concept === "data-resource") {
        interfaceData.push({
          type:
            this.inverseDataRelationType(rpaDataRelation) ??
            RpaDataResourceAccessType.PROVIDES,
          data: dataIndividual,
        });
      } else if (concept === "transient-data") {
        interfaceData.push({
          type:
            this.inverseDataRelationType(rpaDataRelation) ??
            RpaTransientDataAccessType.YIELDS,
          data: dataIndividual,
        });
      }
    }

    return interfaceData;
  }

  inverseDataRelationType(
    relationType: RpaDataResourceAccessType | RpaTransientDataAccessType
  ): RpaDataResourceAccessType | RpaTransientDataAccessType | undefined {
    switch (relationType) {
      case RpaDataResourceAccessType.TAKES:
        return RpaDataResourceAccessType.PROVIDES;
      case RpaDataResourceAccessType.PROVIDES:
        return RpaDataResourceAccessType.TAKES;
      case RpaTransientDataAccessType.REQUIRES:
        return RpaTransientDataAccessType.YIELDS;
      case RpaTransientDataAccessType.YIELDS:
        return RpaTransientDataAccessType.REQUIRES;
      case RpaTransientDataAccessType.TRANSFORMS_FROM:
        return RpaTransientDataAccessType.TRANSFORMS_FROM;
      case RpaTransientDataAccessType.TRANSFORMS_TO:
        return RpaTransientDataAccessType.TRANSFORMS_TO;
      default:
        return undefined;
    }
  }

  /**
   * Parse a bpmn-js model and returns all injection points used in the model.
   *
   * @param bpmnModdle - Definitions object of a bpmn-js modeler
   *
   * @returns List of template operation IRIs used as injection points in the model
   */
  parseBpmnModdleUsedInjectionPoints(
    bpmnModdle: Definitions
  ): ReuseArtefactSequenceInjectionPoint[] {
    const process: Process = bpmnModdle.rootElements[0] as Process;

    const subProcesses: SubProcess[] = process.flowElements.filter(
      (flowElement) =>
        flowElement.$attrs?.["rpa:operation"] === "SequenceInjectionPoint"
    ) as SubProcess[];

    return subProcesses.map((subProcess) => ({
      id: subProcess.id,
      label: subProcess.name || subProcess.id,
      accessedData: this.parseFlowNodeInterfaceData(subProcess),
    }));
  }

  /**
   * Parses a BPMN-moddle process object to a process tree.
   *
   * @param process
   *
   * @returns [ProcessTree, last element in flow]
   */
  private parseProcess(
    process: Process | SubProcess,
    concept?: string,
    implementation?: string
  ): [ProcessTreeStructure, FlowNode | undefined] {
    const startFlow = BpmnModdleParser.getStartFlowOfProcess(process);
    const processTree: ProcessTreeStructure = {};

    if (!startFlow || !startFlow.targetRef) {
      throw new Error("Startevent is not connected to flow!");
    }

    const [treePart, lastElement] = this.parseProcessFlowUntilElement(
      startFlow,
      ["bpmn:EndEvent"],
      concept,
      implementation
    );

    if (process.$attrs && "rpa:operation" in process.$attrs) {
      // @ts-expect-error untyped
      processTree[process.id] = treePart;
      // @ts-expect-error untyped
      this.addProcessNodeInfo(process);
    } else {
      // @ts-expect-error untyped
      processTree["Process"] = treePart[0][startFlow.id];
    }
    // last node can not be the end-event! Otherwise, sub-processes would terminate
    // the parsing as their end events have no outgoing flow to the subsequent parts, but the sub-process itself.

    // @ts-expect-error untyped
    return [processTree, process];
  }

  /**
   * Parses a BPMN-moddle process object to a process tree specialized for template method.
   *
   * @param process
   *
   * @returns [ProcessTree, last element in flow]
   */
  private parseProcessTemplateMethod(
    templateMethodProcess: Process | SubProcess
  ): [ProcessTreeStructure, FlowNode | undefined] {
    const templateMethodHandlers: (string | ProcessTreeStructure)[] = [];
    const startFlow = BpmnModdleParser.getStartFlowOfProcess(
      templateMethodProcess
    );

    if (!startFlow || !startFlow.targetRef) {
      throw new Error("Startevent is not connected to flow!");
    }

    const flowInitiatorNodes: FlowNode[] =
      this.findAllStartEventsForTemplateMethod(startFlow!.targetRef);

    for (const flowInitiatorNode of flowInitiatorNodes) {
      if (flowInitiatorNode.outgoing?.length !== 1) {
        throw new Error(
          "IntermediateCatchEvent in Template Method must have exactly one outgoing flow!"
        );
      }
      const startFlow = flowInitiatorNode.outgoing[0];

      if (!startFlow || !startFlow.targetRef) {
        throw new Error("Startevent is not connected to flow!");
      }

      const [parsedFlowHandler, lastElement] =
        this.parseProcessFlowUntilElement(
          startFlow,
          ["bpmn:EndEvent"],
          templateMethodProcess.$attrs!["rpa:concept"],
          templateMethodProcess.$attrs!["rpa:operation"]
        );

      if (parsedFlowHandler.length === 1) {
        // @ts-expect-error untyped
        templateMethodHandlers.push(parsedFlowHandler[0]);
      } else {
        // @ts-expect-error untyped
        templateMethodHandlers.push(parsedFlowHandler);
      }
    }

    // @ts-expect-error untyped
    this.addProcessNodeInfo(templateMethodProcess);
    const templateMethodProcessTree: ProcessTreeStructure = {};
    templateMethodProcessTree[templateMethodProcess.id] =
      templateMethodHandlers;

    // @ts-expect-error untyped
    return [templateMethodProcessTree, templateMethodProcess];
  }

  private findAllStartEventsForTemplateMethod(
    startFlowNode: FlowNode
  ): FlowNode[] {
    const startEvents: FlowNode[] = [];
    const outgoingFlows = startFlowNode.outgoing || [];

    for (const outgoingFlow of outgoingFlows) {
      const targetRef = outgoingFlow.targetRef;

      if (targetRef.$type === "bpmn:IntermediateCatchEvent") {
        startEvents.push(targetRef);
      } else {
        this.findAllStartEventsForTemplateMethod(targetRef);
      }
    }
    return startEvents;
  }
  /**
   * Parses a BPMN-moddle process object to a process tree specialized for chain of responsibility.
   *
   * @param process
   *
   * @returns [ProcessTree, last element in flow]
   */
  private parseProcessChainOfResponsibility(
    chainOfResponsibilityProcess: Process | SubProcess
  ): [ProcessTreeStructure, FlowNode | undefined] {
    const chainOfResponsibilityHandlers: (string | ProcessTreeStructure)[] = [];
    const startFlows = BpmnModdleParser.getAllStartFlowsOfProcess(
      chainOfResponsibilityProcess
    );

    for (const startFlow of startFlows) {
      if (!startFlow || !startFlow.targetRef) {
        throw new Error("Startevent is not connected to flow!");
      }

      const [parsedFlowHandler, lastElement] =
        this.parseProcessFlowUntilElement(
          startFlow,
          ["bpmn:EndEvent"],
          chainOfResponsibilityProcess.$attrs!["rpa:concept"],
          chainOfResponsibilityProcess.$attrs!["rpa:operation"]
        );

      if (parsedFlowHandler.length === 1) {
        // @ts-expect-error untyped
        chainOfResponsibilityHandlers.push(parsedFlowHandler[0]);
      } else {
        // @ts-expect-error untyped
        chainOfResponsibilityHandlers.push(parsedFlowHandler);
      }
    }

    // @ts-expect-error untyped
    this.addProcessNodeInfo(chainOfResponsibilityProcess);
    const chainOfResponsibilityProcessTree: ProcessTreeStructure = {};
    chainOfResponsibilityProcessTree[chainOfResponsibilityProcess.id] =
      chainOfResponsibilityHandlers;

    // @ts-expect-error untyped
    return [chainOfResponsibilityProcessTree, chainOfResponsibilityProcess];
  }

  /**
   * Parses a process flow until a certain modeling element is observed.
   *
   * @param startElement - The modeling element in which the flow to parse starts
   * @param TerminationElementType - The modeling element where to stop parsing
   * @returns [ProcessTree, last element in flow]
   */
  private parseProcessFlowUntilElement(
    sequenceFlow: SequenceFlow,
    TerminationElementTypes: String[],
    concept?: string,
    implementation?: string
  ): [
    ProcessTreeStructure | ProcessTreeStructure[] | string[],
    FlowNode | undefined
  ] {
    const parsedProcess: (string | ProcessTreeStructure)[] = [];
    let nextElementInFlow: FlowNode | undefined = sequenceFlow.targetRef;

    while (
      nextElementInFlow &&
      !TerminationElementTypes.includes(nextElementInFlow.$type)
    ) {
      const [treePart, lastElement] =
        this.parseProcessSegment(nextElementInFlow);
      parsedProcess.push(treePart);

      // Determine the next element in flow that is not a Proxy
      nextElementInFlow = lastElement?.outgoing?.find(
        (flow) => flow.targetRef.$attrs?.["rpa:concept"] !== BpmoConcept.Proxy
      )?.targetRef;
    }

    if (concept && implementation) {
      this.addProcessFlowNodeInfo(
        sequenceFlow,
        concept,
        implementation,
        nextElementInFlow
      );
    }

    return [[{ [sequenceFlow.id]: parsedProcess }], nextElementInFlow];
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
    switch (currentElement.$type) {
      case "bpmn:Task":
        this.addProcessNodeInfo(currentElement);
        return [currentElement.id, currentElement];
      case "bpmn:CallActivity":
        this.addProcessNodeInfo(currentElement);
        return [currentElement.id, currentElement];
      case "bpmn:ParallelGateway":
      case "bpmn:ExclusiveGateway":
        return this.parseSplittedControlflow(currentElement);
      case "bpmn:SubProcess":
        if (
          currentElement.$attrs &&
          currentElement.$attrs["rpa:concept"] === "TemplateMethod"
        ) {
          return this.parseProcessTemplateMethod(currentElement as SubProcess);
        } else if (
          currentElement.$attrs &&
          currentElement.$attrs["rpa:concept"] === "Decorator"
        ) {
          return this.parseProcess(
            currentElement as SubProcess,
            currentElement.$attrs["rpa:concept"],
            currentElement.$attrs["rpa:operation"]
          );
        }
        return this.parseProcess(currentElement as SubProcess);
      case "bpmn:AdHocSubProcess":
        return this.parseProcessChainOfResponsibility(
          currentElement as SubProcess
        );
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
    const splittetControlflowBranches: (string | ProcessTreeStructure)[] = [];
    const lastElementsOfBranches: FlowElement[] = [];

    gatewayElement.outgoing.forEach((branch) => {
      const [parsedFlowBranch, lastElement] = this.parseProcessFlowUntilElement(
        branch,
        [gatewayElement.$type, "bpmn:EndEvent"]
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

    // Ensure that really every branch ended with the same gateway (should be always true) or an end event
    if (
      !lastElementsOfBranches.every(
        (element) =>
          (element.$type === lastElementsOfBranches[0].$type &&
            element.id === lastElementsOfBranches[0].id) ||
          element.$type === "bpmn:EndEvent"
      )
    ) {
      throw new Error("Something is wrong with the structure of your diagram!");
    }

    this.addProcessNodeInfo(gatewayElement);
    const gatewayProcessTree: ProcessTreeStructure = {};
    gatewayProcessTree[gatewayElement.id] = splittetControlflowBranches;

    // @ts-expect-error untyped
    return [gatewayProcessTree, lastElementsOfBranches[0]];
  }

  private addProcessFlowNodeInfo(
    sequenceFlow: SequenceFlow,
    concept: string,
    implementation: string,
    endElement?: FlowNode
  ): void {
    const startElementNodeDataInfo = this.extractProcessNodeDataInfo(
      sequenceFlow.sourceRef
    );
    const nodeInfo: ProcessTreeNodeInfo = {
      label: sequenceFlow.id,
      concept,
      implementation,
      dataResourceInput: [],
      dataResourceOutput: startElementNodeDataInfo.dataResourceOutput,
      variableInput: [],
      variableOutput: startElementNodeDataInfo.variableOutput,
    };

    if (endElement) {
      const endElementNodeDataInfo =
        this.extractProcessNodeDataInfo(endElement);
      nodeInfo.dataResourceInput = endElementNodeDataInfo.dataResourceInput;
      nodeInfo.variableInput = endElementNodeDataInfo.variableInput;
    }

    // Get basic information about the element
    this.processTreeNodes[sequenceFlow.id] = nodeInfo;
  }

  private addProcessNodeInfo(element: FlowNode): void {
    if (!element.$attrs || !("rpa:operation" in element.$attrs)) {
      throw new Error(
        "Not all elements are correctly configured with an RPA operation."
      );
    }

    const nodeDataInfo = this.extractProcessNodeDataInfo(element);

    const nodeInfo: ProcessTreeNodeInfo = {
      label: element.name || element.id,
      concept: element.$attrs["rpa:concept"] || element.$attrs["rpa:operation"],
      implementation: element.$attrs["rpa:operation"],
      dataResourceInput: nodeDataInfo.dataResourceInput,
      dataResourceOutput: nodeDataInfo.dataResourceOutput,
      variableInput: nodeDataInfo.variableInput,
      variableOutput: nodeDataInfo.variableOutput,
    };

    // Get basic information about the element
    this.processTreeNodes[element.id] = nodeInfo;
  }

  private extractProcessNodeDataInfo(
    element: FlowNode
  ): ProcessTreeNodeDataInfo {
    const nodeDataInfo: ProcessTreeNodeDataInfo = {
      dataResourceInput: [],
      dataResourceOutput: [],
      variableInput: [],
      variableOutput: [],
    };

    if (!element) {
      return nodeDataInfo;
    }

    // @ts-expect-error untyped
    if (element.dataInputAssociations) {
      // @ts-expect-error untyped
      element.dataInputAssociations.forEach((association) => {
        const dataInformationObject = association.sourceRef[0];
        if (dataInformationObject.$type === "bpmn:DataStoreReference") {
          nodeDataInfo.dataResourceInput.push(dataInformationObject.id);
        } else {
          nodeDataInfo.variableInput.push({
            variable: dataInformationObject.id,
            proxiedBy: [],
          });
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
          nodeDataInfo.dataResourceOutput.push(dataInformationObject.id);
        } else {
          nodeDataInfo.variableOutput.push({
            variable: dataInformationObject.id,
            proxiedBy: [],
          });
        }
        this.addDataInfo(dataInformationObject);
      });
    }

    // check for proxies in outgoing flows
    if (element.outgoing?.length > 0) {
      for (const outgoingFlow of element.outgoing) {
        if (
          outgoingFlow.targetRef.$attrs?.["rpa:concept"] === BpmoConcept.Proxy
        ) {
          // follow the proxy until a outgoingFlow with the rpa:concept tranformsTo is found
          let proxyElement: FlowNode | undefined = outgoingFlow.targetRef;
          const visitedProxyElements: FlowNode[] = [proxyElement];

          while (proxyElement) {
            // @ts-expect-error untyped
            const transformFlow = proxyElement?.dataOutputAssociations?.find(
              // @ts-expect-error untyped
              (association) =>
                association.$attrs?.["rpa:operation"] === "transformsTo"
            );

            if (transformFlow) {
              const dataInformationObject = transformFlow.targetRef;
              if (dataInformationObject.$type === "bpmn:DataObjectReference") {
                nodeDataInfo.variableOutput.push({
                  variable: dataInformationObject.id,
                  proxiedBy: visitedProxyElements.map((el) => el.id),
                });
              }

              // Add info for all visited proxies
              for (const visitedProxyElement of visitedProxyElements) {
                this.addProcessNodeInfo(visitedProxyElement);
              }

              this.addDataInfo(dataInformationObject);
              break;
            } else {
              // move to next proxy
              const nextProxyFlow: SequenceFlow | undefined =
                proxyElement.outgoing?.find(
                  (flow) =>
                    flow.targetRef.$attrs?.["rpa:concept"] === BpmoConcept.Proxy
                );

              if (nextProxyFlow) {
                proxyElement = nextProxyFlow.targetRef;
                visitedProxyElements.push(proxyElement);
              } else {
                proxyElement = undefined;
              }
            }
          }
        }
      }
    }

    if (element.incoming?.length > 0) {
      for (const incomingFlow of element.incoming) {
        if (
          incomingFlow.sourceRef.$attrs?.["rpa:concept"] === BpmoConcept.Proxy
        ) {
          // follow the proxy until a incomingFlow with the rpa:concept tranformsFrom is found
          let proxyElement: FlowNode | undefined = incomingFlow.sourceRef;
          const visitedProxyElements: FlowNode[] = [proxyElement];

          while (proxyElement) {
            // @ts-expect-error untyped
            const transformFlow = proxyElement?.dataInputAssociations?.find(
              // @ts-expect-error untyped
              (association) =>
                association.$attrs?.["rpa:operation"] === "transformsFrom"
            );

            if (transformFlow) {
              const dataInformationObject = transformFlow.sourceRef[0];
              if (dataInformationObject.$type === "bpmn:DataObjectReference") {
                nodeDataInfo.variableInput.push({
                  variable: dataInformationObject.id,
                  proxiedBy: visitedProxyElements.map((el) => el.id),
                });
              }

              // Add info for all visited proxies
              for (const visitedProxyElement of visitedProxyElements) {
                this.addProcessNodeInfo(visitedProxyElement);
              }

              this.addDataInfo(dataInformationObject);
              break;
            } else {
              // move to next proxy
              const nextProxyFlow: SequenceFlow | undefined =
                proxyElement.incoming?.find(
                  (flow) =>
                    flow.sourceRef.$attrs?.["rpa:concept"] === BpmoConcept.Proxy
                );

              if (nextProxyFlow) {
                proxyElement = nextProxyFlow.sourceRef;
                visitedProxyElements.push(proxyElement);
              } else {
                proxyElement = undefined;
              }
            }
          }
        }
      }
    }

    return nodeDataInfo;
  }

  private addDataInfo(dataNode: ItemAwareElement): void {
    const nodeInfo: ProcessTreeNodeInfo = {
      // @ts-expect-error untyped
      label: dataNode.name || dataNode.id,
      // @ts-expect-error untyped
      concept: dataNode.$attrs["rpa:operation"],
      // @ts-expect-error untyped
      implementation: dataNode.$attrs["rpa:operation"],
      dataResourceInput: [],
      dataResourceOutput: [],
      variableInput: [],
      variableOutput: [],
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

  /**
   * Find the sequence flow that originates from a start event.
   *
   * @param sequenceFlows - Set of sequence flows to analyze
   * @returns The sequence flow originating in start event
   */
  private static getAllStartFlowsOfProcess(
    process: Process | SubProcess
  ): SequenceFlow[] {
    const sequenceFlows: SequenceFlow[] = process.flowElements.filter(
      (flowElement) => flowElement.$type === "bpmn:SequenceFlow"
    ) as SequenceFlow[];

    return sequenceFlows.filter(
      (sequenceFlow) => sequenceFlow.sourceRef.$type === "bpmn:StartEvent"
    );
  }

  private static elementToString(element: FlowNode): string {
    return element.name || element.id + " (" + element.$type + ")";
  }

  private determineDataIndividualConcept(
    dataIndividualId: string
  ): "data-resource" | "transient-data" | undefined {
    const dataIndividual = rpaData.individuals[dataIndividualId];

    if (!dataIndividual) {
      throw new Error(
        `Data object ${dataIndividualId} at start/end event is not correctly configured with an RPA data concept.`
      );
    }

    let concept: RpaDataType | undefined = dataIndividual.concept;

    while (concept) {
      if (concept.iri.includes("rpa-operations#data-resource")) {
        return "data-resource";
      } else if (concept.iri.includes("rpa-operations#transient-data")) {
        return "transient-data";
      } else {
        concept = concept.type;
      }
    }

    return undefined;
  }
}

export default BpmnModdleParser;
