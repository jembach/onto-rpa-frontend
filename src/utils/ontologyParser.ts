import {
  RpaBaseElement,
  RpaBaseConcept,
  RpaBaseInstance,
  RpaBaseType,
  RpaData,
  RpaDataConcept,
  RpaDataType,
  RpaOperation,
  RpaOperationConcept,
  RpaOperationType,
  RpaSoftware,
  RpaSoftwareConcept,
  RpaSoftwareType,
} from "../interfaces/RpaOperation";
import rpaOperationsOntology from "../resources/rpa-operations.json";

interface rpaTaxonomy<A, B, C> {
  types: Record<string, A>;
  concepts: Record<string, B>;
  individuals: Record<string, C>;
}

export const rpaOperations: rpaTaxonomy<
  RpaOperationType,
  RpaOperationConcept,
  RpaOperation
> = {
  types: {},
  concepts: {},
  individuals: {},
};

export const rpaSoftware: rpaTaxonomy<
  RpaSoftwareType,
  RpaSoftwareConcept,
  RpaSoftware
> = {
  types: {},
  concepts: {},
  individuals: {},
};

export const rpaData: rpaTaxonomy<RpaDataType, RpaDataConcept, RpaData> = {
  types: {},
  concepts: {},
  individuals: {},
};

const RPA_IRI =
  "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations";
const RPA_OPERATION_ROOT_IRI = RPA_IRI + "#" + "rpa-operation";
const RPA_DATA_ROOT_IRI = "http://cos.ontoware.org/cso#data";
const RPA_SOFTWARE_ROOT_IRI = "http://cos.ontoware.org/cso#software";

const INDIVIDUAL_IRI = "http://www.w3.org/2002/07/owl#NamedIndividual";
const SUBCLASS_IRI = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
const RELATION_IRIS: [
  string,
  (
    | rpaTaxonomy<RpaSoftwareType, RpaSoftwareConcept, RpaSoftware>
    | rpaTaxonomy<RpaDataType, RpaDataConcept, RpaData>
  )
][] = [
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

function exploreTree(
  superElement: RpaBaseElement,
  rpaTree:
    | rpaTaxonomy<RpaOperationType, RpaOperationConcept, RpaOperation>
    | rpaTaxonomy<RpaSoftwareType, RpaSoftwareConcept, RpaSoftware>
    | rpaTaxonomy<RpaDataType, RpaDataConcept, RpaData>
): void {
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
          rpaTree.types[currentId][getIdFromIri(property_iri)] =
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
      RELATION_IRIS.forEach((relation_iri) => {
        if (relation_iri[0] in operation) {
          newRpaIndividual[getIdFromIri(relation_iri[0])] =
            relation_iri[1].individuals[
              getIdFromIri(operation[relation_iri[0]][0]["@id"])
            ];
        }
      });
      PROPERTY_IRIS.forEach((property_iri) => {
        if (property_iri in operation) {
          newRpaIndividual[getIdFromIri(property_iri)] =
            operation[property_iri][0]["@value"];
        }
      });
      rpaTree.individuals[currentId] = newRpaIndividual;
    }
  });
}

// Load Data taxonomy (has no relation to other taxonomies)
exploreTree(RPA_DATA_ROOT_ELEMENT, rpaData);
// Load Software taxonomy (has only relations to data)
exploreTree(RPA_SOFTWARE_ROOT_ELEMENT, rpaSoftware);
// Load Operations taxonomy
exploreTree(RPA_OPERATION_ROOT_ELEMENT, rpaOperations);

function convertTypeToConcept(
  typeKey: string,
  rpaTree:
    | rpaTaxonomy<RpaOperationType, RpaOperationConcept, RpaOperation>
    | rpaTaxonomy<RpaSoftwareType, RpaSoftwareConcept, RpaSoftware>
    | rpaTaxonomy<RpaDataType, RpaDataConcept, RpaData>
) {
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
