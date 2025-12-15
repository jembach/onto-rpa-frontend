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
  PROVIDES = "provides",
  TAKES = "takes",
}

export enum RpaTransientDataAccessType {
  REQUIRES = "requires",
  YIELDS = "yields",
  TRANSFORMS_FROM = "transformsFrom",
  TRANSFORMS_TO = "transformsTo",
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

export interface RpaTransientDataRelation {
  type: RpaTransientDataAccessType;
  data: RpaTransientData;
}

export interface RpaDataResourceRelation {
  type: RpaDataResourceAccessType;
  data: RpaDataResource;
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

// ========
// RPA TRANSIENT DATA

export interface RpaTransientDataType
  extends RpaBaseType<RpaTransientDataType> {}

export interface RpaTransientDataConcept
  extends RpaBaseConcept<RpaTransientDataType> {}

export interface RpaTransientData
  extends RpaBaseInstance<RpaTransientDataConcept> {}

// ========
// RPA DATA RESOURCE

export interface RpaDataResourceType extends RpaBaseType<RpaDataResourceType> {}

export interface RpaDataResourceConcept
  extends RpaBaseConcept<RpaDataResourceType> {}

export interface RpaDataResource
  extends RpaBaseInstance<RpaDataResourceConcept> {}

// ======================
// RPA CONTEXT CONTAINERS

export interface RpaContextContainer extends RpaBaseElement {
  setupSteps: RpaOperation[];
  cleanupSteps: RpaOperation[];
}

// ======================
// RPA FACADE

export interface RpaReuseFacade extends RpaBaseElement {
  automates: RpaSoftware[];
  accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
}

// ======================
// RPA DECORATOR
export interface RpaReuseDecorator extends RpaBaseElement {
  automates: RpaSoftware[];
  accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
  injectionPoints: {
    id: string;
    label: string;
    accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
  }[];
}

// ======================
// RPA PROXY

export interface RpaReuseProxy extends RpaBaseElement {
  automates: RpaSoftware[];
  accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
}

// ======================
// RPA CHAIN OF RESPONSIBILITY

export interface RpaReuseChainOfResponsibility extends RpaBaseElement {
  automates: RpaSoftware[];
  accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
  injectionPoints: {
    id: string;
    label: string;
    accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
  }[];
}

// ======================
// RPA TEMPLATE METHOD

export interface RpaReuseTemplateMethod extends RpaBaseElement {
  automates: RpaSoftware[];
  accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
  injectionPoints: {
    id: string;
    label: string;
    accessedData: (RpaDataResourceRelation | RpaTransientDataRelation)[];
  }[];
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

export type RpaDataResourceTaxonomy = GenericRpaTaxonomy<
  RpaDataResourceType,
  RpaDataResourceConcept,
  RpaDataResource
>;

export type RpaTransientDataTaxonomy = GenericRpaTaxonomy<
  RpaTransientDataType,
  RpaTransientDataConcept,
  RpaTransientData
>;

export type RpaTaxonomy =
  | RpaOperationTaxonomy
  | RpaSoftwareTaxonomy
  | RpaDataTaxonomy
  | RpaDataResourceTaxonomy
  | RpaTransientDataTaxonomy;
