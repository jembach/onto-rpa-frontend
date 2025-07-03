import {
  RpaBaseElement,
  RpaBaseType,
  RpaData,
  RpaDataType,
  RpaOperation,
  RpaOperationType,
  RpaSoftware,
  RpaSoftwareType,
  RpaOperationTaxonomy,
  RpaSoftwareTaxonomy,
  RpaDataTaxonomy,
  RpaTaxonomy,
  RpaContextContainer,
  RpaDataResourceAccessType,
  RpaTransientDataAccessType,
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

const RPA_IRI =
  "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations";
const RPA_OPERATION_ROOT_IRI = RPA_IRI + "#" + "rpa-operation";
const RPA_DATA_ROOT_IRI = "http://cos.ontoware.org/cso#data";
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

const RPA_OPERATION_ROOT_ELEMENT: RpaBaseElement = {
  id: getIdFromIri(RPA_OPERATION_ROOT_IRI),
  iri: RPA_OPERATION_ROOT_IRI,
};
const RPA_DATA_ROOT_ELEMENT: RpaBaseElement = {
  id: getIdFromIri(RPA_DATA_ROOT_IRI),
  iri: RPA_DATA_ROOT_IRI,
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
        RpaOperationType | RpaSoftwareType | RpaDataType
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
      operation["@type"].includes(superElement.iri)
    ) {
      // if an individual of the currently examined class is encountered, add it as concrete operation
      if (superElement.id in rpaTree.types) {
        // in case the concept of the current indiv. was already added to types, move it to concepts
        convertTypeToConcept(superElement.id, rpaTree);
      }
      const newRpaIndividual: RpaOperation | RpaSoftware | RpaData = {
        id: currentId,
        iri: operation["@id"],
        concept: rpaTree.concepts[superElement.id],
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
          if (!newRpaIndividual.accessedData) {
            // @ts-expect-error untyped
            newRpaIndividual.accessedData = [];
          }
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
          if (!newRpaIndividual.accessedData) {
            // @ts-expect-error untyped
            newRpaIndividual.accessedData = [];
          }
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
      operation["@type"].includes(RPA_CONTEXT_CONTAINER_ROOT_IRI)
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
// Load Software taxonomy (has only relations to data)
exploreTree(RPA_SOFTWARE_ROOT_ELEMENT, rpaSoftware);
// Load Operations taxonomy
exploreTree(RPA_OPERATION_ROOT_ELEMENT, rpaOperations);

export const rpaContextContainers: Record<string, RpaContextContainer> =
  parseContextContainers();

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
