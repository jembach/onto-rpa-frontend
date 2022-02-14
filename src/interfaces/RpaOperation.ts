interface RpaBaseElement {
  name: string;
}

export interface RpaBaseType extends RpaBaseElement {
  superType?: string;
}

export interface RpaBaseConcept extends RpaBaseElement {
  type: string;
}

export interface RpaBaseInstance extends RpaBaseElement {
  concept: string;
}

// ==============
// RPA OPERATIONS

export interface RpaOperationType extends RpaBaseType {}

// "Leaf"-Classes in Ontology as some subclasses of some Operation-class
export interface RpaOperationConcept extends RpaBaseConcept {}

// Individuals in Ontology as children of some Operation-class
export interface RpaOperation extends RpaBaseInstance {
  automates?: RpaSoftware;
}

// ============
// RPA SOFTWARE

export interface RpaSoftwareType extends RpaBaseType {}

export interface RpaSoftwareConcept extends RpaBaseConcept {}

export interface RpaSoftware extends RpaBaseInstance {
  accesses: RpaData;
}

// ========
// RPA DATA

export interface RpaDataType extends RpaBaseType {}

export interface RpaDataConcept extends RpaBaseConcept {}

export interface RpaData extends RpaBaseInstance {}
