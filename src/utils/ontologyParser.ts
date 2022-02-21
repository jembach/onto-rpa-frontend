import {
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

const RPA_IRI =
  "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations";
const RPA_OPERATION_ROOT_IRI = RPA_IRI + "#" + "rpa-operation";
const RPA_DATA_ROOT_IRI = "http://cos.ontoware.org/cso#data";
const RPA_SOFTWARE_ROOT_IRI = "http://cos.ontoware.org/cso#software";

const INDIVIDUAL_IRI = "http://www.w3.org/2002/07/owl#NamedIndividual";
const SUBCLASS_IRI = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
const RELATION_IRIS = [
  "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations#automates",
  "http://cos.ontoware.org/cso#accesses",
  "http://www.semanticweb.org/maximilian.voelker/ontologies/rpa-operations#supports",
];

const individuals = rpaOperationsOntology.forEach((operation) => {
  if (operation["@type"].includes(INDIVIDUAL_IRI)) {
    // console.log(operation["@id"]);
    return operation["@id"];
  }
});

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

function exploreTree(
  superClassIri: string,
  rpaTree: rpaTaxonomy<RpaBaseType, RpaBaseConcept, RpaBaseInstance>
): void {
  rpaOperationsOntology.forEach((operation) => {
    const superClassId = compressId(superClassIri);
    const currentId = compressId(operation["@id"]);
    if (operation[SUBCLASS_IRI]?.[0]["@id"] === superClassIri) {
      // if the current element is a subclass of the currently examined class, add it as new type
      rpaTree.types[currentId] = {
        name: currentId,
        superType: superClassId,
      };
      exploreTree(operation["@id"], rpaTree);
    } else if (
      operation["@type"].includes(INDIVIDUAL_IRI) &&
      operation["@type"].includes(superClassIri)
    ) {
      // if an individual of the currently examined class is encountered, add it as concrete operation
      if (superClassId in rpaTree.types) {
        // in case the concept of the current indiv. was already added to types, move it to concepts
        convertTypeToConcept(superClassId, rpaTree);
      }
      rpaTree.individuals[currentId] = {
        name: currentId,
        concept: superClassId,
      };
      RELATION_IRIS.forEach((relation_iri) => {
        if (relation_iri in operation) {
          rpaTree.individuals[currentId][compressId(relation_iri)] = compressId(
            operation[relation_iri][0]["@id"]
          );
        }
      });
    }
  });
}

// Load Data taxonomy (has no relation to other taxonomies)
exploreTree(RPA_DATA_ROOT_IRI, rpaData);
// Load Software taxonomy (has only relations to data)
exploreTree(RPA_SOFTWARE_ROOT_IRI, rpaSoftware);
// Load Operations taxonomy
exploreTree(RPA_OPERATION_ROOT_IRI, rpaOperations);

function convertTypeToConcept(
  typeKey: string,
  rpaTree: rpaTaxonomy<RpaBaseType, RpaBaseConcept, RpaBaseInstance>
) {
  // if concept of operation in collection of types, move to collection of concepts
  const newConcept = rpaTree.types[typeKey];
  rpaTree.concepts[typeKey] = {
    type: newConcept.superType!,
    name: newConcept.name,
  };
  delete rpaTree.types[typeKey];
}

function compressId(id: string): string {
  return id.split("#")[1];
}
function extendId(id: string): string {
  return RPA_IRI + "#" + id;
}
