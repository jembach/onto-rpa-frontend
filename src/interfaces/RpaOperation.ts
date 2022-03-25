interface RpaBaseElement {
  id: string;
  label?: string;
  comment?: string;
}

export interface RpaBaseType extends RpaBaseElement {
  type?: string;
}

export interface RpaBaseConcept extends RpaBaseElement {
  type: string;
}

export interface RpaBaseInstance extends RpaBaseElement {
  concept: string;
}

// ==============
// RPA OPERATIONS

export interface RpaOperationType extends RpaBaseType {
  bpmoConcept?: string;
}

// "Leaf"-Classes in Ontology as some subclasses of some Operation-class
export interface RpaOperationConcept extends RpaBaseConcept {
  bpmoConcept?: string;
}

// Individuals in Ontology as children of some Operation-class
export interface RpaOperation extends RpaBaseInstance {
  bpmoConcept: string;
  automates?: string;
  accesses?: string;
}

// ============
// RPA SOFTWARE

export interface RpaSoftwareType extends RpaBaseType {}

export interface RpaSoftwareConcept extends RpaBaseConcept {}

export interface RpaSoftware extends RpaBaseInstance {
  supports?: string;
}

// ========
// RPA DATA

export interface RpaDataType extends RpaBaseType {}

export interface RpaDataConcept extends RpaBaseConcept {}

export interface RpaData extends RpaBaseInstance {}
