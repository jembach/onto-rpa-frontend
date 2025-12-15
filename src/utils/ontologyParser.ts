import botModelApi from "../api/botModelApi";
import {
  BotModelChainOfResponsibility,
  BotModelDecorator,
  BotModelFacade,
  BotModelProxy,
  BotModelTemplateMethod,
  BotModelType,
} from "../interfaces/BotModel";
import {
  RpaBaseElement,
  RpaBaseType,
  RpaDataResource,
  RpaDataResourceType,
  RpaTransientData,
  RpaTransientDataType,
  RpaOperation,
  RpaOperationType,
  RpaSoftware,
  RpaSoftwareType,
  RpaOperationTaxonomy,
  RpaSoftwareTaxonomy,
  RpaDataResourceTaxonomy,
  RpaTransientDataTaxonomy,
  RpaTaxonomy,
  RpaContextContainer,
  RpaDataResourceAccessType,
  RpaTransientDataAccessType,
  RpaReuseFacade,
  RpaReuseProxy,
  RpaReuseDecorator,
  RpaReuseChainOfResponsibility,
  RpaReuseTemplateMethod,
  RpaDataTaxonomy,
  RpaDataType,
  RpaData,
} from "../interfaces/RpaOperation";
import rpaOperationsOntology from "../resources/rpa-operations.json";

export const rpaOperations: RpaOperationTaxonomy = {
  types: {},
  concepts: {},
  individuals: {},
};

export const rpaSoftware: RpaSoftwareTaxonomy = {
  types: {},
  concepts: {},
  individuals: {},
};

export const rpaData: RpaDataTaxonomy = {
  types: {},
  concepts: {},
  individuals: {},
};

export const rpaTransientData: RpaTransientDataTaxonomy = {
  types: {},
  concepts: {},
  individuals: {},
};

export const rpaDataResource: RpaDataResourceTaxonomy = {
  types: {},
  concepts: {},
  individuals: {},
};

const RPA_IRI =
  "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations";
const RPA_OPERATION_ROOT_IRI = RPA_IRI + "#" + "rpa-operation";
const RPA_DATA_ROOT_IRI = "http://cos.ontoware.org/cso#data";
const RPA_TRANSIENT_DATA_ROOT_IRI = RPA_IRI + "#" + "transient-data";
const RPA_DATA_RESOURCE_ROOT_IRI = RPA_IRI + "#" + "data-resource";
const RPA_SOFTWARE_ROOT_IRI = "http://cos.ontoware.org/cso#software";
const RPA_CONTEXT_CONTAINER_ROOT_IRI = RPA_IRI + "#" + "rpa-context-container";
const RPA_CONTEXT_CONTAINER_SETUP_RELATION_IRI =
  RPA_IRI + "#" + "setup-sequence";
const RPA_CONTEXT_CONTAINER_CLEANUP_RELATION_IRI =
  RPA_IRI + "#" + "cleanup-sequence";
const RPA_CONTEXT_CONTAINER_SETUP_STEP =
  RPA_IRI + "#" + "rpa-context-setup-step";
const RPA_CONTEXT_CONTAINER_CLEANUP_STEP =
  RPA_IRI + "#" + "rpa-context-cleanup-step";
const RPA_CONTEXT_CONTAINER_STEP_OPERATION =
  "http://www.loa-cnr.it/ontologies/ExtendedDnS.owl#references";
const RPA_CONTEXT_CONTAINER_STEP_NEXT =
  "http://www.loa-cnr.it/ontologies/ExtendedDnS.owl#direct-successor";

const INDIVIDUAL_IRI = "http://www.w3.org/2002/07/owl#NamedIndividual";
const SUBCLASS_IRI = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
const RELATION_IRIS: [string, RpaSoftwareTaxonomy | RpaDataTaxonomy][] = [
  [
    "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations#automates",
    rpaSoftware,
  ],
  ["http://cos.ontoware.org/cso#accesses", rpaData],
  [
    "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations#supports",
    rpaData,
  ],
];
const PROPERTY_IRIS = [
  "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations#bpmoConcept",
  "http://www.w3.org/2000/01/rdf-schema#label",
  "http://www.w3.org/2000/01/rdf-schema#comment",
];

const TYPE_IRI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

const RPA_OPERATION_ROOT_ELEMENT: RpaBaseElement = {
  id: getIdFromIri(RPA_OPERATION_ROOT_IRI),
  iri: RPA_OPERATION_ROOT_IRI,
};
const RPA_DATA_ROOT_ELEMENT: RpaBaseElement = {
  id: getIdFromIri(RPA_DATA_ROOT_IRI),
  iri: RPA_DATA_ROOT_IRI,
};
const RPA_TRANSIENT_DATA_ROOT_ELEMENT: RpaBaseElement = {
  id: getIdFromIri(RPA_TRANSIENT_DATA_ROOT_IRI),
  iri: RPA_TRANSIENT_DATA_ROOT_IRI,
};
const RPA_DATA_RESOURCE_ROOT_ELEMENT: RpaBaseElement = {
  id: getIdFromIri(RPA_DATA_RESOURCE_ROOT_IRI),
  iri: RPA_DATA_RESOURCE_ROOT_IRI,
};
const RPA_SOFTWARE_ROOT_ELEMENT: RpaBaseElement = {
  id: getIdFromIri(RPA_SOFTWARE_ROOT_IRI),
  iri: RPA_SOFTWARE_ROOT_IRI,
};
// const individuals = rpaOperationsOntology.forEach((operation) => {
//   if (operation["@type"].includes(INDIVIDUAL_IRI)) {
//     // console.log(operation["@id"]);
//     return operation["@id"];
//   }
// });

function exploreTree(superElement: RpaBaseElement, rpaTree: RpaTaxonomy): void {
  rpaOperationsOntology.forEach((operation) => {
    const currentId = getIdFromIri(operation["@id"]);

    if (operation[SUBCLASS_IRI]?.[0]["@id"] === superElement.iri) {
      // if the current element is a subclass of the currently examined class, add it as new type
      const newRpaType: RpaBaseType<
        | RpaOperationType
        | RpaSoftwareType
        | RpaDataType
        | RpaDataResourceType
        | RpaTransientDataType
      > = {
        id: currentId,
        iri: operation["@id"],
        type: superElement,
      };
      rpaTree.types[currentId] = newRpaType;
      PROPERTY_IRIS.forEach((property_iri) => {
        if (property_iri in operation) {
          // @ts-expect-error untyped
          rpaTree.types[currentId][getIdFromIri(property_iri)] =
            // @ts-expect-error untyped
            operation[property_iri][0]["@value"];
        }
      });
      exploreTree(newRpaType, rpaTree);
    } else if (
      operation["@type"] &&
      operation["@type"].includes(INDIVIDUAL_IRI) &&
      (operation["@type"].includes(superElement.iri) ||
        operation[TYPE_IRI]?.some((type) => type["@id"] === superElement.iri))
    ) {
      // if an individual of the currently examined class is encountered, add it as concrete operation
      if (superElement.id in rpaTree.types) {
        // in case the concept of the current indiv. was already added to types, move it to concepts
        convertTypeToConcept(superElement.id, rpaTree);
      }
      const newRpaIndividual:
        | RpaOperation
        | RpaSoftware
        | RpaData
        | RpaDataResource
        | RpaTransientData = {
        id: currentId,
        iri: operation["@id"],
        concept: rpaTree.concepts[superElement.id],
        accessedData: [],
      };
      // Check basic relations
      RELATION_IRIS.forEach((relation_iri) => {
        if (relation_iri[0] in operation) {
          // @ts-expect-error untyped
          newRpaIndividual[getIdFromIri(relation_iri[0])] =
            relation_iri[1].individuals[
              // @ts-expect-error untyped
              getIdFromIri(operation[relation_iri[0]][0]["@id"])
            ];
        }
      });
      // Check for special data access relations
      Object.keys(operation).forEach((propertyKey) => {
        const propertyName = getIdFromIri(propertyKey);
        if (!propertyName) return;

        if (propertyName.toUpperCase() in RpaDataResourceAccessType) {
          // @ts-expect-error untyped
          newRpaIndividual.accessedData.push({
            // @ts-expect-error untyped
            type: RpaDataResourceAccessType[propertyName.toUpperCase()],
            data: rpaData.individuals[
              // @ts-expect-error untyped
              getIdFromIri(operation[propertyKey][0]["@id"])
            ],
          });
        }

        if (propertyName.toUpperCase() in RpaTransientDataAccessType) {
          // @ts-expect-error untyped
          newRpaIndividual.accessedData.push({
            // @ts-expect-error untyped
            type: RpaTransientDataAccessType[propertyName.toUpperCase()],
            data: rpaData.individuals[
              // @ts-expect-error untyped
              getIdFromIri(operation[propertyKey][0]["@id"])
            ],
          });
        }
      });
      PROPERTY_IRIS.forEach((property_iri) => {
        if (property_iri in operation) {
          // @ts-expect-error untyped
          newRpaIndividual[getIdFromIri(property_iri)] =
            // @ts-expect-error untyped
            operation[property_iri][0]["@value"];
        }
      });
      rpaTree.individuals[currentId] = newRpaIndividual;
    }
  });
}

function parseContextContainers(): Record<string, RpaContextContainer> {
  const contextContainers: Record<string, RpaContextContainer> = {};
  rpaOperationsOntology.forEach((operation) => {
    const currentId = getIdFromIri(operation["@id"]);

    if (
      operation["@type"] &&
      (operation["@type"].includes(RPA_CONTEXT_CONTAINER_ROOT_IRI) ||
        operation[TYPE_IRI]?.some(
          (type) => type["@id"] === RPA_CONTEXT_CONTAINER_ROOT_IRI
        ))
    ) {
      const contextContainer: RpaContextContainer = {
        id: currentId,
        iri: operation["@id"],
        setupSteps: [],
        cleanupSteps: [],
      };
      if (RPA_CONTEXT_CONTAINER_SETUP_RELATION_IRI in operation) {
        // get setup sequence for container
        const firstSetupStepIri: string =
          // @ts-expect-error untyped
          operation[RPA_CONTEXT_CONTAINER_SETUP_RELATION_IRI][0]["@id"];
        contextContainer.setupSteps =
          getContextContainerSequence(firstSetupStepIri);
      }
      if (RPA_CONTEXT_CONTAINER_CLEANUP_RELATION_IRI in operation) {
        // get cleanup sequence for container
        const firstCleanupStepIri: string =
          // @ts-expect-error untyped
          operation[RPA_CONTEXT_CONTAINER_CLEANUP_RELATION_IRI][0]["@id"];
        contextContainer.cleanupSteps =
          getContextContainerSequence(firstCleanupStepIri);
      }
      contextContainers[currentId] = contextContainer;
    }
  });
  return contextContainers;
}

async function parseRpaReuseFacade(): Promise<Record<string, RpaReuseFacade>> {
  const rpaReuseFacades: Record<string, RpaReuseFacade> = {};

  const facades = await botModelApi.getBotModels<BotModelFacade>(
    BotModelType.FACADE
  );

  facades.forEach((facade) => {
    const rpaFacade: RpaReuseFacade = {
      id: facade._id!,
      iri: extendId(facade.name),
      accessedData: facade.accessedData ?? [],
      automates: [],
      comment: "",
      label: facade.name,
    };
    rpaReuseFacades[facade._id!] = rpaFacade;
  });

  return rpaReuseFacades;
}

async function parseRpaReuseProxy(): Promise<Record<string, RpaReuseProxy>> {
  const rpaReuseProxies: Record<string, RpaReuseProxy> = {};

  const proxies = await botModelApi.getBotModels<BotModelProxy>(
    BotModelType.PROXY
  );

  proxies.forEach((proxy) => {
    const rpaProxy: RpaReuseProxy = {
      id: proxy._id!,
      iri: extendId(proxy.name),
      accessedData: proxy.accessedData ?? [],
      automates: [],
      comment: "",
      label: proxy.name,
    };
    rpaReuseProxies[proxy._id!] = rpaProxy;
  });

  return rpaReuseProxies;
}

async function parseRpaReuseDecorator(): Promise<
  Record<string, RpaReuseDecorator>
> {
  const rpaReuseDecorators: Record<string, RpaReuseDecorator> = {};

  const decorators = await botModelApi.getBotModels<BotModelDecorator>(
    BotModelType.DECORATOR
  );

  decorators.forEach((decorator) => {
    const rpaDecorator: RpaReuseDecorator = {
      id: decorator._id!,
      iri: extendId(decorator.name),
      accessedData: decorator.accessedData ?? [],
      injectionPoints: decorator.injectionPoints ?? [],
      automates: [],
      comment: "",
      label: decorator.name,
    };
    rpaReuseDecorators[decorator._id!] = rpaDecorator;
  });

  return rpaReuseDecorators;
}

async function parseRpaReuseChainOfResponsibility(): Promise<
  Record<string, RpaReuseChainOfResponsibility>
> {
  const rpaReuseChainOfResponsibilities: Record<
    string,
    RpaReuseChainOfResponsibility
  > = {};

  const chains = await botModelApi.getBotModels<BotModelChainOfResponsibility>(
    BotModelType.CHAIN_OF_RESPONSIBILITY
  );

  chains.forEach((chain) => {
    const rpaChain: RpaReuseChainOfResponsibility = {
      id: chain._id!,
      iri: extendId(chain.name),
      accessedData: chain.accessedData ?? [],
      injectionPoints: chain.injectionPoints ?? [],
      automates: [],
      comment: "",
      label: chain.name,
    };
    rpaReuseChainOfResponsibilities[chain._id!] = rpaChain;
  });

  return rpaReuseChainOfResponsibilities;
}

async function parseTemplateMethods(): Promise<
  Record<string, RpaReuseTemplateMethod>
> {
  const rpaReuseTemplateMethods: Record<string, RpaReuseTemplateMethod> = {};

  const templateMethods =
    await botModelApi.getBotModels<BotModelTemplateMethod>(
      BotModelType.TEMPLATE_METHOD
    );

  templateMethods.forEach((templateMethod) => {
    const rpaReuseTemplateMethod: RpaReuseTemplateMethod = {
      id: templateMethod._id!,
      iri: extendId(templateMethod.name),
      accessedData: templateMethod.accessedData ?? [],
      injectionPoints: templateMethod.injectionPoints ?? [],
      automates: [],
      comment: "",
      label: templateMethod.name,
    };
    rpaReuseTemplateMethods[templateMethod._id!] = rpaReuseTemplateMethod;
  });

  return rpaReuseTemplateMethods;
}

function getContextContainerSequence(firstStepIri: string): RpaOperation[] {
  let currentStepIri = firstStepIri;
  let steps: RpaOperation[] = [];
  while (currentStepIri) {
    const currentStep = rpaOperationsOntology.find(
      (entry) => entry["@id"] === currentStepIri
    );
    const referencedOperationId = getIdFromIri(
      // @ts-expect-error untyped
      currentStep[RPA_CONTEXT_CONTAINER_STEP_OPERATION][0]["@id"]
    );
    steps.push(rpaOperations.individuals[referencedOperationId]);
    // @ts-expect-error untyped
    if (RPA_CONTEXT_CONTAINER_STEP_NEXT in currentStep) {
      // @ts-expect-error untyped
      currentStepIri = currentStep[RPA_CONTEXT_CONTAINER_STEP_NEXT][0]["@id"];
    } else {
      currentStepIri = "";
    }
  }
  return steps;
}

// Load Data taxonomy (has no relation to other taxonomies)
exploreTree(RPA_DATA_ROOT_ELEMENT, rpaData);
// Load Transient Data taxonomy (has no relation to other taxonomies)
exploreTree(RPA_TRANSIENT_DATA_ROOT_ELEMENT, rpaTransientData);
// Load Data Resource taxonomy (has no relation to other taxonomies)
exploreTree(RPA_DATA_RESOURCE_ROOT_ELEMENT, rpaDataResource);
// Load Software taxonomy (has only relations to data)
exploreTree(RPA_SOFTWARE_ROOT_ELEMENT, rpaSoftware);
// Load Operations taxonomy
exploreTree(RPA_OPERATION_ROOT_ELEMENT, rpaOperations);

export const rpaContextContainers: Record<string, RpaContextContainer> =
  parseContextContainers();

export const getRpaReuseFacades = async (): Promise<
  Record<string, RpaReuseFacade>
> => {
  if (!(getRpaReuseFacades as any)._cache) {
    (getRpaReuseFacades as any)._cache = await parseRpaReuseFacade();
  }
  return (getRpaReuseFacades as any)._cache;
};

export const getRpaReuseProxies = async (): Promise<
  Record<string, RpaReuseProxy>
> => {
  if (!(getRpaReuseProxies as any)._cache) {
    (getRpaReuseProxies as any)._cache = await parseRpaReuseProxy();
  }
  return (getRpaReuseProxies as any)._cache;
};

export const getRpaReuseDecorators = async (): Promise<
  Record<string, RpaReuseDecorator>
> => {
  if (!(getRpaReuseDecorators as any)._cache) {
    (getRpaReuseDecorators as any)._cache = await parseRpaReuseDecorator();
  }
  return (getRpaReuseDecorators as any)._cache;
};

export const getRpaReuseChainOfResponsibilities = async (): Promise<
  Record<string, RpaReuseChainOfResponsibility>
> => {
  if (!(getRpaReuseChainOfResponsibilities as any)._cache) {
    (getRpaReuseChainOfResponsibilities as any)._cache =
      await parseRpaReuseChainOfResponsibility();
  }
  return (getRpaReuseChainOfResponsibilities as any)._cache;
};

export const getRpaReuseTemplateMethods = async (): Promise<
  Record<string, RpaReuseTemplateMethod>
> => {
  if (!(getRpaReuseTemplateMethods as any)._cache) {
    (getRpaReuseTemplateMethods as any)._cache = await parseTemplateMethods();
  }
  return (getRpaReuseTemplateMethods as any)._cache;
};

function convertTypeToConcept(typeKey: string, rpaTree: RpaTaxonomy) {
  // @ts-expect-error untyped
  rpaTree.concepts[typeKey] = {};
  Object.assign(rpaTree.concepts[typeKey], rpaTree.types[typeKey]);
  delete rpaTree.types[typeKey];
}

function getIdFromIri(id: string): string {
  return id.split("#")[1];
}
function extendId(id: string): string {
  return RPA_IRI + "#" + id;
}

export function getOperationBranch(operation: string): string[] {
  console.log(operation);
  // For reuse operations not defined in ontology, just return operation itself
  if (!rpaOperations.individuals[operation]) {
    return [operation];
  }

  var currentConcept: string | undefined = operation;
  // Add operation itself (leaf) to branch list
  const branch = [operation];
  // Add concept of operation to branch list
  const conceptOfOperation = rpaOperations.individuals[operation].concept.id;
  branch.push(conceptOfOperation);

  // Get (first) type of concept of operation
  let nextElement: RpaOperationType | undefined =
    rpaOperations.concepts[conceptOfOperation].type;

  // Iterate type relationship until we reach the root (where nextElement is not defined anymore)
  while (nextElement) {
    branch.push(nextElement.id);
    nextElement = nextElement.type;
  }

  return branch;
}
