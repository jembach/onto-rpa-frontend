import {
  RpaBaseConcept,
  RpaBaseInstance,
  RpaBaseType,
  RpaOperation,
  RpaOperationConcept,
  RpaOperationType,
  RpaSoftware,
  RpaSoftwareConcept,
  RpaSoftwareType,
} from "../interfaces/RpaOperation";
import rpaOperationsOntology from "../resources/rpa-operations.json";

interface rpaConceptTree<A, B, C> {
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

const individuals = rpaOperationsOntology.forEach((operation) => {
  if (operation["@type"].includes(INDIVIDUAL_IRI)) {
    // console.log(operation["@id"]);
    return operation["@id"];
  }
});

const rpaOperations: rpaConceptTree<
  RpaOperationType,
  RpaOperationConcept,
  RpaOperation
> = {
  types: {},
  concepts: {},
  individuals: {},
};

const rpaSoftware: rpaConceptTree<
  RpaSoftwareType,
  RpaSoftwareConcept,
  RpaSoftware
> = {
  types: {},
  concepts: {},
  individuals: {},
};

function exploreTree(superClassIri: string, rpaTree): void {
  rpaOperationsOntology.forEach((operation) => {
    const superClassId = compress(superClassIri);
    const currentId = compress(operation["@id"]);
    if (
      SUBCLASS_IRI in operation &&
      operation[SUBCLASS_IRI][0]["@id"] === superClassIri
    ) {
      // if a subclass is encountered, add it to the types
      rpaOperations.types[currentId] = {
        name: currentId,
        superType: superClassId,
      };
      exploreTree(operation["@id"]);
    } else if (
      operation["@type"].includes(INDIVIDUAL_IRI) &&
      operation["@type"].includes(superClassIri)
    ) {
      // if an individual is encountered, add it as concrete operation
      if (superClassId in rpaOperations.types) {
        // if concept of operation in collection of types, move to collection of concepts
        const newConcept = rpaOperations.types[superClassId];
        rpaOperations.concepts[superClassId] = {
          type: newConcept.superType!,
          name: currentId,
        };
        delete rpaOperations.types[superClassId];
      }
      rpaOperations.individuals[currentId] = {
        name: currentId,
        concept: superClassId,
      };
    }
  });
}

exploreTree(RPA_OPERATION_ROOT_IRI);

console.log(rpaOperations);

function makeTypeToConcept();

function compress(id: string): string {
  return id.replace(RPA_IRI + "#", "");
}

export default individuals;
