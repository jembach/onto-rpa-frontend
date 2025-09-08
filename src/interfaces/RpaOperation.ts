import { BpmoConcept } from "./BpmoConcepts";

export enum RpaDataResourceAccessType {
  CREATES = "creates",
  DELETES = "deletes",
  CLOSES = "closes",
  PERSISTS = "persists",
  PROVISIONS = "provisions",
  PROVISIONSNEW = "provisionsNew",
  DIRECTLYREADS = "directlyReads",
  IMPLICITLYREADS = "implicitlyReads",
  DIRECTLYWRITES = "directlyWrites",
  IMPLICITLYWRITES = "implicitlyWrites",
}

export enum RpaTransientDataAccessType {
  REQUIRES = "requires",
  YIELDS = "yields",
}

export interface RpaBaseElement {
  id: string;
  iri: string;
  label?: string;
  comment?: string;
}

export interface RpaBaseType<RpaType> extends RpaBaseElement {
  type?: RpaType;
}

export interface RpaBaseConcept<RpaType> extends RpaBaseElement {
  type: RpaType;
}

export interface RpaBaseInstance<RpaConcept> extends RpaBaseElement {
  concept: RpaConcept;
}

export interface RpaDataRelation {
  type: RpaDataResourceAccessType | RpaTransientDataAccessType;
  data: RpaData;
}

// ==============
// RPA OPERATIONS

export interface RpaOperationType extends RpaBaseType<RpaOperationType> {
  bpmoConcept?: BpmoConcept;
}

// "Leaf"-Classes in Ontology as some subclasses of some Operation-class
export interface RpaOperationConcept extends RpaBaseConcept<RpaOperationType> {
  bpmoConcept?: BpmoConcept;
}

// Individuals in Ontology as children of some Operation-class
export interface RpaOperation extends RpaBaseInstance<RpaOperationConcept> {
  bpmoConcept: BpmoConcept;
  automates?: RpaSoftware;
  accessedData: RpaDataRelation[];
}

// ============
// RPA SOFTWARE

export interface RpaSoftwareType extends RpaBaseType<RpaSoftwareType> {}

export interface RpaSoftwareConcept extends RpaBaseConcept<RpaSoftwareType> {}

export interface RpaSoftware extends RpaBaseInstance<RpaSoftwareConcept> {
  supports?: RpaData;
}

// ========
// RPA DATA

export interface RpaDataType extends RpaBaseType<RpaDataType> {}

export interface RpaDataConcept extends RpaBaseConcept<RpaDataType> {}

export interface RpaData extends RpaBaseInstance<RpaDataConcept> {}

// ======================
// RPA CONTEXT CONTAINERS

export interface RpaContextContainer extends RpaBaseElement {
  setupSteps: RpaOperation[];
  cleanupSteps: RpaOperation[];
}

// ======================
// RPA MODULE

export interface RpaModule extends RpaBaseElement {
  automates: RpaSoftware[];
  accessedData: RpaDataRelation[];
}

// ======================
// RPA TEMPLATE

export interface RpaTemplate extends RpaBaseElement {
  automates: RpaSoftware[];
  templatePlaceholders: string[];
}

// ============
// RPA TAXONOMY

interface GenericRpaTaxonomy<A, B, C> {
  types: Record<string, A>;
  concepts: Record<string, B>;
  individuals: Record<string, C>;
}

export type RpaOperationTaxonomy = GenericRpaTaxonomy<
  RpaOperationType,
  RpaOperationConcept,
  RpaOperation
>;

export type RpaSoftwareTaxonomy = GenericRpaTaxonomy<
  RpaSoftwareType,
  RpaSoftwareConcept,
  RpaSoftware
>;

export type RpaDataTaxonomy = GenericRpaTaxonomy<
  RpaDataType,
  RpaDataConcept,
  RpaData
>;

export type RpaTaxonomy =
  | RpaOperationTaxonomy
  | RpaSoftwareTaxonomy
  | RpaDataTaxonomy;
