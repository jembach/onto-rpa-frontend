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

// ==============
// RPA OPERATIONS

export interface RpaOperationType extends RpaBaseType<RpaOperationType> {
  bpmoConcept?: string;
}

// "Leaf"-Classes in Ontology as some subclasses of some Operation-class
export interface RpaOperationConcept extends RpaBaseConcept<RpaOperationType> {
  bpmoConcept?: string;
}

// Individuals in Ontology as children of some Operation-class
export interface RpaOperation extends RpaBaseInstance<RpaOperationConcept> {
  bpmoConcept: string;
  automates?: RpaSoftware;
  accesses?: RpaData;
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
